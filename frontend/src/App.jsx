import { useState } from 'react';
import TickerInput from './components/TickerInput';
import BlindSpotGauge from './components/BlindSpotGauge';
import SignalWaterfall from './components/SignalWaterfall';
import ComparisonPanel from './components/ComparisonPanel';
import { analyzeStock } from './api';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (ticker) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeStock(ticker);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-dark-800/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-emerald-600 flex items-center justify-center">
              <span className="text-dark-900 font-bold text-sm">BS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Market Blind Spot
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                Surfaces what the market is pricing wrong
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="px-2 py-1 rounded bg-dark-700 font-mono">Gemini 3</span>
            <span className="px-2 py-1 rounded bg-dark-700">Paris Hackathon 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {/* Hero + Input */}
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            What is the market
            <span className="text-accent-green"> missing</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            6 academic signals that predict returns but are systematically
            ignored by traditional analysis — powered by Gemini AI.
          </p>
          <TickerInput onAnalyze={handleAnalyze} loading={loading} />
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
            <div className="loader-ring"></div>
            <p className="text-gray-400">
              Running signal analysis…
            </p>
            <p className="text-xs text-gray-600">
              Fetching financials → Computing signals → Generating narrative
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card p-6 text-center animate-fade-in max-w-lg mx-auto">
            <p className="text-accent-red text-lg font-semibold mb-2">Analysis Failed</p>
            <p className="text-gray-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="animate-slide-up space-y-8">
            {/* Company Header */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">
                {result.company_name}
                <span className="text-gray-500 font-normal ml-2 text-lg">
                  {result.ticker}
                </span>
              </h3>
              <p className="text-gray-500 text-sm mt-1">{result.sector}</p>
              {result.financial_sector_warning && (
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-900/30 border border-amber-500/30 text-amber-400 text-xs">
                  ⚠️ Financial sector — leverage/profitability signals may be less reliable
                </div>
              )}
            </div>

            {/* Score + Signals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Gauge */}
              <div className="glass-card p-6 flex flex-col items-center justify-center">
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
                  Blind Spot Score
                </h3>
                <BlindSpotGauge
                  score={result.blind_spot_score}
                  label={result.score_label}
                  color={result.score_color}
                />
                <p className="text-sm text-gray-500 mt-4">
                  Dominant signal:{' '}
                  <span className="text-white font-medium">{result.dominant_signal}</span>
                </p>
              </div>

              {/* Right: Waterfall */}
              <SignalWaterfall signals={result.signals} intangiblesWarning={result.intangibles_warning} />
            </div>

            {/* Conventional Metrics */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
                Conventional Metrics (What Wall Street Sees)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="P/E Ratio"
                  value={result.conventional_metrics?.pe_ratio?.toFixed(1) || 'N/A'}
                />
                <MetricCard
                  label="Revenue Growth"
                  value={
                    result.conventional_metrics?.revenue_growth
                      ? `${(result.conventional_metrics.revenue_growth * 100).toFixed(1)}%`
                      : 'N/A'
                  }
                />
                <MetricCard
                  label="Analysis Time"
                  value={`${result.analysis_time_seconds}s`}
                />
                <MetricCard
                  label="Score"
                  value={result.blind_spot_score.toFixed(1)}
                  highlight
                  color={result.score_color}
                />
              </div>
            </div>

            {/* Narratives */}
            <ComparisonPanel
              headline={result.headline}
              blindSpotNarrative={result.blind_spot_narrative}
              conventionalNarrative={result.conventional_narrative}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            Market Blind Spot — Gemini 3 Paris Hackathon 2026
          </p>
          <p className="text-xs text-gray-600">
            Built with yfinance • Flask • React • Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ label, value, highlight, color }) {
  return (
    <div className="p-4 rounded-xl bg-dark-700/50 border border-white/5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`text-xl font-bold font-mono ${highlight ? '' : 'text-white'}`}
        style={highlight ? { color } : {}}
      >
        {value}
      </p>
    </div>
  );
}
