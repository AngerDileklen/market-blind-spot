import { useGameStore } from '../../gameStore'
import { Lock, Unlock, Play, Award } from 'lucide-react'

const worlds = [
  { id: 1, name: "WORLD 1 \u2014 THE COMPS TABLE", desc: "Peer selection, EV/EBITDA, P/E", badge: "Comps Certified" },
  { id: 2, name: "WORLD 2 \u2014 THE DEAL PREMIUM", desc: "M&A, control premium, synergies", badge: "M&A Analyst" },
  { id: 3, name: "WORLD 3 \u2014 THE DCF MODEL", desc: "WACC, cash flows, terminal value", badge: "DCF Builder" },
  { id: 4, name: "WORLD 4 \u2014 THE LBO", desc: "Leverage, IRR, debt paydown", badge: "Private Equity Ready" },
  { id: 5, name: "WORLD 5 \u2014 THE MERGER MODEL", desc: "Accretion/dilution, pro forma EPS", badge: "Wall Street Ready" }
]

export function GameWorldMap() {
  const { unlockedWorlds, setCurrentWorld, worldProgress } = useGameStore()

  return (
    <div className="flex flex-col items-center py-24 space-y-6 w-full max-w-3xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-gold to-white bg-clip-text text-transparent">
        ValuationQuest
      </h1>
      
      {worlds.map((world) => {
        const isUnlocked = unlockedWorlds.includes(world.id)
        const progress = worldProgress[world.id] || { passed: 0, total: 10 }
        
        return (
          <div 
            key={world.id}
            className={`w-full p-6 rounded-xl border flex flex-col md:flex-row justify-between items-center transition-all duration-300 ${isUnlocked ? 'bg-card border-border hover:border-gold' : 'bg-background border-border opacity-60'}`}
          >
            <div className="flex flex-col text-left mb-4 md:mb-0 w-full md:w-2/3">
              <div className="flex items-center space-x-3 mb-2">
                {isUnlocked ? <Unlock size={20} className="text-correct" /> : <Lock size={20} className="text-textSecondary" />}
                <h2 className={`text-xl font-bold ${isUnlocked ? 'text-white' : 'text-textSecondary'}`}>
                  {world.name}
                </h2>
              </div>
              <p className="text-textSecondary text-sm">{world.desc}</p>
              
              {isUnlocked && (
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div className="bg-gold h-2.5 rounded-full" style={{ width: `${(progress.passed / progress.total) * 100}%` }}></div>
                  </div>
                  <span className="text-xs text-textSecondary whitespace-nowrap">{progress.passed}/{progress.total} passed</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end justify-center w-full md:w-1/3">
              {isUnlocked ? (
                <button 
                  onClick={() => setCurrentWorld(world.id)}
                  className="bg-correct text-background font-bold px-6 py-3 rounded-xl flex items-center space-x-2 hover:opacity-90 transition-opacity w-full md:w-auto justify-center"
                >
                  <Play size={18} className="fill-current" />
                  <span>START</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 text-textSecondary text-sm">
                  <Lock size={16} />
                  <span>Unlock by passing World {world.id - 1}</span>
                </div>
              )}
              
              {progress.passed >= 7 && (
                <div className="mt-2 flex items-center space-x-1 text-gold text-xs font-semibold">
                  <Award size={14} />
                  <span>{world.badge}</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
