"""
signals.py — 6 academically validated financial signal computations.

Each signal maps to a primary peer-reviewed paper:
  1. Accruals-to-Assets — Sloan (1996) via Hribar-Collins (2002)
  2. Gross Profitability — Novy-Marx (2013)
  3. Book-to-Market — Fama & French (1992)
  4. 12-1 Month Momentum — Jegadeesh & Titman (1993)
  5. Leverage — Fama & French (1992), Bhandari (1988)
  6. Asset Growth — Cooper, Gulen & Schill (2008)

All computations are wrapped in try/except. Returns 0.0 on missing data.
"""

import logging

from data import get_val

logger = logging.getLogger(__name__)

SIGNAL_WEIGHTS = {
    "accruals": -0.35,
    "gross_profitability": 0.25,
    "book_to_market": 0.20,
    "momentum": 0.10,
    "leverage": -0.03,
    "asset_growth": -0.05,
}

SIGNAL_NAMES = {
    "accruals": "Accruals Anomaly",
    "gross_profitability": "Gross Profitability",
    "book_to_market": "Value Signal",
    "momentum": "Price Momentum",
    "leverage": "Leverage Risk",
    "asset_growth": "Asset Growth Risk",
}

SIGNAL_DESCRIPTIONS = {
    "accruals": "Earnings inflated above cash flow predict negative returns. Hribar & Collins (2002), Sloan (1996).",
    "gross_profitability": "Gross profit per asset dollar signals durable competitive advantage. Novy-Marx (2013).",
    "book_to_market": "Cheap assets relative to market price predict positive returns. Fama & French (1992) — using 1/P-to-B as practical proxy.",
    "momentum": "12-month winners continue to outperform. Skip-month rule applied. Jegadeesh & Titman (1993).",
    "leverage": "High debt-to-assets signals financial distress. Partially subsumed by book-to-market. Fama & French (1992).",
    "asset_growth": "Aggressive asset expansion predicts underperformance. Cooper, Gulen & Schill (2008).",
}

FINANCIAL_KEYWORDS = [
    "Bank", "Insurance", "Financial Services", "REIT",
    "Mortgage", "Asset Management", "Capital Markets",
    "Thrift", "Credit Services", "Diversified Financials",
]


def check_financial_sector(data: dict) -> bool:
    """Check if the company is in the financial sector.

    Financial firms (banks, insurance, REITs) have balance sheets that
    distort leverage, gross profitability, and asset growth signals.
    """
    sector = data.get("info", {}).get("sector", "")
    industry = data.get("info", {}).get("industry", "")

    for kw in FINANCIAL_KEYWORDS:
        if kw.lower() in sector.lower() or kw.lower() in industry.lower():
            logger.warning(f"Financial sector detected: sector={sector}, industry={industry}")
            return True
    return False


def compute_accruals(data: dict) -> float:
    """Signal 1: Accruals-to-Assets.

    Formula: (Net Income - Operating Cash Flow) / Average Total Assets
    Denominator: avg(Total_Assets_t, Total_Assets_t-1) — NOT current year alone.
    Source: Sloan (1996), Hribar & Collins (2002) cash-flow approach.
    """
    try:
        net_income = get_val(data["income_stmt"], "Net Income", 0)
        op_cf = get_val(data["cashflow"], "Operating Cash Flow", 0)
        total_assets = get_val(data["balance_sheet"], "Total Assets", 0)
        total_assets_prev = get_val(data["balance_sheet"], "Total Assets", 1)

        if any(v is None for v in [net_income, op_cf, total_assets, total_assets_prev]):
            logger.warning(f"Missing data for accruals computation, ticker={data.get('ticker')}")
            return 0.0

        avg_assets = (total_assets + total_assets_prev) / 2
        if avg_assets == 0:
            return 0.0

        accruals = (net_income - op_cf) / avg_assets
        return accruals
    except Exception as e:
        logger.warning(f"Accruals computation failed: {e}")
        return 0.0


def compute_gross_profitability(data: dict) -> float:
    """Signal 2: Gross Profitability.

    Formula: Gross Profit / Total Assets (current year, NOT lagged)
    Source: Novy-Marx (2013), Journal of Financial Economics.
    """
    try:
        gross_profit = get_val(data["income_stmt"], "Gross Profit", 0)
        total_assets = get_val(data["balance_sheet"], "Total Assets", 0)

        if any(v is None for v in [gross_profit, total_assets]):
            logger.warning(f"Missing data for gross profitability, ticker={data.get('ticker')}")
            return 0.0

        if total_assets == 0:
            return 0.0

        return gross_profit / total_assets
    except Exception as e:
        logger.warning(f"Gross profitability computation failed: {e}")
        return 0.0


def compute_book_to_market(data: dict) -> float:
    """Signal 3: Book-to-Market.

    Formula: 1 / priceToBook (from yfinance info dict)
    Practical proxy for Fama-French (1992) book-to-market equity.
    """
    try:
        ptb = data.get("info", {}).get("priceToBook")
        if ptb is None or ptb <= 0:
            logger.warning(f"Missing/invalid priceToBook for ticker={data.get('ticker')}")
            return 0.0

        return 1.0 / ptb
    except Exception as e:
        logger.warning(f"Book-to-market computation failed: {e}")
        return 0.0


def compute_momentum(data: dict) -> float:
    """Signal 4: 12-1 Month Momentum.

    Formula: (Price_t-44 - Price_t-252) / Price_t-252
    CRITICAL: End price is iloc[-44] (skip most recent month), NOT iloc[-22].
    Source: Jegadeesh & Titman (1993), Journal of Finance.
    """
    try:
        hist = data.get("hist_close", [])
        if len(hist) < 260:
            logger.warning(f"Insufficient price history for momentum: {len(hist)} points, need 260, ticker={data.get('ticker')}")
            return 0.0

        price_end = hist[-44]
        price_start = hist[-252]

        if price_start is None or price_start <= 0:
            return 0.0

        momentum = (price_end - price_start) / price_start
        return momentum
    except Exception as e:
        logger.warning(f"Momentum computation failed: {e}")
        return 0.0


def compute_leverage(data: dict) -> float:
    """Signal 5: Leverage.

    Formula: Total Debt / Total Assets
    Try "Total Debt" first, fallback to "Long Term Debt".
    Source: Fama & French (1992), Bhandari (1988).
    Note: Largely subsumed by book-to-market in multivariate models.
    """
    try:
        total_assets = get_val(data["balance_sheet"], "Total Assets", 0)
        if total_assets is None or total_assets == 0:
            return 0.0

        total_debt = get_val(data["balance_sheet"], "Total Debt", 0)
        if total_debt is None:
            total_debt = get_val(data["balance_sheet"], "Long Term Debt", 0)
        if total_debt is None:
            logger.warning(f"No debt data for leverage, ticker={data.get('ticker')}")
            return 0.0

        return total_debt / total_assets
    except Exception as e:
        logger.warning(f"Leverage computation failed: {e}")
        return 0.0


def compute_asset_growth(data: dict) -> float:
    """Signal 6: Asset Growth.

    Formula: (Total Assets_t - Total Assets_t-1) / Total Assets_t-1
    Source: Cooper, Gulen & Schill (2008), Journal of Finance.
    """
    try:
        total_assets = get_val(data["balance_sheet"], "Total Assets", 0)
        total_assets_prev = get_val(data["balance_sheet"], "Total Assets", 1)

        if any(v is None for v in [total_assets, total_assets_prev]):
            logger.warning(f"Missing data for asset growth, ticker={data.get('ticker')}")
            return 0.0

        if total_assets_prev == 0:
            return 0.0

        return (total_assets - total_assets_prev) / total_assets_prev
    except Exception as e:
        logger.warning(f"Asset growth computation failed: {e}")
        return 0.0


def compute_all_signals(data: dict) -> dict:
    """Compute all 6 signals and return with metadata.

    Returns dict with signal values, financial sector warning,
    and conventional metrics for the comparison panel.
    """
    financial_warning = check_financial_sector(data)

    signals = {
        "accruals": compute_accruals(data),
        "gross_profitability": compute_gross_profitability(data),
        "book_to_market": compute_book_to_market(data),
        "momentum": compute_momentum(data),
        "leverage": compute_leverage(data),
        "asset_growth": compute_asset_growth(data),
    }

    info = data.get("info", {})
    conventional_metrics = {
        "pe_ratio": info.get("trailingPE"),
        "revenue_growth": info.get("revenueGrowth"),
    }

    return {
        "signals": signals,
        "financial_sector_warning": financial_warning,
        "conventional_metrics": conventional_metrics,
    }
