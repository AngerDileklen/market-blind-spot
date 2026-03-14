# Market Blind Spot — Product Requirements Document
# Version 1.0 | Gemini 3 Paris Hackathon 2026

---

## 0. READ THIS FIRST (AI Agent Instructions)

You are an AI coding agent working on this project.
Before writing a single line of code, read this entire file.
Before writing a single line of code, also read project_state.md.
After every successful micro-step, update project_state.md.
If you are ever unsure about a decision, refer back to this file.
This file is the source of truth. It overrides anything you remember
from previous sessions.

---

## 1. Project Identity

Name: Market Blind Spot
Tagline: Surfaces what the market is pricing wrong — and why.
Event: Gemini 3 Paris Hackathon 2026 (Google + Cerebral Valley)
Theme: "Bring Something New to Life"
Team size: Up to 4 members
Demo format: 3 minutes live + 1-2 minutes Q&A

---

## 2. Problem Statement

Investors systematically misprice stocks because they fail to distinguish
between earnings driven by real cash flow and earnings inflated by
accounting accruals. This is the Sloan Accruals Anomaly (1996) — one of
the most replicated findings in academic finance. It has persisted for
30 years despite being publicly documented.

No accessible consumer tool currently:
- Computes accruals and five other academically validated signals live
- Explains the mispricing in plain English
- Compares what the market sees vs. what the signals reveal
- Uses an LLM as a structured narration engine (not a chatbot)

Market Blind Spot fills this gap.

---

## 3. The Product (One Paragraph)

A user enters any US stock ticker. The app pulls real financial data from
yfinance, computes 6 academic signals (accruals, gross profitability,
book-to-market, momentum, leverage, asset growth), scores them into a
single Blind Spot Score (0-100), and uses Gemini 3 to generate a plain-
English narrative explaining what the market is likely missing about that
company and why. A side-by-side comparison panel shows what a conventional
investor would say vs. what the signal model reveals.

---

## 4. Hackathon Rules (HARD CONSTRAINTS — NEVER VIOLATE)

BANNED TOOLS/FRAMEWORKS:
- NO Streamlit (explicitly banned by organizers)
- NO image analyzers
- NO RAG applications
- NO chatbot interfaces
- NO mental health, medical, education, nutrition, or personality tools
- NO AI from non-Google providers (no OpenAI, no Anthropic, no Mistral)

REQUIRED:
- Use ONLY Google AI tools (Gemini API via Google AI Studio)
- Build on open source projects only if you have rights to use them
- GitHub repo must be PUBLIC and open source
- Demo must highlight ONLY what was built during the hackathon
- New work only — no pre-built projects

JUDGING WEIGHTS:
- Live Demo: 45% (most important — it must WORK on stage)
- Creativity and Originality: 35%
- Impact Potential: 20%

---

## 5. Tech Stack (FIXED — DO NOT CHANGE WITHOUT UPDATING THIS FILE)

| Layer        | Technology                          | Version   |
|--------------|-------------------------------------|-----------|
| Backend      | Python + Flask + flask-cors         | 3.11 / latest |
| Data         | yfinance (open source)              | latest    |
| Data fallback| SEC EDGAR public JSON API (no key)  | -         |
| AI           | Gemini 3 via google-genai SDK       | latest    |
| Frontend     | React 18 + Tailwind CSS             | 18 / 3.x  |
| Charts       | Recharts                            | latest    |
| Build tool   | Vite                                | latest    |
| Version ctrl | Git (commit after EVERY micro-step) | -         |

ENVIRONMENT:
- Backend runs on: localhost:5001
- Frontend runs on: localhost:5173
- API key stored in: backend/.env (NEVER commit .env to Git)

---

## 6. Folder Structure (FIXED)
market-blind-spot/
├── PRD.md ← This file
├── project_state.md ← AI long-term memory
├── .gitignore ← Must include .env and node_modules
├── README.md
│
├── backend/
│ ├── app.py ← Flask app, all routes
│ ├── data.py ← yfinance fetcher + cache layer
│ ├── signals.py ← 6 signal computations
│ ├── scorer.py ← Blind Spot Score computation
│ ├── gemini.py ← Gemini narration engine
│ ├── requirements.txt
│ ├── .env ← GEMINI_API_KEY (never commit)
│ └── demo_cache/ ← Pre-cached JSON for 3 demo tickers
│ ├── NFLX.json
│ ├── BRK-B.json
│ ├── MSFT.json
│ ├── NFLX_full.json
│ ├── BRK-B_full.json
│ └── MSFT_full.json
│
└── frontend/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
└── src/
├── App.jsx
├── index.css
├── api.js ← All fetch calls to Flask backend
└── components/
├── TickerInput.jsx
├── BlindSpotGauge.jsx
├── SignalWaterfall.jsx
├── NarrativePanel.jsx
└── ComparisonPanel.jsx

---

## 7. The 6 Signals (EXACT FORMULAS — DO NOT DEVIATE)

### Signal 1: Accruals-to-Assets
Source: Sloan (1996), The Accounting Review
Formula: (Net Income - Operating Cash Flow) / Total Assets
Weight: -0.35 (most important signal)
Direction: Higher accruals = LOWER score (overpriced risk)
Threshold: > 0.05 = high risk | < -0.05 = high quality

### Signal 2: Gross Profitability
Source: Novy-Marx (2013), Journal of Financial Economics
Formula: Gross Profit / Total Assets
Weight: +0.25
Direction: Higher gross profitability = HIGHER score (quality premium)
Threshold: > 0.35 = strong | < 0.15 = weak

### Signal 3: Book-to-Market
Source: Fama & French (1992), Journal of Finance
Formula: 1 / priceToBook (from yfinance info)
Weight: +0.20
Direction: Higher BTM (cheaper stock) = HIGHER score

### Signal 4: 12-1 Month Momentum
Source: Jegadeesh & Titman (1993), Journal of Finance
Formula: (Price_22_days_ago - Price_252_days_ago) / Price_252_days_ago
Weight: +0.10
Direction: Higher past returns = HIGHER score (momentum continuation)

### Signal 5: Leverage
Source: Fama & French (1992), Bhandari (1988)
Formula: Total Debt / Total Assets
Weight: -0.05
Direction: Higher leverage = LOWER score (risk adjustment)

### Signal 6: Asset Growth
Source: Cooper, Gulen & Schill (2008), Journal of Finance
Formula: (Total Assets_t0 - Total Assets_t-1) / Total Assets_t-1
Weight: -0.05
Direction: Higher asset growth = LOWER score (overinvestment risk)

---

## 8. Blind Spot Score Formula

raw_score = sum(weight_k × signal_k × 100) for k in {1..6}
BlindSpotScore = clamp(50 + raw_score, 0, 100)

Labels:
- Score ≥ 70: "Strong Underpriced Signal"  → color: #00d4aa (teal)
- Score ≥ 60: "Moderate Underpriced Signal" → color: #66e0c8
- Score ≥ 45: "Neutral"                    → color: #aaaaaa
- Score ≥ 35: "Moderate Overpriced Signal"  → color: #ff9966
- Score < 35:  "Strong Overpriced Signal"   → color: #ff4d4d

---

## 9. Flask API Endpoints

### POST /analyze
Request:  { "ticker": "AAPL" }
Response: {
  "ticker": "AAPL",
  "company_name": "Apple Inc.",
  "sector": "Technology",
  "blind_spot_score": 42.3,
  "score_label": "Moderate Overpriced Signal",
  "signals": [
    {
      "name": "Accruals Anomaly",
      "value": -0.043,
      "contribution": -15.1,
      "direction": "bearish",
      "description": "High earnings relative to cash flow historically
                       predicts negative future returns (Sloan 1996)."
    },
    ...
  ],
  "dominant_signal": "Accruals Anomaly",
  "narratives": {
    "blind_spot_narrative": "...",
    "conventional_narrative": "..."
  },
  "conventional_metrics": {
    "pe_ratio": 28.4,
    "revenue_growth": 0.062
  }
}
Error: { "error": "Ticker not found" } with status 404

### GET /demo
Returns: { "NFLX": {...}, "BRK-B": {...}, "MSFT": {...} }
These must be loaded from demo_cache JSON files.
NEVER call yfinance or Gemini inside /demo. Cache only.

### GET /health
Returns: { "status": "ok" }

---

## 10. Frontend Design Spec

Background: #0f0f0f
Accent: #00d4aa
Danger: #ff4d4d
Warning: #ff9966
Text primary: #ffffff
Text secondary: #888888
Font: Inter (Google Fonts)
Border radius: 8px
Card background: #1a1a1a
Card border: 1px solid #2a2a2a

Single page layout (top to bottom):
1. Header — "Market Blind Spot" + subtitle
2. TickerInput — search bar + 3 demo buttons
3. Results row — BlindSpotGauge (1/3 width) + SignalWaterfall (2/3 width)
4. ComparisonPanel — two cards side by side (full width)
5. Footer

NO navigation. NO second page. NO login. NO settings.

---

## 11. Gemini Narration Rules

Gemini is NOT a chatbot. It is a structured narration engine.
It receives a JSON object and generates two outputs in ONE API call.

blind_spot_narrative (3 paragraphs):
- Para 1: What the score means for this specific company. Name dominant signal.
- Para 2: Why the market historically misses this signal. Reference the paper.
- Para 3: Two specific things to watch over the next 12 months.
- Tone: Senior equity analyst briefing a portfolio manager.
- NEVER say "I recommend buying/selling"
- ALWAYS reference the academic paper by author and year
- ALWAYS explain the behavioral mechanism, not just the statistic

conventional_narrative (2 paragraphs):
- What a conventional investor using only P/E and revenue growth would say.
- Sound reasonable but incomplete. Standard sell-side note style.
- NEVER mention accruals, gross profitability, or any of our 6 signals.

---

## 12. Demo Preparation Requirements

Three tickers must be pre-cached before demo day:
- NFLX: Expected high accruals scenario (overpriced signal)
- BRK-B: Expected low accruals + high quality (underpriced signal)
- MSFT: Expected neutral case (~50 score)

The /demo endpoint must respond in under 200ms.
The /analyze endpoint for a new ticker must complete in under 8 seconds.
The loading states must show step-by-step feedback (4 steps, 0.8s each).
The app must work fully offline for the 3 demo tickers.

---

## 13. Git Commit Rules (MANDATORY)

Commit after EVERY working micro-step. Use this format:
feat: [what was added]
fix: [what was broken and how it was fixed]
refactor: [what was restructured]

Examples:
  feat: add yfinance data fetcher with cache layer
  feat: compute accruals signal from balance sheet
  fix: handle missing Total Debt field in yfinance
  feat: add Flask /analyze endpoint with full response schema

NEVER commit:
- .env files
- node_modules/
- demo_cache/ JSON files that contain API keys
- Broken code (only commit passing states)

---

## 14. Strict Agent Rules

- NEVER use Streamlit
- NEVER add more than one page
- NEVER add authentication or user accounts
- NEVER use a non-Google AI model
- NEVER call yfinance inside the /demo endpoint
- NEVER leave commented-out legacy code in files
- NEVER hardcode the Gemini API key anywhere except .env
- ALWAYS write explicit error handling for every yfinance fetch
- ALWAYS log a one-line message for every major function call
- ALWAYS update project_state.md after completing a subpart
- ALWAYS check project_state.md at the start of a new session

---

## 15. Academic References (cite these in narration)

[1] Sloan (1996) - Accruals anomaly - The Accounting Review
[2] Novy-Marx (2013) - Gross profitability - JFE
[3] Fama & French (1992) - Book-to-market value factor - JoF
[4] Fama & French (1993) - Three-factor model - JFE
[5] Jegadeesh & Titman (1993) - Momentum - JoF
[6] Cooper, Gulen & Schill (2008) - Asset growth anomaly - JoF
[7] Gu, Kelly & Xiu (2020) - ML in asset pricing - RFS
[8] Hribar & Collins (2002) - Cash-flow-statement accruals - TAR

---

## 16. UI Refresh Session Scope (2026-03-14)

This session applies a bold UI refresh using guidance from ui-skills,
ui-ux-designer, ui-ux-pro-max, and ui-visual-validator.

Hard scope boundaries for this session:
- Keep single-page architecture (no new pages/routes/navigation/login)
- Keep backend signal science and formulas unchanged
- Keep existing core color language and product identity
- Improve hierarchy, readability, interaction quality, and accessibility
- Run strict visual validation across breakpoints and keyboard flow

Mandatory validation gates for this session:
- Focus-visible states on all interactive controls
- WCAG-style contrast checks for primary body text
- Reduced motion fallback support
- Responsive verification at 375 / 768 / 1024 / 1440 widths
- Regression checks for Group 1 and Group 2 UI behaviors

---

## 17. Implemented UI Refresh Outcome (2026-03-14)

Implemented visual updates:
- Global interaction polish (focus-visible, consistent transitions, reduced-motion fallback)
- Stronger hero/header hierarchy and smoother ticker tape rendering
- Improved loading and error state readability
- Input accessibility upgrade (explicit form label and stronger disabled/focus states)
- Responsive score gauge typography and cleaner peer/historical text presentation
- Waterfall responsiveness improvements (compact badge layout + safer tooltip behavior)
- Narrative card refinement (consistent text badges, cleaner VS framing, improved text readability)

Validation evidence captured in this session:
- Frontend diagnostics: no errors in touched UI files
- Frontend production build: passing (`npm run build`)
- Backend compile sanity: passing (`python3 -m py_compile app.py gemini.py`)

Accepted tradeoffs:
- Bundle size warning (>500kB chunk) remains open and non-blocking for demo
- Manual browser breakpoint walkthrough remains part of final pre-demo QA


