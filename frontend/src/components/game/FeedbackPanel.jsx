import React from 'react';

// Alex the Analyst (Green Avatar)
const AlexAvatar = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-correct" fill="currentColor">
    <circle cx="50" cy="50" r="45" fill="rgba(0, 212, 170, 0.2)" />
    <circle cx="50" cy="40" r="15" />
    <path d="M25 80 Q50 50 75 80 L75 85 L25 85 Z" />
    {/* Smile */}
    <path d="M40 42 Q50 48 60 42" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

// Morgan the MD (Grey Avatar, Stern)
const MorganAvatar = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-textSecondary" fill="currentColor">
    <circle cx="50" cy="50" r="45" fill="rgba(136, 136, 136, 0.2)" />
    <circle cx="50" cy="40" r="15" />
    <path d="M25 80 Q50 50 75 80 L75 85 L25 85 Z" />
    {/* Straight face */}
    <path d="M40 45 L60 45" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Glasses */}
    <rect x="35" y="33" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="53" y="33" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="47" y1="37" x2="53" y2="37" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export function GameFeedbackPanel({ isCorrect, feedback, onNext }) {
  return (
    <div className={`mt-6 w-full max-w-2xl mx-auto rounded-xl p-6 flex flex-col items-start shadow-lg border ${
      isCorrect ? 'bg-card border-correct text-white' : 'bg-card border-wrong text-white'
    }`}>
      <div className="flex w-full items-start space-x-4">
        {/* Character SVG Animations from PRD */}
        <div className="w-16 h-16 rounded-full flex-shrink-0">
          {isCorrect ? (
            <div className="w-full h-full animate-bounce-correct">
              <AlexAvatar />
            </div>
          ) : (
            <div className="w-full h-full animate-shake">
              <MorganAvatar />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`font-bold text-xl ${isCorrect ? 'text-correct' : 'text-wrong'}`}>
              {isCorrect ? '✓ CORRECT' : '✗ NOT QUITE'}
            </h3>
            {isCorrect && <span className="text-gold font-bold text-sm bg-gold/10 px-2 py-1 rounded">+100 XP</span>}
            {!isCorrect && <span className="text-wrong font-bold text-sm bg-wrong/10 px-2 py-1 rounded">-1 Life</span>}
          </div>
          <p className="text-lg leading-relaxed mb-6">{feedback}</p>
          
          <button
            onClick={onNext}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] ${
              isCorrect ? 'bg-correct text-background' : 'bg-wrong text-white'
            }`}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
