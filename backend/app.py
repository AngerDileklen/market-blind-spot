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
    score_result = compute_blind_spot_score(signal_result["signals"], sector)

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
        "signals": score_result["signals"],
        "conventional_metrics": signal_result["conventional_metrics"],
        "financial_sector_warning": signal_result["financial_sector_warning"],
        "intangibles_warning": signal_result.get("intangibles_warning", False),
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
            logger.warning(f"Demo cache missing for {ticker}, generating live")
            try:
                results[ticker] = run_full_analysis(ticker)
            except Exception as e:
                results[ticker] = {"error": str(e), "ticker": ticker}

    if requested:
        if requested in results:
            return jsonify(results[requested])
        return jsonify({"error": f"Demo ticker {requested} not found"}), 404

    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
