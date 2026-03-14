import { useState } from 'react';

const DEMO_TICKERS = ['NFLX', 'BRK-B', 'MSFT', 'TSLA'];

export default function TickerInput({ onAnalyze, loading }) {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = ticker.trim().toUpperCase();
    if (clean && !loading) {
      onAnalyze(clean);
    }
  };

  return (
    <div id="ticker-input-section" className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 input-glow rounded-xl transition-all">
          <input
            id="ticker-input"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="What is the market getting wrong about..."
            disabled={loading}
            className="w-full px-5 py-4 bg-dark-700 border border-white/10 rounded-xl
                       text-lg text-white placeholder-gray-500 font-mono
                       focus:outline-none focus:border-accent-green/50
                       disabled:opacity-50 transition-all"
          />
        </div>
        <button
          id="analyze-button"
          type="submit"
          disabled={loading || !ticker.trim()}
          className="px-8 py-4 bg-gradient-to-r from-accent-green to-emerald-500
                     text-dark-900 font-semibold text-lg rounded-xl
                     hover:shadow-lg hover:shadow-accent-green/25
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-300 whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="loader-ring w-5 h-5 border-2 border-dark-900/30 border-t-dark-900"></span>
              Analyzing…
            </span>
          ) : (
            'Analyze'
          )}
        </button>
      </form>

      {/* Demo ticker buttons */}
      <div className="flex items-center gap-3 mt-4 justify-center">
        <span className="text-sm text-gray-500">Try demo:</span>
        {DEMO_TICKERS.map((t) => (
          <button
            key={t}
            id={`demo-${t}`}
            onClick={() => { setTicker(t); onAnalyze(t); }}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-mono text-gray-400 bg-dark-700
                       border border-white/5 rounded-lg
                       hover:text-accent-green hover:border-accent-green/30
                       disabled:opacity-40 transition-all"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
