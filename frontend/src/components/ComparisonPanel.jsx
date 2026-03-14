import { useState } from 'react';
import NarrativePanel from './NarrativePanel';

export default function ComparisonPanel({ blindSpotNarrative, conventionalNarrative }) {
  const [activeTab, setActiveTab] = useState('blind-spot');

  if (!blindSpotNarrative && !conventionalNarrative) return null;

  return (
    <div id="comparison-panel">
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          id="tab-blind-spot"
          onClick={() => setActiveTab('blind-spot')}
          className={`comparison-tab flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
            activeTab === 'blind-spot' ? 'active' : ''
          }`}
        >
          🔍 Blind Spot Analysis
        </button>
        <button
          id="tab-conventional"
          onClick={() => setActiveTab('conventional')}
          className={`comparison-tab flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
            activeTab === 'conventional' ? 'active' : ''
          }`}
        >
          📊 Wall Street View
        </button>
      </div>

      {/* Active Panel */}
      {activeTab === 'blind-spot' ? (
        <NarrativePanel
          narrative={blindSpotNarrative}
          title="Blind Spot Analysis"
          icon="🔍"
          accentColor="#00d4aa"
        />
      ) : (
        <NarrativePanel
          narrative={conventionalNarrative}
          title="Conventional Wall Street View"
          icon="📊"
          accentColor="#ffb347"
        />
      )}

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
