"""
app.py — Flask API for Market Blind Spot.

Endpoints:
  POST /analyze   — Full analysis for any US ticker
  GET  /demo      — Pre-cached results for demo tickers
  GET  /health    — Health check
"""

import json
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError, as_completed

from flask import Flask, jsonify, request
from flask_cors import CORS

from data import fetch_stock_data, load_demo_cache
from signals import compute_all_signals
from scorer import compute_blind_spot_score
from gemini import generate_narratives

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

DEMO_TICKERS = ["NFLX", "BRK-B", "MSFT", "TSLA"]
DEMO_CACHE_DIR = os.path.join(os.path.dirname(__file__), "demo_cache")

SECTOR_PEERS = {
    "technology": ["MSFT", "AAPL", "NVDA", "GOOGL", "META", "ORCL", "ADBE", "CRM", "AMD", "INTC", "NOW", "PLTR"],
    "software": ["MSFT", "ORCL", "ADBE", "CRM", "NOW", "INTU", "SNOW", "DDOG", "PANW", "MDB", "TEAM", "ZS"],
    "financial": ["JPM", "BAC", "WFC", "C", "GS", "MS", "BLK", "AXP", "SCHW", "USB", "PNC", "BK"],
    "healthcare": ["JNJ", "PFE", "MRK", "LLY", "ABBV", "TMO", "UNH", "DHR", "BMY", "AMGN", "GILD", "ISRG"],
    "consumer": ["AMZN", "WMT", "COST", "HD", "MCD", "NKE", "SBUX", "TGT", "LOW", "BKNG", "TJX", "CMG"],
    "default": ["MSFT", "AAPL", "GOOGL", "AMZN", "META", "NVDA", "JPM", "JNJ", "WMT", "PG", "XOM", "UNH"],
}


def _select_peer_list(sector: str) -> tuple[list[str], str]:
    sector_lower = (sector or "").lower()
    for key in ["software", "technology", "financial", "healthcare", "consumer"]:
        if key in sector_lower:
            return SECTOR_PEERS[key], sector
    return SECTOR_PEERS["default"], sector or "Market"


def _peer_score(ticker: str) -> float | None:
    try:
        peer_data = fetch_stock_data(ticker)
        if not peer_data or "error" in peer_data:
            return None
        peer_signal_result = compute_all_signals(peer_data)
        peer_sector = peer_data.get("info", {}).get("sector", "")
        peer_score = compute_blind_spot_score(
            peer_signal_result["signals"],
            peer_sector,
            peer_signal_result.get("signal_confidence"),
        )
        return peer_score["blind_spot_score"]
    except Exception:
        return None


def _compute_peer_comparison(sector: str, ticker: str, blind_spot_score: float) -> dict | None:
    peers, sector_label = _select_peer_list(sector)
    peers = [p for p in peers if p != ticker.upper()][:15]
    if not peers:
        return None

    peer_scores = []
    with ThreadPoolExecutor(max_workers=min(6, len(peers))) as executor:
        futures = {executor.submit(_peer_score, p): p for p in peers}
        try:
            for future in as_completed(futures, timeout=3):
                score = future.result()
                if score is not None:
                    peer_scores.append(score)
        except TimeoutError:
            logger.info(f"Peer comparison timed out for {ticker.upper()} after 3s; returning partial/empty data")

    if not peer_scores:
        return None

    rank = sum(1 for s in peer_scores if blind_spot_score >= s) + 1
    total = len(peer_scores) + 1
    percentile_rank = round((rank / total) * 100)

    return {
        "percentile_rank": percentile_rank,
        "peer_count": len(peer_scores),
        "sector": sector_label or "Market",
    }


def run_full_analysis(ticker: str) -> dict:
    """Run the complete Market Blind Spot pipeline for a ticker.

    Returns the full analysis dict or raises an exception.
    """
    t0 = time.time()

    # Step 1: Fetch financial data
    data = fetch_stock_data(ticker)
    if "error" in data:
        return {"error": data["error"], "ticker": ticker.upper()}

    # Step 2: Compute signals
    signal_result = compute_all_signals(data)

    # Step 3: Sector
    info = data.get("info", {})
    sector = info.get("sector", "Unknown")

    # Step 4: Score
    score_result = compute_blind_spot_score(
        signal_result["signals"],
        sector,
        signal_result.get("signal_confidence"),
    )

    # Step 5: Generate narratives
    company_name = info.get("shortName", info.get("longName", ticker.upper()))

    narratives = generate_narratives(
        ticker=ticker.upper(),
        company_name=company_name,
        sector=sector,
        score=score_result["blind_spot_score"],
        score_label=score_result["score_label"],
        dominant_signal=score_result["dominant_signal"],
        signals=score_result["signals"],
        conventional_metrics=signal_result["conventional_metrics"],
        financial_sector_warning=signal_result["financial_sector_warning"],
    )

    peer_comparison = _compute_peer_comparison(
        sector=sector,
        ticker=ticker,
        blind_spot_score=score_result["blind_spot_score"],
    )

    elapsed = round(time.time() - t0, 2)
    logger.info(f"Full analysis for {ticker.upper()} completed in {elapsed}s")

    return {
        "ticker": ticker.upper(),
        "company_name": company_name,
        "sector": sector,
        "blind_spot_score": score_result["blind_spot_score"],
        "score_label": score_result["score_label"],
        "score_color": score_result["score_color"],
        "dominant_signal": score_result["dominant_signal"],
        "sector_adjusted_weights": score_result.get("sector_adjusted_weights", False),
        "signals": score_result["signals"],
        "conventional_metrics": signal_result["conventional_metrics"],
        "financial_sector_warning": signal_result["financial_sector_warning"],
        "intangibles_warning": signal_result.get("intangibles_warning", False),
        "peer_comparison": peer_comparison,
        "headline": narratives.get("headline", ""),
        "blind_spot_narrative": narratives["blind_spot_narrative"],
        "conventional_narrative": narratives["conventional_narrative"],
        "analysis_time_seconds": elapsed,
    }


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "market-blind-spot"})


@app.route("/analyze", methods=["POST"])
def analyze():
    """Full analysis endpoint.

    Expects JSON: {"ticker": "AAPL"}
    Returns: full analysis result or error.
    """
    body = request.get_json(silent=True)
    if not body or "ticker" not in body:
        return jsonify({"error": "Missing 'ticker' in request body"}), 400

    ticker = body["ticker"].strip().upper()
    if not ticker or len(ticker) > 10:
        return jsonify({"error": "Invalid ticker format"}), 400

    try:
        result = run_full_analysis(ticker)
        if "error" in result:
            return jsonify(result), 404
        return jsonify(result)
    except Exception as e:
        logger.exception(f"Analysis failed for {ticker}")
        return jsonify({"error": f"Analysis failed: {str(e)}", "ticker": ticker}), 500


@app.route("/demo", methods=["GET"])
def demo():
    """Return pre-cached demo results for fast loading.

    Query param: ?ticker=NFLX (optional, returns all if omitted)
    """
    requested = request.args.get("ticker", "").strip().upper()

    results = {}
    for ticker in DEMO_TICKERS:
        if requested and ticker != requested:
            continue

        cache_file = os.path.join(DEMO_CACHE_DIR, f"{ticker}_full.json")
        if os.path.exists(cache_file):
            with open(cache_file, "r") as f:
                results[ticker] = json.load(f)
        else:
            logger.warning(f"Demo cache missing for {ticker}; returning cache-missing response")
            results[ticker] = {
                "error": f"Demo cache missing for {ticker}",
                "ticker": ticker,
            }

    if requested:
        if requested in results:
            return jsonify(results[requested])
        return jsonify({"error": f"Demo ticker {requested} not found"}), 404

    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
