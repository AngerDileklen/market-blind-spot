import { useGameStore } from '../../gameStore'
import { Award, Share2 } from 'lucide-react'

export function GameCertificate() {
  const { showCertificate, closeCertificate, xp } = useGameStore()
  
  if (!showCertificate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl border-2 border-gold rounded-2xl p-8 relative shadow-[0_0_50px_rgba(255,215,0,0.3)] flex flex-col items-center text-center animate-scale-correct">
        <button 
          onClick={closeCertificate}
          className="absolute top-4 right-4 text-textSecondary hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mb-6">
          <Award size={48} className="text-gold" />
        </div>
        
        <h2 className="text-sm font-bold tracking-[0.3em] text-gold uppercase mb-2">Certificate of Completion</h2>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white font-serif">
          Wall Street Ready
        </h1>
        
        <p className="text-lg text-textSecondary max-w-lg mb-8">
          You have successfully completed all 5 worlds of ValuationQuest. 
          You've mastered the comps table, deal premiums, DCF modeling, LBOs, and merger math.
        </p>
        
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-background border border-border rounded-xl p-4 flex flex-col items-center">
            <span className="text-textSecondary text-sm mb-1">Final XP</span>
            <span className="text-2xl font-bold text-gold">{xp}</span>
          </div>
          <div className="bg-background border border-border rounded-xl p-4 flex flex-col items-center">
            <span className="text-textSecondary text-sm mb-1">Title</span>
            <span className="text-2xl font-bold text-correct">Managing Director</span>
          </div>
        </div>
        
        <div className="flex space-x-4 w-full">
          <button 
            onClick={closeCertificate}
            className="flex-1 bg-background border border-border hover:border-gold text-white font-bold py-4 rounded-xl transition-colors"
          >
            RETURN TO MAP
          </button>
          <button 
            className="flex-1 bg-gold text-background font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
          >
            <Share2 size={20} />
            <span>SHARE</span>
          </button>
        </div>
      </div>
    </div>
  )
}
