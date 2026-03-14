import { useState, useEffect, useRef } from 'react';

const STEPS = [
  {
    label: 'Connecting to financial data',
    detail: 'Authenticating yfinance data feed',
    hints: [
      'Connecting to 60+ market data sources...',
      'yfinance aggregates SEC filings in real time',
      'Checking data availability for this ticker',
    ],
  },
  {
    label: 'Fetching company fundamentals',
    detail: 'Income statements, balance sheet, cash flows',
    hints: [
      'Pulling up to 4 years of earnings statements',
      'Analysing free cash flow generation trends',
      'Cross-referencing balance sheet integrity',
    ],
  },
  {
    label: 'Computing 6 academic signals',
    detail: 'Piotroski · Accruals · Momentum · Quality · Value · Growth',
    hints: [
      'Piotroski F-Score: 9 binary tests of financial health',
      'Accruals ratio reveals earnings quality vs. cash flow',
      '52-week momentum captures price trend persistence',
    ],
  },
  {
    label: 'Weighting & scoring signals',
    detail: 'Sector-adjusted weights, confidence metadata',
    hints: [
      'Tech & software stocks receive adjusted signal weights',
      'Sector context changes how signals are interpreted',
      'Confidence flags identify unreliable or sparse data',
    ],
  },
  {
    label: 'Generating AI narrative',
    detail: 'Gemini synthesising contrarian insights',
    hints: [
      'Gemini reads between the lines of raw financials',
      'Identifying what the consensus narrative is missing',
      'Crafting a contrarian thesis from signal data...',
    ],
  },
  {
    label: 'Running peer comparison',
    detail: 'Benchmarking against sector peers',
    hints: [
      'Comparing against up to 8 sector peers simultaneously',
      'Percentile rank reveals relative signal strength',
      'Adjusting for sector-wide tailwinds and headwinds',
    ],
  },
  {
    label: 'Building your report',
    detail: 'Assembling final analysis',
    hints: [
      'Formatting contrarian insights for readability',
      'Flagging sector-specific caveats and warnings',
      'Your blind spot report is almost ready...',
    ],
  },
];

export default function AnalysisProgress({ currentStep }) {
  const [hintIndex, setHintIndex] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const hintTimer = useRef(null);
  const fadeTimer = useRef(null);

  // Cycle the rotating hint every 2.4 s while a step is active
  useEffect(() => {
    const step = STEPS[currentStep];
    if (!step) return;

    setHintIndex(0);
    setHintVisible(true);

    hintTimer.current = setInterval(() => {
      setHintVisible(false);
      fadeTimer.current = setTimeout(() => {
        setHintIndex((i) => (i + 1) % step.hints.length);
        setHintVisible(true);
      }, 350);
    }, 2400);

    return () => {
      clearInterval(hintTimer.current);
      clearTimeout(fadeTimer.current);
    };
  }, [currentStep]);

  if (currentStep < 0) return null;

  const totalSteps = STEPS.length;
  const progressPct = Math.min((currentStep / totalSteps) * 100, 100);
  const displayStep = Math.min(currentStep + 1, totalSteps);

  return (
    <div
      className="animate-fade-in max-w-sm mx-auto py-12"
      role="status"
      aria-label="Analysis progress"
      aria-live="polite"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-gray-600 uppercase tracking-widest font-medium">
          Running analysis
        </p>
        <p className="text-xs font-mono text-gray-600">
          {currentStep >= totalSteps ? totalSteps : displayStep}
          <span className="text-gray-700"> / {totalSteps}</span>
        </p>
      </div>

      {/* Thin progress bar */}
      <div className="h-px bg-white/5 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #00d4aa, #00b894)',
          }}
        />
      </div>

      {/* Step list */}
      <ol className="flex flex-col gap-5">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          const isPending = i > currentStep;
          const hint = step.hints[hintIndex];

          return (
            <li
              key={i}
              className={`flex items-start gap-3.5 transition-opacity duration-500 ${
                isPending ? 'opacity-20' : 'opacity-100'
              } ${isActive ? 'step-row-active' : ''}`}
            >
              {/* Status icon */}
              <div className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {isDone && (
                  <svg
                    className="w-5 h-5"
                    style={{ color: '#00d4aa' }}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isActive && (
                  <div className="step-spinner-wrap" aria-hidden="true">
                    <div className="step-spinner" />
                  </div>
                )}
                {isPending && (
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-white/15 mx-auto"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium leading-snug ${
                    isDone
                      ? 'text-gray-600'
                      : isActive
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {step.label}
                </p>

                {/* Rotating curiosity hint for active step */}
                {isActive && (
                  <p
                    className="text-xs mt-1 transition-opacity duration-300"
                    style={{
                      color: 'rgba(0, 212, 170, 0.6)',
                      opacity: hintVisible ? 1 : 0,
                    }}
                  >
                    {hint}
                  </p>
                )}

                {/* Static detail for done steps */}
                {isDone && (
                  <p className="text-xs mt-0.5 text-gray-700">{step.detail}</p>
                )}
              </div>

              {/* Done badge */}
              {isDone && (
                <span className="flex-shrink-0 text-[10px] font-mono text-[#00d4aa]/40 mt-0.5 select-none">
                  done
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Footer note */}
      {currentStep < totalSteps && (
        <p className="text-center text-[11px] text-gray-700 mt-10">
          Live tickers typically take 10–20 seconds to analyse
        </p>
      )}
    </div>
  );
}
