// App.js
import React, { useState, useEffect, useCallback } from 'react';
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
        expiry: '15 min'
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

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  const [state, setState] = useState(loadInitialState);
  const [showAchievement, setShowAchievement] = useState(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tokenSwapState', JSON.stringify(state));
  }, [state]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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

  // Handle next step
  const handleNext = useCallback(() => {
    setState(prev => {
      const newState = { ...prev };
      
      if (newState.step === 1) {
        newState.step = 2;
      } else if (newState.step === 2) {
        newState.signing = true;
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            signing: false,
            signed: true,
            step: 3
          }));
        }, 2000);
      } else if (newState.step === 3) {
        // Simulate solvers competing
        const mockSolvers = [
          { id: 1, name: 'UniswapX', price: '0.0512 ETH', time: '2.1s' },
          { id: 2, name: 'CoW Swap', price: '0.0508 ETH', time: '1.8s' },
          { id: 3, name: '1inch Fusion', price: '0.0515 ETH', time: '2.3s' },
          { id: 4, name: 'Matcha', price: '0.0509 ETH', time: '1.9s' }
        ];
        
        // Sort by best price (highest ETH amount)
        const sortedSolvers = [...mockSolvers].sort((a, b) => 
          parseFloat(b.price) - parseFloat(a.price)
        );
        
        newState.solvers = sortedSolvers;
        newState.bestSolver = sortedSolvers[0];
        newState.step = 4;
      } else if (newState.step === 4) {
        // Simulate settlement with 90% success rate, 10% timeout
        const isSuccess = Math.random() > 0.1;
        
        // Add API call animation
        const newApiCall = {
          id: Date.now(),
          from: `${newState.intentData.amountIn} ${newState.intentData.tokenIn} on ${newState.intentData.chainIn}`,
          to: `${newState.intentData.minAmountOut} ${newState.intentData.tokenOut} on ${newState.intentData.chainOut}`,
          solver: newState.bestSolver.name,
          status: 'pending'
        };
        
        newState.apiCalls = [...newState.apiCalls, newApiCall];
        
        setTimeout(() => {
          setState(prev => {
            const updatedApiCalls = prev.apiCalls.map(call => 
              call.id === newApiCall.id 
                ? { ...call, status: isSuccess ? 'success' : 'timeout' }
                : call
            );
            
            // Add to history if successful
            let newHistory = prev.swapHistory;
            let newAchievements = [...prev.achievements];
            
            if (isSuccess) {
              const newSwap = {
                ...prev.intentData,
                timestamp: new Date().toISOString(),
                id: Date.now()
              };
              newHistory = [newSwap, ...prev.swapHistory.slice(0, 9)]; // Keep last 10
              
              // Check for achievements
              if (!newAchievements[0].unlocked) {
                newAchievements[0].unlocked = true;
                setShowAchievement(newAchievements[0]);
              }
              
              if (prev.intentData.chainIn !== prev.intentData.chainOut && !newAchievements[1].unlocked) {
                newAchievements[1].unlocked = true;
                setShowAchievement(newAchievements[1]);
              }
              
              if (newHistory.length >= 5 && !newAchievements[2].unlocked) {
                newAchievements[2].unlocked = true;
                setShowAchievement(newAchievements[2]);
              }
            }
            
            return {
              ...prev,
              settlementStatus: isSuccess ? 'success' : 'timeout',
              apiCalls: updatedApiCalls,
              swapHistory: newHistory,
              achievements: newAchievements
            };
          });
        }, 3000);
      }
      
      return newState;
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
    localStorage.removeItem('darkMode');
    window.location.reload();
  };

  // Token and chain options
  const tokenOptions = ['USDC', 'USDT', 'DAI', 'WETH', 'WBTC'];
  const chainOptions = ['Ethereum', 'Polygon', 'BNB Chain', 'Arbitrum', 'Optimism', 'Base'];
  const expiryOptions = ['5 min', '10 min', '15 min', '30 min', '1 hour'];

  // Progress bar width calculation
  const progressWidth = `${(state.step / 4) * 100}%`;

  // Calculate gas savings
  const calculateGasSavings = () => {
    const traditionalGas = 50; // USD
    const intentGas = 0; // USD
    return traditionalGas - intentGas;
  };

  // Calculate price impact
  const calculatePriceImpact = () => {
    // Simplified calculation for demo
    return Math.random() * 2; // 0-2% impact
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
      <header className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Token Swap with INTENTs
          </h1>
          <div className="flex items-center mt-4 md:mt-0 space-x-3">
            <button 
              onClick={resetAllData}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-300"
            >
              Reset All
            </button>
            <button 
              onClick={toggleDarkMode}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-300 flex items-center"
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: progressWidth }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto p-4 gap-6">
        {/* Flowchart Sidebar */}
        <aside className="w-full md:w-1/4">
          <div className="w-full p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 mb-6">
            <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Swap Flow</h2>
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              <ul className="space-y-6">
                {[1, 2, 3, 4].map((s) => (
                  <li key={s} className="relative">
                    {/* Connector dot */}
                    <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                      state.step === s 
                        ? 'bg-green-500 border-green-500' 
                        : state.step > s 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500'
                    }`}></div>
                    
                    <div className={`pl-6 ${
                      state.step === s 
                        ? 'text-green-600 dark:text-green-400 font-semibold' 
                        : state.step > s 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span className="block">
                        {s === 1 && 'Set Goal'}
                        {s === 2 && 'Sign Intent'}
                        {s === 3 && 'Solvers Compete'}
                        {s === 4 && 'On-chain Settlement'}
                      </span>
                      {state.step === s && (
                        <span className="text-xs mt-1 inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                          Current Step
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Achievements Panel */}
          <div className="w-full p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
            <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Achievements</h2>
            <div className="space-y-3">
              {state.achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`p-3 rounded-lg flex items-center ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
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

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-6 border rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Set Goal */}
                {state.step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">1. Set Goal</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Token In
                        </label>
                        <select
                          name="tokenIn"
                          value={state.intentData.tokenIn}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {tokenOptions.map(token => (
                            <option key={token} value={token}>{token}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Token Out
                        </label>
                        <select
                          name="tokenOut"
                          value={state.intentData.tokenOut}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {tokenOptions.filter(t => t !== state.intentData.tokenIn).map(token => (
                            <option key={token} value={token}>{token}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Chain In
                        </label>
                        <select
                          name="chainIn"
                          value={state.intentData.chainIn}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {chainOptions.map(chain => (
                            <option key={chain} value={chain}>{chain}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Chain Out
                        </label>
                        <select
                          name="chainOut"
                          value={state.intentData.chainOut}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {chainOptions.filter(c => c !== state.intentData.chainIn).map(chain => (
                            <option key={chain} value={chain}>{chain}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Amount In
                        </label>
                        <input
                          name="amountIn"
                          type="number"
                          value={state.intentData.amountIn}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="100"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Minimum Receive
                        </label>
                        <input
                          name="minAmountOut"
                          type="number"
                          step="0.0001"
                          value={state.intentData.minAmountOut}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0.05"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expiry Time
                        </label>
                        <select
                          name="expiry"
                          value={state.intentData.expiry}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {expiryOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-end">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg w-full">
                          <div className="text-sm text-indigo-700 dark:text-indigo-300 mb-1">Price Impact</div>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" 
                                style={{ width: `${calculatePriceImpact()}%` }}
                              ></div>
                            </div>
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              {calculatePriceImpact().toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      >
                        Next: Sign Intent
                      </button>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="mr-1">ⓘ</span>
                        <span>Gasless • MEV Protected • Cross-chain</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Sign Intent */}
                {state.step === 2 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">2. Sign Intent</h2>
                    
                    {!state.signed ? (
                      <div className="flex flex-col items-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNext}
                          disabled={state.signing}
                          className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center ${
                            state.signing 
                              ? 'bg-yellow-500 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                          }`}
                        >
                          {state.signing ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Signing...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Sign with Wallet
                            </>
                          )}
                        </motion.button>
                        
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="mt-6 text-gray-600 dark:text-gray-400 max-w-md text-center"
                        >
                          By signing, you're creating a permissionless intent that solvers can fulfill without requiring gas fees or exposing your trade to MEV.
                        </motion.p>
                        
                        {/* Gas Savings Visualization */}
                        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl w-full max-w-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-green-700 dark:text-green-300 font-medium">Gas Savings</span>
                            <span className="text-green-600 dark:text-green-400 font-bold">${calculateGasSavings().toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full" 
                              style={{ width: '100%' }}
                            ></div>
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                            100% gasless transaction
                          </div>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                      >
                        <div className="text-6xl text-green-500 mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Intent Signed Successfully!</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Your swap intent has been created and is now available for solvers to fulfill.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNext}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300"
                        >
                          Next: Solvers Compete
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Step 3: Solvers Compete */}
                {state.step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">3. Solvers Compete</h2>
                    
                    {state.solvers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Solvers are competing for your intent...</p>
                        
                        {/* Chain Connection Visualization */}
                        <div className="mt-8 w-full max-w-md">
                          <div className="flex items-center justify-between">
                            <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                              {state.intentData.chainIn}
                            </div>
                            <div className="flex-1 mx-4 relative">
                              <div className="h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
                              <motion.div 
                                className="absolute top-0 left-0 w-4 h-4 bg-indigo-500 rounded-full"
                                animate={{ x: [0, 200] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              />
                            </div>
                            <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              {state.intentData.chainOut}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                        >
                          {state.solvers.map((solver, index) => (
                            <motion.div
                              key={solver.id}
                              initial={{ y: 50, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className={`border rounded-xl p-5 shadow-md transition-all duration-300 ${
                                solver.id === state.bestSolver.id
                                  ? 'border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 scale-105'
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{solver.name}</h3>
                                {solver.id === state.bestSolver.id && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded">
                                    BEST
                                  </span>
                                )}
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {solver.price}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Fulfilled in {solver.time}
                              </div>
                              
                              {/* Solver Rating */}
                              <div className="mt-3 flex items-center">
                                <div className="text-yellow-400 mr-1">★</div>
                                <div className="text-yellow-400 mr-1">★</div>
                                <div className="text-yellow-400 mr-1">★</div>
                                <div className="text-yellow-400 mr-1">★</div>
                                <div className={`${solver.id === 1 ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>★</div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                        
                        {state.bestSolver && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="text-2xl text-green-500 mr-3">🎉</div>
                              <div>
                                <h3 className="font-bold text-green-700 dark:text-green-300">Best Price Found!</h3>
                                <p className="text-green-600 dark:text-green-400">
                                  {state.bestSolver.name} offers the best price: {state.bestSolver.price}
                                </p>
                              </div>
                            </div>
                            
                            {/* Price Comparison */}
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                              <div className="p-2 bg-white dark:bg-gray-700 rounded">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Market Price</div>
                                <div className="font-bold">0.0515 ETH</div>
                              </div>
                              <div className="p-2 bg-white dark:bg-gray-700 rounded">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Your Price</div>
                                <div className="font-bold text-green-600 dark:text-green-400">{state.bestSolver.price}</div>
                              </div>
                              <div className="p-2 bg-white dark:bg-gray-700 rounded">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Savings</div>
                                <div className="font-bold text-green-600 dark:text-green-400">0.0003 ETH</div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        <div className="flex flex-wrap gap-4">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300"
                          >
                            Settle Swap
                          </motion.button>
                          
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <span className="mr-1">ⓘ</span>
                            <span>Multiple solvers compete to give you the best price</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 4: On-chain Settlement */}
                {state.step === 4 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">4. On-chain Settlement</h2>
                    
                    {state.settlementStatus === 'pending' ? (
                      <>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Settling Swap...
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Your intent is being fulfilled on-chain
                        </p>
                        
                        {/* API Call Animation */}
                        <div className="mt-8 relative h-32 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-16">
                              {state.apiCalls.map((call) => (
                                <motion.div
                                  key={call.id}
                                  className="absolute top-1/2 left-0 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                                  initial={{ x: -50, opacity: 0 }}
                                  animate={{ 
                                    x: [0, 100, 200, 300, 400, 500],
                                    opacity: [0, 1, 1, 1, 1, 0]
                                  }}
                                  transition={{ 
                                    duration: 3,
                                    times: [0, 0.1, 0.3, 0.7, 0.9, 1]
                                  }}
                                >
                                  {call.status === 'pending' ? (
                                    <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                                  ) : call.status === 'success' ? (
                                    '✅'
                                  ) : (
                                    '❌'
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Transaction Details */}
                        <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 max-w-md mx-auto text-left">
                          <div className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Transaction Details</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">From:</span>
                              <span>{state.intentData.amountIn} {state.intentData.tokenIn}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">To:</span>
                              <span>{state.intentData.minAmountOut} {state.intentData.tokenOut}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Network:</span>
                              <span>{state.intentData.chainOut}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Solver:</span>
                              <span>{state.bestSolver?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Expiry:</span>
                              <span>{state.intentData.expiry}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : state.settlementStatus === 'success' ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                      >
                        <div className="text-7xl text-green-500 mb-6">✅</div>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                          Swap Completed!
                        </h3>
                        <div className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-8 border border-green-200 dark:border-green-800">
                          <div className="grid grid-cols-2 gap-4 text-left">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                              <p className="font-semibold">{state.intentData.amountIn} {state.intentData.tokenIn}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">To</p>
                              <p className="font-semibold">~{state.intentData.minAmountOut} {state.intentData.tokenOut}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Network</p>
                              <p className="font-semibold">{state.intentData.chainOut}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                              <p className="font-semibold text-green-600 dark:text-green-400">Success</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                          <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                            Gasless
                          </div>
                          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                            MEV Protected
                          </div>
                          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                            Cross-chain
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                          Your swap was executed at the best price without gas fees or MEV exposure.
                        </p>
                        <button 
                          onClick={resetDemo}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300"
                        >
                          Start New Swap
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                      >
                        <div className="text-7xl text-red-500 mb-6">⌛</div>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                          Intent Expired
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                          No solver was able to fulfill your intent within the time limit. No cost was incurred.
                        </p>
                        <button 
                          onClick={resetDemo}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300"
                        >
                          Try Again
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Swap History */}
          {state.swapHistory.length > 0 && (
            <div className="mt-6 p-6 border rounded-xl shadow-lg bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Swaps</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {state.swapHistory.map((swap, index) => (
                  <motion.div
                    key={swap.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-3">
                        {swap.tokenIn.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium">{swap.amountIn} {swap.tokenIn} → {swap.minAmountOut} {swap.tokenOut}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(swap.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-semibold">
                      ${swap.amountIn}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* API Simulation Section */}
      <section className="max-w-6xl mx-auto p-6 mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">API Simulation</h2>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-800 dark:text-gray-200">
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