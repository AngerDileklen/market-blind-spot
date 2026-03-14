import React, { useState } from 'react';
import { useGameStore } from '../../gameStore';
import { GameFeedbackPanel } from './FeedbackPanel';

export function GameBossCard({ card, onNext }) {
  const { xp, recordCorrectAnswer, loseLife, deductXp, isGameOver, restartCurrentWorld } = useGameStore();
  const [inputValue, setInputValue] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [gapPct, setGapPct] = useState(null);
  const [submitError, setSubmitError] = useState("");
  
  const [hint, setHint] = useState("");
  const [hintError, setHintError] = useState("");
  const [loadingHint, setLoadingHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue || isSubmitted) return;
    
    setIsSubmitted(true);
    setSubmitError("");
    
    try {
      const res = await fetch('/api/game/check-boss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: Number(inputValue),
          reference: card.reference
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Could not check answer right now.');
      }
      
      setIsCorrect(data.correct);
      setGapPct(data.gap_pct);
      
      if (data.correct) {
        setFeedback(card.feedback_correct);
        recordCorrectAnswer(data.xp_earned);
      } else {
        setFeedback(card.feedback_wrong + ` (You were off by ${data.gap_pct}%)`);
        loseLife();
      }
    } catch (err) {
      console.error(err);
      setIsSubmitted(false);
      setSubmitError(err.message || 'Could not check answer right now.');
      setFeedback('Something went wrong while checking your answer. Please try again.');
    }
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setIsCorrect(null);
    setFeedback("");
    setHint("");
    setHintError("");
    setSubmitError("");
    setUsedHint(false);
    setInputValue("");
    onNext();
  };

  const handleHint = async () => {
    if (xp < 10 || loadingHint || hint) return;
    
    setLoadingHint(true);
    setHintError("");
    
    try {
      const res = await fetch('/api/game/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: card.question,
          company_context: card.company_context
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Could not get hint right now.');
      }
      if (!data?.hint) {
        throw new Error('Hint is temporarily unavailable. Please try again.');
      }
      setHint(data.hint);
      deductXp(10);
      setUsedHint(true);
    } catch (err) {
      console.error(err);
      setHintError(err.message || 'Could not get hint right now.');
    } finally {
      setLoadingHint(false);
    }
  };

  if (isGameOver) {
    return (
      <div className="mt-12 w-full max-w-xl mx-auto px-4">
        <div className="bg-card border-2 border-wrong rounded-xl p-8 text-center shadow-[0_0_20px_rgba(255,77,77,0.25)]">
          <h2 className="text-3xl font-bold text-wrong mb-2">Game Over</h2>
          <p className="text-textSecondary mb-6">You ran out of lives in this world.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={restartCurrentWorld}
              className="px-5 py-3 rounded-xl bg-gold text-background font-bold hover:opacity-90 transition-opacity"
            >
              Retry World
            </button>
            <button
              onClick={() => useGameStore.getState().exitWorld()}
              className="px-5 py-3 rounded-xl bg-background border border-border text-white hover:border-gold transition-colors"
            >
              Exit to Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 mt-8 pb-20">
      <div className={`w-full bg-card border-2 border-gold rounded-xl p-8 shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300 ${
        isSubmitted && isCorrect ? 'border-correct shadow-[0_0_15px_rgba(0,212,170,0.3)]' : isSubmitted && !isCorrect ? 'border-wrong shadow-[0_0_15px_rgba(255,77,77,0.3)]' : ''
      }`}>
        <div className="flex items-center space-x-2 mb-6 text-gold">
          <span className="text-xl">⚔️</span>
          <h2 className="text-2xl font-bold tracking-widest uppercase">BOSS CHALLENGE</h2>
        </div>
        
        <div className="bg-background/80 rounded-lg p-6 mb-8 border-l-4 border-gold font-mono text-lg space-y-2">
          {card.company_context.split('\n').map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
        
        <h3 className="text-xl font-bold mb-6 text-white leading-relaxed">
          {card.question}
        </h3>
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex items-center bg-background border border-border rounded-xl focus-within:border-gold focus-within:ring-1 focus-within:ring-gold overflow-hidden">
            <span className="px-4 text-textSecondary text-xl font-mono">$</span>
            <input
              type="number"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isSubmitted}
              className="w-full bg-transparent text-white p-4 text-2xl font-mono outline-none placeholder-textSecondary/50"
              placeholder="0.00"
              autoFocus
            />
          </div>
          
          {!isSubmitted ? (
            <button 
              type="submit"
              disabled={!inputValue}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] ${
                inputValue ? 'bg-gold text-background' : 'bg-background border border-border text-textSecondary'
              }`}
            >
              SUBMIT ANSWER
            </button>
          ) : (
            <div className={`mt-6 w-full py-4 text-center rounded-xl font-bold text-lg ${
              isCorrect ? 'bg-correct/20 text-correct' : 'bg-wrong/20 text-wrong'
            }`}>
              {isCorrect ? '✓ ACCEPTED' : `✗ REJECTED (Gap: ${gapPct}%)`}
            </div>
          )}
        </form>

        {submitError && (
          <p className="text-sm text-wrong mt-3 text-center">{submitError}</p>
        )}
        
        {/* Hint Section */}
        {!isSubmitted && (
          <div className="mt-8 flex flex-col items-center">
            {hint ? (
              <div className="w-full bg-gold/10 border border-gold/30 rounded-lg p-4 text-center">
                <p className="text-gold italic">💡 "{hint}"</p>
              </div>
            ) : (
              <button 
                onClick={handleHint}
                disabled={loadingHint || xp < 10}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  xp >= 10 ? 'bg-background border border-border hover:border-gold text-gold' : 'bg-background border border-border opacity-50 cursor-not-allowed text-textSecondary'
                }`}
              >
                <span>💡 Ask Gemini (-10 XP)</span>
                {loadingHint && <span className="animate-spin w-4 h-4 border-2 border-gold border-t-transparent rounded-full ml-2"></span>}
              </button>
            )}
            {hintError && <p className="text-sm text-wrong mt-3">{hintError}</p>}
          </div>
        )}
      </div>

      {/* Feedback Panel */}
      {isSubmitted && (
        <GameFeedbackPanel 
          isCorrect={isCorrect}
          feedback={feedback}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
