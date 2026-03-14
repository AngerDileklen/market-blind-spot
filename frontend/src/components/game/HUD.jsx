import { useGameStore } from '../../gameStore'
import { Flame, Heart } from 'lucide-react'

export function GameHUD({ onExit }) {
  const { xp, streak, lives, getLevelTitle } = useGameStore()
  
  return (
    <div className="flex justify-between items-center p-4 bg-background border-b border-border text-textPrimary h-16 w-full fixed top-0 left-0 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <span className="font-bold text-lg">ValuationQuest</span>
          <span className="text-sm text-gold">{getLevelTitle()}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1 font-bold text-gold text-lg">
          <span>{xp} XP</span>
        </div>
        
        <div className="flex items-center space-x-1 font-bold text-warning text-lg">
          <Flame size={20} className="text-warning fill-current" />
          <span>{streak}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {[1, 2, 3].map((i) => (
            <Heart 
              key={i} 
              size={24} 
              className={i <= lives ? "text-wrong fill-current" : "text-border"} 
            />
          ))}
        </div>

        <button
          onClick={onExit}
          className="px-3 py-1.5 rounded-lg border border-border text-sm text-textSecondary hover:text-white hover:border-gold transition-colors"
        >
          Exit Game
        </button>
      </div>
    </div>
  )
}
