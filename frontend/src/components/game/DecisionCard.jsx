import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../gameStore';
import { GameFeedbackPanel } from './FeedbackPanel';
import { GameBossCard } from './BossCard';

export function GameDecisionCard() {
  const {
    currentWorld,
    worldProgress,
    recordCorrectAnswer,
    loseLife,
    deductXp,
    xp,
    nextCard,
    isGameOver,
    restartCurrentWorld,
  } = useGameStore();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState("");
  const [hintError, setHintError] = useState("");
  const [loadingHint, setLoadingHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  
  const progress = worldProgress[currentWorld] || { currentCardIndex: 0 };
  const currentCardIndex = progress.currentCardIndex;

  useEffect(() => {
    if (!currentWorld) return;
    setLoading(true);
    setHintError("");
    fetch(`/api/game/cards/${currentWorld}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch cards");
        return res.json();
      })
      .then(data => {
        setCards(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentWorld]);

  const handleSelect = (optionId) => {
    if (selectedAnswer) return; // Already answered
    
    setSelectedAnswer(optionId);
    const card = cards[currentCardIndex];
    
    const correct = optionId === card.correct;
    setIsCorrect(correct);
    
    if (correct) {
      setFeedback(card.feedback_correct);
      recordCorrectAnswer(usedHint ? 50 : 100);
    } else {
      setFeedback(card[`feedback_wrong_${optionId}`]);
      loseLife();
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setFeedback("");
    setHint("");
    setHintError("");
    setUsedHint(false);
    nextCard();
  };

  const handleHint = async () => {
    if (xp < 10 || loadingHint || hint) return;
    
    setLoadingHint(true);
    setHintError("");
    const card = cards[currentCardIndex];
    
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

  if (loading) return <div className="mt-12 text-center text-textSecondary">Loading...</div>;
  if (error) return <div className="mt-12 text-center text-wrong">Error: {error}</div>;
  if (!cards || cards.length === 0) return null;

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
  
  if (currentCardIndex >= cards.length) {
    return (
      <div className="mt-12 flex flex-col items-center space-y-4">
        <h2 className="text-3xl font-bold text-gold">World {currentWorld} Complete!</h2>
        <button 
          onClick={() => useGameStore.getState().exitWorld()}
          className="bg-card border border-border px-6 py-3 rounded-xl hover:border-gold transition-colors"
        >
          Return to Map
        </button>
      </div>
    );
  }

  const card = cards[currentCardIndex];

  if (card.type === 'boss') {
    return <GameBossCard card={card} onNext={handleNext} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 mt-8 pb-20">
      {/* Knowledge Context */}
      <div className={`w-full bg-card border border-border rounded-xl p-6 shadow-md transition-all duration-300 ${
        selectedAnswer && isCorrect ? 'border-correct animate-scale-correct' : selectedAnswer && !isCorrect ? 'border-wrong animate-shake' : ''
      }`}>
        <div className="text-sm font-semibold text-textSecondary mb-4 uppercase tracking-wider">{card.concept_tag}</div>
        
        <div className="bg-background/50 rounded-lg p-4 mb-6 border-l-4 border-gold text-lg">
          {card.company_context.split('\n').map((line, idx) => (
            <p key={idx} className="mb-1">{line}</p>
          ))}
        </div>
        
        <h2 className="text-2xl font-bold mb-8 leading-snug text-white">
          {card.question}
        </h2>
        
        {/* Answer Options */}
        <div className="space-y-3">
          {card.options.map(opt => {
            const isSelected = selectedAnswer === opt.id;
            const isActuallyCorrect = opt.id === card.correct;
            
            let buttonClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center space-x-4 ring-1 ring-transparent ";
            
            if (!selectedAnswer) {
              buttonClass += "bg-background border-border hover:border-gold hover:bg-card hover:ring-gold/35 text-white";
            } else {
              if (isSelected && isCorrect) {
                buttonClass += "bg-correct/25 border-correct ring-correct/50 text-white font-bold";
              } else if (isSelected && !isCorrect) {
                buttonClass += "bg-wrong/25 border-wrong ring-wrong/50 text-white";
              } else if (!isSelected && isActuallyCorrect) {
                buttonClass += "bg-correct/20 border-correct/70 ring-correct/35 text-white";
              } else {
                buttonClass += "bg-background border-border opacity-45";
              }
            }

            return (
              <button 
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={!!selectedAnswer}
                className={buttonClass}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  isSelected && isCorrect
                    ? 'border-correct bg-correct text-background'
                    : isSelected && !isCorrect
                    ? 'border-wrong bg-wrong text-white'
                    : !selectedAnswer
                    ? 'border-textSecondary text-textSecondary'
                    : 'border-border text-textSecondary'
                }`}>
                  {opt.id}
                </div>
                <span className="text-lg">{opt.text}</span>
              </button>
            );
          })}
        </div>
        
        {/* Hint Section */}
        {!selectedAnswer && (
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
      {selectedAnswer && (
        <GameFeedbackPanel 
          isCorrect={isCorrect}
          feedback={feedback}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
