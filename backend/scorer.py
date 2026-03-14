"""
scorer.py — Blind Spot Score computation with winsorization.

Applies signal winsorization (clamping to academic bounds) before
computing the weighted composite Blind Spot Score (0-100).
"""

import logging

from signals import SIGNAL_WEIGHTS, SIGNAL_NAMES, SIGNAL_DESCRIPTIONS

logger = logging.getLogger(__name__)

SIGNAL_BOUNDS = {
    "accruals": (-0.20, 0.20),
    "gross_profitability": (0.00, 0.80),
    "book_to_market": (0.00, 3.00),
    "momentum": (-0.60, 1.50),
    "leverage": (0.00, 1.00),
    "asset_growth": (-0.30, 1.00),
}

SCORE_LABELS = [
    (70, "Strong Underpriced Signal", "#00d4aa"),
    (60, "Moderate Underpriced Signal", "#66e0c8"),
    (45, "Neutral", "#aaaaaa"),
    (35, "Moderate Overpriced Signal", "#ff9966"),
    (0, "Strong Overpriced Signal", "#ff4d4d"),
]


def winsorize_signals(signals: dict) -> dict:
    """Clamp each signal to its academic reasonable range.

    Prevents extreme outliers from collapsing the score to 0 or 100.
    """
    return {
        k: max(SIGNAL_BOUNDS[k][0], min(SIGNAL_BOUNDS[k][1], v))
        for k, v in signals.items()
        if k in SIGNAL_BOUNDS
    }


def get_score_label(score: float) -> tuple:
    """Return (label, color) for a given Blind Spot Score."""
    for threshold, label, color in SCORE_LABELS:
        if score >= threshold:
            return label, color
    return "Strong Overpriced Signal", "#ff4d4d"


def compute_blind_spot_score(raw_signals: dict) -> dict:
    """Compute the Blind Spot Score from raw signal values.

    Steps:
      1. Winsorize all signals (clamp to academic bounds)
      2. Compute weighted contributions: weight_k × signal_k × 100
      3. Sum contributions → raw_score
      4. Center at 50 and clamp to [0, 100]
      5. Apply score label

    Returns full scoring output including per-signal contributions.
    """
    winsorized = winsorize_signals(raw_signals)
    logger.info(f"Winsorized signals: {winsorized}")

    contributions = {}
    for key, value in winsorized.items():
        weight = SIGNAL_WEIGHTS.get(key, 0)
        contribution = weight * value * 100
        contributions[key] = {
            "name": SIGNAL_NAMES.get(key, key),
            "value": round(raw_signals[key], 6),
            "contribution": round(contribution, 1),
            "direction": "bullish" if contribution > 0 else "bearish" if contribution < 0 else "neutral",
            "description": SIGNAL_DESCRIPTIONS.get(key, ""),
        }

    raw_score = sum(c["contribution"] for c in contributions.values())
    blind_spot_score = round(max(0, min(100, 50 + raw_score)), 1)
    score_label, score_color = get_score_label(blind_spot_score)

    sorted_signals = sorted(
        contributions.values(),
        key=lambda x: abs(x["contribution"]),
        reverse=True,
    )

    dominant_signal = sorted_signals[0]["name"] if sorted_signals else "N/A"

    logger.info(f"Blind Spot Score: {blind_spot_score} ({score_label}), dominant: {dominant_signal}")

    return {
        "blind_spot_score": blind_spot_score,
        "score_label": score_label,
        "score_color": score_color,
        "signals": sorted_signals,
        "dominant_signal": dominant_signal,
    }
