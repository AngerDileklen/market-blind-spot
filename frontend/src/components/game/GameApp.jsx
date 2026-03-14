import { useEffect } from 'react';
import { useGameStore } from '../../gameStore';
import { GameHUD } from './HUD';
import { GameWorldMap } from './WorldMap';
import { GameDecisionCard } from './DecisionCard';
import { GameCertificate } from './Certificate';

export default function GameApp({ onExit }) {
  const currentWorld = useGameStore((state) => state.currentWorld);
  const initApp = useGameStore((state) => state.initApp);

  useEffect(() => {
    initApp();
  }, [initApp]);

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col">
      <GameHUD onExit={onExit} />
      <main className="flex-1 mt-16 w-full flex flex-col items-center overflow-y-auto">
        {!currentWorld ? (
          <GameWorldMap />
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-2xl px-4 py-6 flex justify-between items-center text-textSecondary text-sm">
              <span className="font-bold tracking-widest text-white uppercase">World {currentWorld}</span>
              <button
                className="hover:text-white transition-colors flex items-center space-x-2 bg-card px-4 py-2 rounded-lg border border-border"
                onClick={() => useGameStore.getState().exitWorld()}
              >
                <span>✕ Exit to Map</span>
              </button>
            </div>

            <GameDecisionCard />
          </div>
        )}
      </main>
      <GameCertificate />
    </div>
  );
}
