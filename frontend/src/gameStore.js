import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const calculateLevel = (xp) => {
  if (xp < 200) return "Intern"
  if (xp < 500) return "Analyst"
  if (xp < 1000) return "Associate"
  if (xp < 2000) return "VP"
  return "Managing Director"
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 1,
      lastPlayedDate: new Date().toISOString().split('T')[0],
      currentWorld: null,
      unlockedWorlds: [1], // World 1 starts unlocked
      worldProgress: {
        1: { passed: 0, total: 10, currentCardIndex: 0 },
        2: { passed: 0, total: 2, currentCardIndex: 0 }, // Adjusting total cards based on actual JSON to prevent issues later
        3: { passed: 0, total: 2, currentCardIndex: 0 },
        4: { passed: 0, total: 2, currentCardIndex: 0 },
        5: { passed: 0, total: 2, currentCardIndex: 0 },
      },
      lives: 3,
      consecutiveCorrect: 0,
      showCertificate: false,
      isGameOver: false,

      // App Initialization / Streak logic
      initApp: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.lastPlayedDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (state.lastPlayedDate === yesterdayStr) {
            // increment streak
            set({ streak: state.streak + 1, lastPlayedDate: today });
          } else {
            // reset streak
            set({ streak: 1, lastPlayedDate: today });
          }
        }
      },

      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      deductXp: (amount) => set((state) => ({ xp: Math.max(0, state.xp - amount) })),

      loseLife: () => set((state) => {
        const newLives = Math.max(0, state.lives - 1);
        if (newLives === 0) {
          return {
            lives: 0,
            consecutiveCorrect: 0,
            isGameOver: true,
          }
        }
        return { lives: newLives, consecutiveCorrect: 0 };
      }),

      gainLife: () => set((state) => ({ lives: Math.min(3, state.lives + 1) })),

      recordCorrectAnswer: (xpGained) => set((state) => {
        const newConsecutive = state.consecutiveCorrect + 1;
        let newLives = state.lives;
        if (newConsecutive >= 5 && state.lives < 3) {
          newLives++; // Gain a heart back every 5 correct answers in a row
        }

        const worldId = state.currentWorld;
        const currentProgress = state.worldProgress[worldId];
        const newPassed = currentProgress.passed + 1;

        // Check unlock next world (requires 7 passed or all if total < 7)
        let newUnlockedWorlds = [...state.unlockedWorlds];
        let showCert = state.showCertificate;
        
        const requiredToPass = Math.min(7, currentProgress.total);
        if (newPassed >= requiredToPass) {
          if (worldId < 5 && !newUnlockedWorlds.includes(worldId + 1)) {
            newUnlockedWorlds.push(worldId + 1);
          } else if (worldId === 5 && newPassed >= requiredToPass) {
            showCert = true;
          }
        }

        return {
          xp: state.xp + xpGained,
          consecutiveCorrect: newConsecutive % 5 === 0 ? 0 : newConsecutive,
          lives: newLives,
          unlockedWorlds: newUnlockedWorlds,
          showCertificate: showCert,
          worldProgress: {
            ...state.worldProgress,
            [worldId]: {
              ...currentProgress,
              passed: newPassed
            }
          }
        };
      }),

      nextCard: () => set((state) => {
        if (!state.currentWorld) return state;
        const currentProgress = state.worldProgress[state.currentWorld];
        return {
          worldProgress: {
            ...state.worldProgress,
            [state.currentWorld]: {
              ...currentProgress,
              currentCardIndex: currentProgress.currentCardIndex + 1
            }
          }
        };
      }),

      restartCurrentWorld: () => set((state) => {
        if (!state.currentWorld) return state;
        return {
          lives: 3,
          consecutiveCorrect: 0,
          isGameOver: false,
          worldProgress: {
            ...state.worldProgress,
            [state.currentWorld]: {
              ...state.worldProgress[state.currentWorld],
              currentCardIndex: 0,
              passed: 0,
            }
          }
        };
      }),

      clearGameOver: () => set({ isGameOver: false }),

      setCurrentWorld: (worldId) => set({ currentWorld: worldId, lives: 3, consecutiveCorrect: 0, isGameOver: false }),
      exitWorld: () => set({ currentWorld: null, lives: 3, consecutiveCorrect: 0, isGameOver: false }),
      closeCertificate: () => set({ showCertificate: false }),

      getLevelTitle: () => calculateLevel(get().xp)
    }),
    {
      name: 'valuation-quest-storage',
    }
  )
)
