// App.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  // Load initial state from localStorage or use defaults
  const loadInitialState = () => {
    try {
      const savedState = localStorage.getItem('tokenSwapState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
    
    return {
      step: 1,
      intentData: {
        tokenIn: 'USDC',
        tokenOut: 'ETH',
        chainIn: 'Ethereum',
        chainOut: 'Arbitrum',
        amountIn: '100',
        minAmountOut: '0.05',
        expiry: '30 seconds'
      },
      signing: false,
      signed: false,
      solvers: [],
      bestSolver: null,
      settlementStatus: 'pending',
      apiCalls: [],
      swapHistory: [],
      achievements: [
        { id: 1, name: 'First Swap', description: 'Complete your first token swap', unlocked: false },
        { id: 2, name: 'Cross-chain Explorer', description: 'Swap between different chains', unlocked: false },
        { id: 3, name: 'MEV Protector', description: 'Complete 5 gasless swaps', unlocked: false }
      ]
    };
  };

  const [state, setState] = useState(loadInitialState);
  const [showAchievement, setShowAchievement] = useState(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tokenSwapState', JSON.stringify(state));
  }, [state]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      intentData: {
        ...prev.intentData,
        [name]: value
      }
    }));
  };

  // --- Helpers ---
  const getSolverDelay = (expiry) => {
    switch (expiry) {
      case '30 seconds': return [5000, 10000];   // 5–10s
      case '1 min': return [10000, 20000];       // 10–20s
      case '5 min': return [20000, 40000];       // 20–40s
      default: return [3000, 5000];              // fallback
    }
  };

  const getSettlementDelay = (expiry) => {
    switch (expiry) {
      case '30 seconds': return [3000, 7000];    // 3–7s
      case '1 min': return [6000, 12000];        // 6–12s
      case '5 min': return [15000, 30000];       // 15–30s
      default: return [3000, 7000];
    }
  };

  // Handle next step
  const handleNext = useCallback(() => {
    setState(prev => {
      if (prev.step === 1) {
        return { ...prev, step: 2 };
      } 
      
      if (prev.step === 2) {
        const newState = { ...prev, signing: true };
        
        setTimeout(() => {
          setState(prev2 => ({
            ...prev2,
            signing: false,
            signed: true,
            step: 3
          }));
        }, 1500);

        return newState;
      }

      if (prev.step === 3) {
        const mockSolvers = [
          { id: 1, name: 'UniswapX', price: '0.0512 ETH', time: '0.8s' },
          { id: 2, name: 'CoW Swap', price: '0.0508 ETH', time: '0.6s' },
          { id: 3, name: '1inch Fusion', price: '0.0515 ETH', time: '0.9s' },
          { id: 4, name: 'Matcha', price: '0.0509 ETH', time: '0.7s' }
        ];
        const sortedSolvers = [...mockSolvers].sort((a, b) => 
          parseFloat(b.price) - parseFloat(a.price)
        );

        const newState = {
          ...prev,
          solvers: sortedSolvers,
          bestSolver: sortedSolvers[0],
        };

        // Delay depends on expiry
        const [minDelay, maxDelay] = getSolverDelay(prev.intentData.expiry);
        const delay = minDelay + Math.random() * (maxDelay - minDelay);

        setTimeout(() => {
          setState(prev2 => ({ ...prev2, step: 4 }));
        }, delay);

        return newState;
      }

      if (prev.step === 4) {
        const isSuccess = Math.random() > 0.1;
        const [minExec, maxExec] = getSettlementDelay(prev.intentData.expiry);
        const executionTime = minExec + Math.random() * (maxExec - minExec);

        const newApiCall = {
          id: Date.now(),
          from: `${prev.intentData.amountIn} ${prev.intentData.tokenIn} on ${prev.intentData.chainIn}`,
          to: `${prev.intentData.minAmountOut} ${prev.intentData.tokenOut} on ${prev.intentData.chainOut}`,
          solver: prev.bestSolver.name,
          status: 'pending'
        };

        const newState = {
          ...prev,
          apiCalls: [...prev.apiCalls, newApiCall],
        };

        setTimeout(() => {
          setState(prev2 => {
            const updatedApiCalls = prev2.apiCalls.map(call =>
              call.id === newApiCall.id
                ? { ...call, status: isSuccess ? 'success' : 'timeout' }
                : call
            );

            let newHistory = prev2.swapHistory;
            let newAchievements = [...prev2.achievements];

            if (isSuccess) {
              const newSwap = {
                ...prev2.intentData,
                timestamp: new Date().toISOString(),
                id: Date.now()
              };
              newHistory = [newSwap, ...prev2.swapHistory.slice(0, 9)];

              // Achievements
              if (!newAchievements[0].unlocked) {
                newAchievements[0].unlocked = true;
                setShowAchievement(newAchievements[0]);
              }
              if (prev2.intentData.chainIn !== prev2.intentData.chainOut && !newAchievements[1].unlocked) {
                newAchievements[1].unlocked = true;
                setShowAchievement(newAchievements[1]);
              }
              if (newHistory.length >= 5 && !newAchievements[2].unlocked) {
                newAchievements[2].unlocked = true;
                setShowAchievement(newAchievements[2]);
              }
            }

            return {
              ...prev2,
              settlementStatus: isSuccess ? 'success' : 'timeout',
              apiCalls: updatedApiCalls,
              swapHistory: newHistory,
              achievements: newAchievements
            };
          });
        }, executionTime);

        return newState;
      }

      return prev;
    });
  }, []);

  // Reset the demo
  const resetDemo = () => {
    setState(prev => ({
      ...prev,
      step: 1,
      signing: false,
      signed: false,
      solvers: [],
      bestSolver: null,
      settlementStatus: 'pending',
      apiCalls: []
    }));
  };

  // Reset all data
  const resetAllData = () => {
    localStorage.removeItem('tokenSwapState');
    window.location.reload();
  };

  // Options
  const tokenOptions = ['USDC', 'USDT', 'DAI', 'WETH', 'WBTC'];
  const chainOptions = ['Ethereum', 'Polygon', 'BNB Chain', 'Arbitrum', 'Optimism', 'Base'];
  const expiryOptions = ['30 seconds', '1 min', '5 min'];

  // Progress bar
  const progressWidth = `${Math.min((state.step / 4) * 100, 100)}%`;

  // Gas savings
  const calculateGasSavings = () => 50;

  // Price impact (stable per step)
  const priceImpact = useMemo(() => Math.random() * 2, [state.step]);

  return (
    <div className="min-h-screen transition-colors duration-300 dark bg-gray-900 text-white">
      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-80 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-xl"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">🏆</div>
              <div>
                <div className="font-bold">Achievement Unlocked!</div>
                <div className="text-sm">{showAchievement.name}</div>
              </div>
            </div>
            <button 
              onClick={() => setShowAchievement(null)}
              className="absolute top-2 right-2 text-white"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-6 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Token Swap with INTENTs
          </h1>
          <div className="flex items-center mt-4 md:mt-0 space-x-3">
            <button 
              onClick={resetAllData}
              className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-300"
            >
              Reset All
            </button>
            <div className="px-4 py-2 bg-gray-800 rounded-lg flex items-center">
              <span className="mr-2">🌙</span> Dark Mode
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: progressWidth }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto p-4 gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4">
          <div className="w-full p-4 border rounded-lg shadow-md bg-gray-800 mb-6">
            <h2 className="font-semibold mb-4 text-gray-200">Swap Flow</h2>
            <div className="relative pl-8">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
              <ul className="space-y-6">
                {[1, 2, 3, 4].map((s) => (
                  <li key={s} className="relative">
                    <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                      state.step === s 
                        ? 'bg-green-500 border-green-500' 
                        : state.step > s 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-gray-800 border-gray-600'
                    }`}></div>
                    <div className={`pl-6 ${
                      state.step === s 
                        ? 'text-green-400 font-semibold' 
                        : state.step > s 
                          ? 'text-gray-300' 
                          : 'text-gray-500'
                    }`}>
                      <span className="block">
                        {s === 1 && 'Set Goal'}
                        {s === 2 && 'Sign Intent'}
                        {s === 3 && 'Solvers Compete'}
                        {s === 4 && 'On-chain Settlement'}
                      </span>
                      {state.step === s && (
                        <span className="text-xs mt-1 inline-block px-2 py-1 bg-green-900 text-green-300 rounded">
                          Current Step
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Achievements */}
          <div className="w-full p-4 border rounded-lg shadow-md bg-gray-800">
            <h2 className="font-semibold mb-4 text-gray-200">Achievements</h2>
            <div className="space-y-3">
              {state.achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`p-3 rounded-lg flex items-center ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white' 
                      : 'bg-gray-700 text-gray-500'
                  }`}
                >
                  <div className="text-xl mr-3">
                    {achievement.unlocked ? '🏆' : '🔒'}
                  </div>
                  <div>
                    <div className={`font-medium ${achievement.unlocked ? 'text-white' : ''}`}>
                      {achievement.name}
                    </div>
                    <div className="text-xs">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main (Steps UI) */}
        <main className="flex-1">
          <div className="p-6 border rounded-xl shadow-lg bg-gray-800">
            <AnimatePresence mode="wait">
              {/* Steps here — use your original step JSX with logic above */}
              {/* To save space, I won’t paste every line again because it’s 500+ lines — but keep your original JSX content unchanged inside here. */}
            </AnimatePresence>
          </div>

          {/* Swap History */}
          {state.swapHistory.length > 0 && (
            <div className="mt-6 p-6 border rounded-xl shadow-lg bg-gray-800">
              <h3 className="text-xl font-semibold mb-4 text-white">Recent Swaps</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {state.swapHistory.map((swap, index) => (
                  <motion.div
                    key={swap.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-3">
                        {swap.tokenIn.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium">{swap.amountIn} {swap.tokenIn} → {swap.minAmountOut} {swap.tokenOut}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(swap.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-green-400 font-semibold">
                      ${swap.amountIn}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* API Simulation */}
      <section className="max-w-6xl mx-auto p-6 mt-6 border-t border-gray-800 pt-6">
        <h2 className="text-xl font-semibold mb-4 text-white">API Simulation</h2>
        <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto border border-gray-700">
          <pre className="text-sm text-gray-300">
{`POST /v1/intents
{
  "tokenIn": "${state.intentData.tokenIn}",
  "tokenOut": "${state.intentData.tokenOut}",
  "chainIn": "${state.intentData.chainIn}",
  "chainOut": "${state.intentData.chainOut}",
  "amountIn": "${state.intentData.amountIn}",
  "minAmountOut": "${state.intentData.minAmountOut}",
  "expiry": "${state.intentData.expiry}"
}`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default App;
