"""
data.py — yfinance data fetcher with in-memory cache layer.

Fetches income statement, balance sheet, cash flow statement,
company info, and 2-year price history for any US stock ticker.
All field accesses are wrapped in try/except to handle missing data.
"""

import json
import logging
import os
from pathlib import Path

import yfinance as yf

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

_cache = {}

DEMO_CACHE_DIR = Path(__file__).parent / "demo_cache"


def fetch_stock_data(ticker: str) -> dict:
    """Fetch financial data for a ticker from yfinance with caching."""
    ticker_upper = ticker.upper().strip()

    if ticker_upper in _cache:
        logger.info(f"Cache hit for {ticker_upper}")
        return _cache[ticker_upper]

    logger.info(f"Fetching yfinance data for {ticker_upper}")

    try:
        stock = yf.Ticker(ticker_upper)
        info = stock.info or {}

        if not info.get("shortName") and not info.get("longName"):
            logger.warning(f"Ticker {ticker_upper} returned no company name — may be invalid")
            return None

        income_stmt = stock.income_stmt
        balance_sheet = stock.balance_sheet
        cashflow = stock.cashflow
        hist = stock.history(period="2y")

        if income_stmt is None or income_stmt.empty:
            logger.warning(f"No income statement data for {ticker_upper}")
            return None

        if balance_sheet is None or balance_sheet.empty:
            logger.warning(f"No balance sheet data for {ticker_upper}")
            return None

        data = {
            "ticker": ticker_upper,
            "info": info,
            "income_stmt": _df_to_dict(income_stmt),
            "balance_sheet": _df_to_dict(balance_sheet),
            "cashflow": _df_to_dict(cashflow) if cashflow is not None else {},
            "hist_close": hist["Close"].tolist() if not hist.empty else [],
            "hist_dates": [str(d) for d in hist.index.tolist()] if not hist.empty else [],
        }

        _cache[ticker_upper] = data
        logger.info(f"Successfully fetched data for {ticker_upper} — {len(data['hist_close'])} price points")
        return data

    except Exception as e:
        logger.error(f"Failed to fetch data for {ticker_upper}: {e}")
        return None


def _df_to_dict(df) -> dict:
    """Convert a yfinance DataFrame to a serializable dict.

    yfinance returns DataFrames with row labels as financial line items
    and columns as dates. We convert to {row_label: [col0_val, col1_val, ...]}.
    """
    result = {}
    for row_label in df.index:
        values = []
        for val in df.loc[row_label]:
            try:
                if val is not None and str(val) != "nan":
                    values.append(float(val))
                else:
                    values.append(None)
            except (ValueError, TypeError):
                values.append(None)
        result[str(row_label)] = values
    return result


def save_raw_cache(ticker: str, data: dict) -> None:
    """Save raw financial data to demo cache directory."""
    DEMO_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    filepath = DEMO_CACHE_DIR / f"{ticker.upper()}.json"
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2, default=str)
    logger.info(f"Saved raw cache for {ticker.upper()} to {filepath}")


def save_full_cache(ticker: str, full_response: dict) -> None:
    """Save full /analyze response to demo cache directory."""
    DEMO_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    filepath = DEMO_CACHE_DIR / f"{ticker.upper()}_full.json"
    with open(filepath, "w") as f:
        json.dump(full_response, f, indent=2, default=str)
    logger.info(f"Saved full cache for {ticker.upper()} to {filepath}")


def load_demo_cache() -> dict:
    """Load all pre-cached demo ticker responses from demo_cache/ directory."""
    demo_data = {}

    if not DEMO_CACHE_DIR.exists():
        logger.warning("demo_cache directory does not exist")
        return demo_data

    for filepath in DEMO_CACHE_DIR.glob("*_full.json"):
        ticker = filepath.stem.replace("_full", "")
        try:
            with open(filepath, "r") as f:
                demo_data[ticker] = json.load(f)
            logger.info(f"Loaded demo cache for {ticker}")
        except Exception as e:
            logger.error(f"Failed to load demo cache {filepath}: {e}")

    return demo_data


def get_val(data_dict: dict, key: str, index: int = 0, default=None):
    """Safely get a value from the converted DataFrame dict.

    Args:
        data_dict: The dict from _df_to_dict (e.g., balance_sheet dict)
        key: The row label to look up (e.g., "Total Assets")
        index: Which column (0 = most recent, 1 = prior year)
        default: Value to return if key or index is missing
    """
    try:
        values = data_dict.get(key)
        if values is None:
            return default
        if index >= len(values):
            return default
        val = values[index]
        return val if val is not None else default
    except (KeyError, IndexError, TypeError):
        return default
