import NarrativePanel from './NarrativePanel';

export default function ComparisonPanel({ headline, blindSpotNarrative, conventionalNarrative }) {
  if (!blindSpotNarrative && !conventionalNarrative) return null;

  return (
    <div id="comparison-panel" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        <NarrativePanel
          narrative={conventionalNarrative}
          title="Conventional Wall Street View"
          badge="WS"
          accentColor="#ffb347"
        />
        <div className="flex lg:flex-col items-center justify-center gap-2 px-1">
          <div className="h-px w-10 lg:w-px lg:h-16 bg-white/10" />
          <span className="text-xs tracking-[0.2em] text-gray-500 px-2 py-1 rounded-full border border-white/10 bg-white/5">VS</span>
          <div className="h-px w-10 lg:w-px lg:h-16 bg-white/10" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '1.5s' }}>
          <NarrativePanel
            headline={headline}
            narrative={blindSpotNarrative}
            title="Blind Spot Analysis"
            badge="BS"
            accentColor="#00d4aa"
          />
        </div>
      </div>

      {/* Comparison Note */}
      <div className="mt-4 p-4 rounded-xl bg-dark-700/50 border border-white/5">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-400">Why two views?</strong>{' '}
          The Blind Spot analysis uses 6 academic signals that predict returns
          but are systematically ignored by traditional analysis. The Wall Street view
          shows what a conventional analyst using only P/E and revenue growth would say.
          The gap between these two narratives reveals the blind spot.
        </p>
      </div>
    </div>
  );
}
