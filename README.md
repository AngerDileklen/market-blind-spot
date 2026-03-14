# Market Blind Spot

Market Blind Spot is a web application that surfaces what the market is pricing incorrectly. It analyzes 6 academic financial signals that predict stock returns but are systematically ignored by traditional analysis, and uses Gemini AI to synthesize both a "Blind Spot" narrative and a "Conventional" narrative.

## Features
- **Live Analysis**: Enter any US stock ticker to fetch live financial data from `yfinance`.
- **Pre-cached Demo**: Instantly view analysis for NFLX, BRK-B, MSFT, and TSLA without hitting APIs.
- **6 Academic Signals**:
  - **Accruals Anomaly** (Hribar & Collins 2002)
  - **Gross Profitability** (Novy-Marx 2013)
  - **Value Signal** (Fama & French 1992)
  - **Price Momentum** (Jegadeesh & Titman 1993)
  - **Leverage Risk** (Fama & French 1992)
  - **Asset Growth Risk** (Cooper, Gulen & Schill 2008)
- **Blind Spot Score**: A composite score ranging from 0 (Strong Overpriced Signal) to 100 (Strong Underpriced Signal).
- **Dual Narratives**: Gemini 2.0 Flash contrasts conventional market wisdom against academic blind spot signals.

## Project Structure
- `backend/`: Flask API, yfinance data pipelines, and Gemini integration.
- `frontend/`: React + Vite frontend using Tailwind CSS and Recharts for data visualization.

## Getting Started

### Backend Setup
1. `cd backend`
2. `python3 -m venv venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. Create a `.env` file and add your `GEMINI_API_KEY`.
6. Run the server: `python app.py` (runs on port 5001)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Run the dev server: `npm run dev` (runs on port 3000)

## Demo
Navigate to `http://localhost:3000` and use the quick-select buttons to view pre-cached analysis for popular tickers.

---
Built with Flask, React, yfinance, and Gemini AI.
