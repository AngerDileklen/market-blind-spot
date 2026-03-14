"""
gemini.py — Gemini dual-narrative engine.

Generates both blind_spot_narrative and conventional_narrative
in a single Gemini API call. Uses structured prompting with
signal data to produce analyst-grade narration.

Uses google-genai SDK with the most advanced available Gemini model.
"""

import json
import logging
import os

from dotenv import load_dotenv
from google import genai

load_dotenv()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

NARRATION_PROMPT = """You are a senior equity analyst writing two distinct narratives about {company_name} ({ticker}).

SIGNAL DATA PROVIDED TO YOU:
{signal_json}

Blind Spot Score: {score} / 100 ({score_label})
Dominant Signal: {dominant_signal}
Sector: {sector}
{financial_warning_text}

TASK: Generate three distinct sections in a single response, separated by the exact delimiter "---SPLIT---".

===== PART 1: HEADLINE (1 sentence) =====
Write one single sentence, maximum 20 words, stating the single most important insight from the signal data.
Written in plain English, not academic language.
Example: "Cash generation is outpacing reported earnings — the market may be discounting the wrong number."

===== PART 2: BLIND SPOT NARRATIVE (3 paragraphs) =====

Paragraph 1: State the Blind Spot Score of {score} and what it means for {company_name}. Name the dominant signal "{dominant_signal}" explicitly and explain its current reading.

Paragraph 2: Explain why the market historically fails to price this signal. Use THESE EXACT ACADEMIC CITATIONS based on the dominant signal:
- If Accruals: "Hribar and Collins (2002) cash-flow approach to the accruals anomaly originally documented by Sloan (1996)"
- If Gross Profitability: "Novy-Marx (2013)"
- If Value Signal: "Fama and French (1992) value premium, using 1/price-to-book as a practical proxy for book-to-market equity"
- If Price Momentum: "Jegadeesh and Titman (1993) 12-1 month momentum, skipping the most recent month to avoid short-term reversal"
- If Asset Growth: "Cooper, Gulen and Schill (2008) asset growth anomaly — firms growing assets aggressively tend to underperform"
- If Leverage: "included as a financial distress signal; note that Fama and French (1992) show standalone leverage is largely subsumed by book-to-market in multivariate models"
Explain the BEHAVIORAL MECHANISM (why investors make this mistake), not just the statistic.

Paragraph 3: Name exactly two specific things about {company_name} to monitor over the next 12 months that relate to the signal readings.

Tone: Senior equity analyst briefing a portfolio manager. Specific, confident, grounded in the data.
NEVER say "buy" or "sell." NEVER use generic disclaimers. NEVER use phrases like "in conclusion" or "overall."

===== PART 3: CONVENTIONAL NARRATIVE (2 paragraphs) =====

Write what a conventional sell-side analyst using ONLY P/E ratio ({pe_ratio}) and revenue growth ({revenue_growth}) would say about {company_name}.
Sound reasonable but incomplete. Standard sell-side note style.
NEVER mention accruals, gross profitability, book-to-market, momentum, leverage risk, or asset growth in this narrative.
NEVER reference any of the 6 academic signals. Only discuss P/E, revenue growth, market position, and industry trends.

===== FORMAT =====
Write Part 1 first, then "---SPLIT---", then Part 2, then "---SPLIT---", then Part 3.
No headers, no labels, just the narrative text.
"""

FALLBACK_HEADLINE = "Analysis complete — reviewing key signal drivers against consensus."

FALLBACK_BLIND_SPOT = "Market Blind Spot analysis detected notable signal divergences for this company. The Blind Spot Score suggests the market may be mispricing key fundamentals that academic research has shown to predict future returns. Further analysis is recommended to understand the specific drivers."

FALLBACK_CONVENTIONAL = "Based on standard valuation metrics, this company presents a mixed picture. Revenue growth and P/E ratios suggest the market has priced in near-term expectations, though investors should monitor upcoming earnings for confirmation of current trends."


def generate_narratives(
    ticker: str,
    company_name: str,
    sector: str,
    score: float,
    score_label: str,
    dominant_signal: str,
    signals: list,
    conventional_metrics: dict,
    financial_sector_warning: bool = False,
) -> dict:
    """Generate both narratives using a single Gemini API call.

    Returns:
        {"blind_spot_narrative": "...", "conventional_narrative": "..."}
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-key-here":
        logger.warning("Gemini API key not configured — returning placeholder narratives")
        return {
            "headline": FALLBACK_HEADLINE,
            "blind_spot_narrative": FALLBACK_BLIND_SPOT,
            "conventional_narrative": FALLBACK_CONVENTIONAL,
        }

    signal_json = json.dumps(signals, indent=2)
    pe_ratio = conventional_metrics.get("pe_ratio", "N/A")
    revenue_growth = conventional_metrics.get("revenue_growth", "N/A")
    if isinstance(revenue_growth, float):
        revenue_growth = f"{revenue_growth:.1%}"

    financial_warning_text = ""
    if financial_sector_warning:
        financial_warning_text = "WARNING: This is a financial sector company. Leverage and profitability signals are not calibrated for financial institutions."

    prompt = NARRATION_PROMPT.format(
        company_name=company_name,
        ticker=ticker,
        signal_json=signal_json,
        score=score,
        score_label=score_label,
        dominant_signal=dominant_signal,
        sector=sector,
        financial_warning_text=financial_warning_text,
        pe_ratio=pe_ratio,
        revenue_growth=revenue_growth,
    )

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )

        full_text = response.text.strip()

        if "---SPLIT---" in full_text:
            parts = full_text.split("---SPLIT---")
            if len(parts) >= 3:
                headline = parts[0].strip()
                blind_spot = parts[1].strip()
                conventional = parts[2].strip()
            elif len(parts) == 2:
                headline = FALLBACK_HEADLINE
                blind_spot = parts[0].strip()
                conventional = parts[1].strip()
            else:
                headline = FALLBACK_HEADLINE
                blind_spot = parts[0].strip()
                conventional = FALLBACK_CONVENTIONAL
        else:
            headline = FALLBACK_HEADLINE
            blind_spot = full_text
            conventional = FALLBACK_CONVENTIONAL

        logger.info(f"Gemini narratives generated for {ticker} ({len(blind_spot)} + {len(conventional)} chars)")

        return {
            "headline": headline,
            "blind_spot_narrative": blind_spot,
            "conventional_narrative": conventional,
        }

    except Exception as e:
        logger.error(f"Gemini API call failed for {ticker}: {e}")
        return {
            "headline": FALLBACK_HEADLINE,
            "blind_spot_narrative": FALLBACK_BLIND_SPOT,
            "conventional_narrative": FALLBACK_CONVENTIONAL,
        }
