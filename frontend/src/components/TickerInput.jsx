import { useEffect, useMemo, useRef, useState } from 'react';

const DEMO_TICKERS = ['NFLX', 'BRK-B', 'MSFT', 'TSLA'];
const TICKER_SUGGESTIONS = [
  { ticker: 'AAPL', company: 'Apple Inc.' },
  { ticker: 'MSFT', company: 'Microsoft Corporation' },
  { ticker: 'GOOGL', company: 'Alphabet Inc.' },
  { ticker: 'AMZN', company: 'Amazon.com, Inc.' },
  { ticker: 'META', company: 'Meta Platforms, Inc.' },
  { ticker: 'NVDA', company: 'NVIDIA Corporation' },
  { ticker: 'TSLA', company: 'Tesla, Inc.' },
  { ticker: 'NFLX', company: 'Netflix, Inc.' },
  { ticker: 'BRK-B', company: 'Berkshire Hathaway Inc.' },
  { ticker: 'JPM', company: 'JPMorgan Chase & Co.' },
  { ticker: 'V', company: 'Visa Inc.' },
  { ticker: 'MA', company: 'Mastercard Incorporated' },
  { ticker: 'UNH', company: 'UnitedHealth Group Incorporated' },
  { ticker: 'JNJ', company: 'Johnson & Johnson' },
  { ticker: 'XOM', company: 'Exxon Mobil Corporation' },
  { ticker: 'PG', company: 'The Procter & Gamble Company' },
  { ticker: 'HD', company: 'The Home Depot, Inc.' },
  { ticker: 'COST', company: 'Costco Wholesale Corporation' },
  { ticker: 'ADBE', company: 'Adobe Inc.' },
  { ticker: 'CRM', company: 'Salesforce, Inc.' },
  { ticker: 'ORCL', company: 'Oracle Corporation' },
  { ticker: 'AMD', company: 'Advanced Micro Devices, Inc.' },
  { ticker: 'INTC', company: 'Intel Corporation' },
  { ticker: 'PLTR', company: 'Palantir Technologies Inc.' },
  { ticker: 'BAC', company: 'Bank of America Corporation' },
  { ticker: 'WMT', company: 'Walmart Inc.' },
  { ticker: 'KO', company: 'The Coca-Cola Company' },
  { ticker: 'PEP', company: 'PepsiCo, Inc.' },
  { ticker: 'DIS', company: 'The Walt Disney Company' },
  { ticker: 'PFE', company: 'Pfizer Inc.' },
];

export default function TickerInput({ onAnalyze, loading }) {
  const [ticker, setTicker] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  const filteredSuggestions = useMemo(() => {
    const query = ticker.trim().toUpperCase();
    if (!query) return [];

    return TICKER_SUGGESTIONS
      .filter(({ ticker: symbol, company }) => {
        const symbolMatch = symbol.includes(query);
        const companyMatch = company.toUpperCase().includes(query);
        return symbolMatch || companyMatch;
      })
      .slice(0, 8);
  }, [ticker]);

  useEffect(() => {
    if (!filteredSuggestions.length) {
      setActiveIndex(-1);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setActiveIndex(0);
  }, [filteredSuggestions]);

  const applySuggestion = (symbol) => {
    setTicker(symbol);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (!isOpen || !filteredSuggestions.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredSuggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? filteredSuggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === 'Enter') {
      if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
        event.preventDefault();
        applySuggestion(filteredSuggestions[activeIndex].ticker);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

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
        <div className="flex-1 input-glow rounded-xl transition-all relative">
          <label htmlFor="ticker-input" className="sr-only">Stock ticker</label>
          <input
            ref={inputRef}
            id="ticker-input"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              setTimeout(() => {
                setIsOpen(false);
                setActiveIndex(-1);
              }, 120);
            }}
            onFocus={() => {
              if (filteredSuggestions.length) {
                setIsOpen(true);
              }
            }}
            placeholder="What is the market getting wrong about..."
            disabled={loading}
            role="combobox"
            aria-expanded={isOpen && filteredSuggestions.length > 0}
            aria-controls="ticker-suggestion-list"
            aria-autocomplete="list"
            aria-activedescendant={
              isOpen && activeIndex >= 0 ? `ticker-option-${activeIndex}` : undefined
            }
            className="w-full px-5 py-4 bg-dark-700 border border-white/10 rounded-xl
                       text-base md:text-lg text-white placeholder-gray-500 font-mono
                       focus:outline-none focus:border-accent-green/50
                       focus-visible:ring-2 focus-visible:ring-accent-green/40
                       disabled:opacity-50 transition-all"
          />
          {isOpen && filteredSuggestions.length > 0 && (
            <ul
              id="ticker-suggestion-list"
              role="listbox"
              className="absolute z-40 left-0 right-0 mt-2 bg-dark-700/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden"
            >
              {filteredSuggestions.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={`${item.ticker}-${item.company}`}
                    id={`ticker-option-${index}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applySuggestion(item.ticker)}
                    className={`px-4 py-3 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors ${
                      isActive ? 'bg-accent-green/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold font-mono text-white">{item.ticker}</span>
                      <span className="text-xs text-gray-400 truncate">{item.company}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <button
          id="analyze-button"
          type="submit"
          disabled={loading || !ticker.trim()}
          className="px-8 py-4 bg-gradient-to-r from-accent-green to-emerald-500
                     text-dark-900 font-semibold text-lg rounded-xl
                     hover:shadow-lg hover:shadow-accent-green/25
                     disabled:opacity-50 disabled:cursor-not-allowed
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
                       hover:text-accent-green hover:border-accent-green/30 hover:bg-white/5
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px]"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
