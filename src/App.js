// App.js — FINAL 2025 PROFESSIONAL VERSION (Dark Only, Liquid BG, No Logo, Fixed Dropdowns)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  // Load initial state from localStorage or use defaults
  const loadInitialState = () => {
    try {
      const savedState = localStorage.getItem('tokenSwapState');
      if (savedState) return JSON.parse(savedState);
    } catch (e) { console.error('Failed to load saved state:', e); }
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
  const [achievementsCollapsed, setAchievementsCollapsed] = useState(false);

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

  // Calculate execution time based on expiry
  const getExecutionTime = (expiry) => {
    switch(expiry) {
      case '30 seconds': return Math.random() * 5000 + 5000;
      case '1 min': return Math.random() * 10000 + 10000;
      case '5 min': return Math.random() * 20000 + 20000;
      default: return Math.random() * 5000 + 5000;
    }
  };

  // Calculate settlement time based on expiry
  const getSettlementTime = (expiry) => {
    switch(expiry) {
      case '30 seconds': return Math.random() * 4000 + 3000;
      case '1 min': return Math.random() * 6000 + 6000;
      case '5 min': return Math.random() * 15000 + 15000;
      default: return Math.random() * 4000 + 3000;
    }
  };

  // Auto-start competition when entering Step 3
  useEffect(() => {
    if (state.step === 3 && state.solvers.length === 0) {
      const mockSolvers = [
        { id: 1, name: 'UniswapX', price: '0.0512 ETH', time: '0.8s' },
        { id: 2, name: 'CoW Swap', price: '0.0508 ETH', time: '0.6s' },
        { id: 3, name: '1inch Fusion', price: '0.0515 ETH', time: '0.9s' },
        { id: 4, name: 'Matcha', price: '0.0509 ETH', time: '0.7s' }
      ];
      const sortedSolvers = [...mockSolvers].sort((a, b) => 
        parseFloat(b.price.replace(' ETH', '')) - parseFloat(a.price.replace(' ETH', ''))
      );
      setState(prev => ({
        ...prev,
        solvers: sortedSolvers,
        bestSolver: sortedSolvers[0]
      }));

      const executionTime = getExecutionTime(state.intentData.expiry);
      const timeoutId = setTimeout(() => {
        setState(prev => ({ ...prev, step: 4 }));
      }, executionTime);

      return () => clearTimeout(timeoutId);
    }
  }, [state.step, state.solvers.length, state.intentData.expiry]);

  // Auto-start settlement when entering Step 4
  useEffect(() => {
    if (state.step === 4 && state.settlementStatus === 'pending' && state.bestSolver) {
      const isSuccess = Math.random() > 0.1;
      const settlementTime = getSettlementTime(state.intentData.expiry);
      const newApiCall = {
        id: Date.now(),
        from: `${state.intentData.amountIn} ${state.intentData.tokenIn} on ${state.intentData.chainIn}`,
        to: `${state.intentData.minAmountOut} ${state.intentData.tokenOut} on ${state.intentData.chainOut}`,
        solver: state.bestSolver.name,
        status: 'pending'
      };

      setState(prev => ({
        ...prev,
        apiCalls: [...prev.apiCalls, newApiCall],
      }));

      const t = setTimeout(() => {
        setState(prev => {
          const updatedApiCalls = prev.apiCalls.map(call =>
            call.id === newApiCall.id
              ? { ...call, status: isSuccess ? 'success' : 'timeout' }
              : call
          );

          let newHistory = prev.swapHistory;
          const newAchievements = [...prev.achievements];

          if (isSuccess) {
            const newSwap = {
              ...prev.intentData,
              timestamp: new Date().toISOString(),
              id: Date.now(),
            };
            newHistory = [newSwap, ...prev.swapHistory.slice(0, 9)];

            if (!newAchievements[0].unlocked) {
              newAchievements[0] = { ...newAchievements[0], unlocked: true };
              setShowAchievement(newAchievements[0]);
            }
            if (prev.intentData.chainIn !== prev.intentData.chainOut && !newAchievements[1].unlocked) {
              newAchievements[1] = { ...newAchievements[1], unlocked: true };
              setShowAchievement(newAchievements[1]);
            }
            if (newHistory.length >= 5 && !newAchievements[2].unlocked) {
              newAchievements[2] = { ...newAchievements[2], unlocked: true };
              setShowAchievement(newAchievements[2]);
            }
          }

          return {
            ...prev,
            settlementStatus: isSuccess ? 'success' : 'timeout',
            apiCalls: updatedApiCalls,
            swapHistory: newHistory,
            achievements: newAchievements,
          };
        });
      }, settlementTime);

      return () => clearTimeout(t);
    }
  }, [state.step, state.settlementStatus, state.bestSolver, state.intentData]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (state.step === 1) {
      setState(prev => ({ ...prev, step: 2 }));
    } else if (state.step === 2) {
      setState(prev => ({ ...prev, signing: true }));
      setTimeout(() => {
        setState(prev => ({ ...prev, signing: false, signed: true, step: 3 }));
      }, 1800);
    } else if (state.step === 3) {
      setState(prev => ({ ...prev, step: 4 }));
    }
  }, [state.step]);

  // Reset demo
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

  // Token and chain options
  const tokenOptions = ['USDC', 'USDT', 'DAI', 'WETH', 'WBTC'];
  const chainOptions = ['Ethereum', 'Polygon', 'BNB Chain', 'Arbitrum', 'Optimism', 'Base'];
  const expiryOptions = ['30 seconds', '1 min', '5 min'];

  // Progress bar width
  const progressWidth = useMemo(() => `${Math.min((state.step / 4) * 100, 100)}%`, [state.step]);

  // Calculate gas savings
  const calculateGasSavings = () => 50;

  // Calculate price impact (memoized)
  const calculatePriceImpact = useMemo(() => Math.random() * 2, [state.step]);

  // Liquid Gradient Background Component — NO BUBBLES, NO STATIC GRADIENTS
  const LiquidBackground = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Main Animated Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundSize: '300% 300%',
        }}
      />

      {/* Floating Particle Flow (subtle, non-distracting) */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400/30 to-indigo-500/30 rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.05 + Math.random() * 0.1,
          }}
          animate={{
            y: [-10, 20, -10],
            x: [0, 15, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Wave Overlay (slow-moving ripple effect) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: '400% 400%',
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen relative bg-gray-950 text-white overflow-x-hidden">

      {/* LIVING LIQUID BACKGROUND — NO BUBBLES, NO STATIC GRADIENTS */}
      <LiquidBackground />

      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.8 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-96 bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 text-white p-5 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/10"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🏆</div>
                <div>
                  <div className="font-bold text-xl tracking-tight">Achievement Unlocked!</div>
                  <div className="text-lg font-medium mt-1">{showAchievement.name}</div>
                  <div className="text-sm opacity-90 mt-1">{showAchievement.description}</div>
                </div>
              </div>
              <button 
                onClick={() => setShowAchievement(null)}
                className="text-white/80 hover:text-white transition-colors text-2xl font-light"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header — Clean, Minimal, No Logo, No Light Mode */}
      <header className="relative z-10 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Title Only — No Logo, No Toggle */}
          <motion.h1 
            className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent leading-tight tracking-tight"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              backgroundSize: '300% 300%', 
              WebkitBackgroundClip: 'text',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
          >
            INTENT Swap
          </motion.h1>

          <button 
            onClick={resetAllData}
            className="px-4 py-2 text-sm bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white"
          >
            Reset All
          </button>
        </div>
      </header>

      {/* Progress Bar — Now contained, no overflow */}
      <div className="max-w-7xl mx-auto px-6 pb-4">
        <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full shadow-lg"
            style={{ width: progressWidth }}
            initial={{ width: 0 }}
            animate={{ width: progressWidth }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm"></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto p-6 gap-8">
        {/* Flowchart Sidebar */}
        <aside className="w-full md:w-1/4">
          <motion.div 
            className="w-full p-6 border border-white/10 rounded-2xl bg-gradient-to-br from-white/2 to-transparent backdrop-blur-xl shadow-2xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">Swap Flow</h2>
            <div className="relative pl-6">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/30 to-indigo-500/30"></div>
              <ul className="space-y-5">
                {[1, 2, 3, 4].map((s) => (
                  <li key={s} className="relative">
                    <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                      state.step === s 
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 border-cyan-500 shadow-lg shadow-cyan-500/30 scale-110' 
                        : state.step > s 
                          ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30' 
                          : 'bg-white/10 border-white/20'
                    }`}></div>
                    <div className={`pl-8 pr-4 py-3 rounded-xl transition-all duration-500 ${
                      state.step === s 
                        ? 'bg-gradient-to-r from-cyan-900/40 to-indigo-900/40 text-cyan-200 shadow-lg shadow-cyan-500/20 border border-cyan-500/30' 
                        : state.step > s 
                          ? 'bg-green-900/20 text-green-300 border border-green-500/20' 
                          : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      <span className="font-semibold block text-sm">
                        {s === 1 && 'Set Goal'}
                        {s === 2 && 'Sign Intent'}
                        {s === 3 && 'Solvers Compete'}
                        {s === 4 && 'On-chain Settlement'}
                      </span>
                      {state.step === s && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-xs rounded-full border border-cyan-500/30 text-cyan-300"
                        >
                          Active
                        </motion.span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Achievements Panel */}
            <div className="mt-8 p-6 border border-white/10 rounded-2xl bg-gradient-to-br from-white/2 to-transparent backdrop-blur-xl shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Achievements</h2>
                <button 
                  onClick={() => setAchievementsCollapsed(!achievementsCollapsed)}
                  className="md:hidden text-gray-400 hover:text-white transition-colors"
                >
                  {achievementsCollapsed ? '▼' : '▲'}
                </button>
              </div>
              <div className={`${achievementsCollapsed ? 'hidden md:block' : ''} space-y-3`}>
                {state.achievements.map(achievement => (
                  <motion.div 
                    key={achievement.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: achievement.id * 0.1 }}
                    className={`p-4 rounded-xl flex items-center transition-all duration-500 ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-emerald-900/40 to-cyan-800/40 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                        : 'bg-white/5 text-gray-500 border border-white/10'
                    }`}
                  >
                    <div className="text-2xl mr-3">
                      {achievement.unlocked ? '🏆' : '🔒'}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${achievement.unlocked ? 'text-emerald-200' : ''}`}>
                        {achievement.name}
                      </div>
                      <div className="text-xs opacity-80 mt-1">{achievement.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <motion.div 
            className="p-8 border border-white/10 rounded-3xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={state.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >

                {/* Step 1: Set Goal */}
                {state.step === 1 && (
                  <div>
                    <motion.h2 
                      className="text-4xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      1. Set Your Swap Goal
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {[
                        { label: 'Token In', name: 'tokenIn', options: tokenOptions },
                        { label: 'Token Out', name: 'tokenOut', options: tokenOptions },
                        { label: 'Chain In', name: 'chainIn', options: chainOptions },
                        { label: 'Chain Out', name: 'chainOut', options: chainOptions },
                        { label: 'Amount In', name: 'amountIn', type: 'number' },
                        { label: 'Min Receive', name: 'minAmountOut', type: 'number', step: '0.0001' },
                        { label: 'Expiry Time', name: 'expiry', options: expiryOptions }
                      ].map(({ label, name, options, type, step }) => (
                        <div key={name} className="group">
                          <label className="block text-sm font-medium text-gray-300 mb-3 group-hover:text-cyan-300 transition-colors">
                            {label}
                          </label>
                          <select
                            name={name}
                            value={state.intentData[name]}
                            onChange={handleChange}
                            className="w-full p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md border border-cyan-500/40 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 shadow-lg"
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                          >
                            {options.map(opt => (
                              <option key={opt} value={opt} className="bg-gray-800 text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    {/* Price Impact Card */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-cyan-900/30 to-indigo-900/30 rounded-2xl border border-cyan-500/20">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-cyan-300">Price Impact</span>
                        <span className="text-sm font-bold text-green-400">{calculatePriceImpact.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                          style={{ width: `${calculatePriceImpact}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${calculatePriceImpact}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNext}
                      className="w-full py-5 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-700 hover:to-indigo-800 text-white font-bold text-lg rounded-2xl shadow-xl shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center space-x-3"
                    >
                      <span>Continue →</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L11.586 11H2a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>

                    <div className="mt-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Gasless • MEV Protected • Cross-chain
                      </span>
                    </div>
                  </div>
                )}

                {/* Step 2: Sign Intent */}
                {state.step === 2 && (
                  <div className="text-center">
                    <motion.h2 
                      className="text-4xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      2. Sign Your Intent
                    </motion.h2>

                    {!state.signed ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center space-y-8"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNext}
                          disabled={state.signing}
                          className={`relative px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-500 flex items-center justify-center space-x-4 ${
                            state.signing 
                              ? 'bg-gradient-to-r from-yellow-500/80 to-orange-600/80 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
                          }`}
                        >
                          {state.signing ? (
                            <>
                              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Signing...</span>
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>Sign with Wallet</span>
                            </>
                          )}
                          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                        </motion.button>

                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-gray-300 text-lg max-w-md text-center leading-relaxed"
                        >
                          By signing, you’re creating a permissionless, gasless intent that solvers compete to fulfill — no wallet fees, no MEV.
                        </motion.p>

                        {/* Gas Savings Visualization */}
                        <div className="mt-10 p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-500/20 w-full max-w-md mx-auto">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-green-300">Gas Savings</span>
                            <span className="text-2xl font-bold text-green-400">${calculateGasSavings()}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-green-400 text-center">
                            100% gasless transaction powered by INTENT protocol
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                      >
                        <div className="text-8xl text-green-400 mb-6 animate-bounce">✅</div>
                        <h3 className="text-4xl font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                          Intent Signed!
                        </h3>
                        <p className="text-gray-300 text-lg mb-8">
                          Your signature has been broadcasted to the network. Solvers are now competing to execute your trade.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleNext}
                          className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/20 transition-all duration-300"
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
                    <motion.h2 
                      className="text-4xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      3. Solvers Compete for Your Intent
                    </motion.h2>

                    {state.solvers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 space-y-8">
                        <div className="w-24 h-24 relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full animate-pulse"></div>
                          <div className="absolute inset-2 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full animate-ping"></div>
                          <div className="absolute inset-4 bg-white/10 rounded-full"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-300">Waiting for solvers to bid...</h3>
                        <p className="text-gray-400 max-w-md text-center">
                          Multiple decentralized solvers are scanning your intent and submitting competitive prices in real-time.
                        </p>

                        {/* Chain Connection Animation — Smooth, Contained */}
                        <div className="mt-12 w-full max-w-md">
                          <div className="flex items-center justify-between">
                            <div className="px-5 py-3 bg-gradient-to-r from-cyan-900/40 to-cyan-800/40 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
                              <span className="text-cyan-200 font-medium">{state.intentData.chainIn}</span>
                            </div>
                            <div className="flex-1 mx-6 relative h-1">
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"></div>
                              <motion.div 
                                className="absolute top-0 left-0 w-3 h-3 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full shadow-lg"
                                animate={{ 
                                  x: [0, 200, 400], 
                                  opacity: [1, 0.7, 0] 
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity, 
                                  ease: "linear" 
                                }}
                              />
                            </div>
                            <div className="px-5 py-3 bg-gradient-to-r from-indigo-900/40 to-purple-800/40 rounded-2xl border border-indigo-500/30 backdrop-blur-sm">
                              <span className="text-indigo-200 font-medium">{state.intentData.chainOut}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
                        >
                          {state.solvers.map((solver, index) => (
                            <motion.div
                              key={solver.id}
                              initial={{ y: 50, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: index * 0.15 }}
                              className={`relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer group ${
                                solver.id === state.bestSolver.id
                                  ? 'border-gradient-to-r from-green-500 to-emerald-500 shadow-2xl shadow-green-500/20 bg-gradient-to-br from-green-900/20 to-emerald-900/20 scale-105'
                                  : 'border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:bg-white/10 hover:scale-102'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-white">{solver.name}</h3>
                                {solver.id === state.bestSolver.id && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                                    BEST
                                  </span>
                                )}
                              </div>
                              <div className="text-3xl font-black text-white mb-2">
                                {solver.price}
                              </div>
                              <div className="text-sm text-gray-400 mb-3">
                                Fulfilled in {solver.time}
                              </div>
                              <div className="flex items-center text-yellow-400">
                                <span>★</span><span>★</span><span>★</span><span>★</span>
                                <span className={`${solver.id === 1 ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                              </div>
                              {solver.id === state.bestSolver.id && (
                                <motion.div
                                  className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"
                                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                            </motion.div>
                          ))}
                        </motion.div>

                        {state.bestSolver && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10 p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl"
                          >
                            <div className="flex items-center">
                              <div className="text-3xl text-green-400 mr-4">🎉</div>
                              <div>
                                <h3 className="font-bold text-xl text-green-300">Best Price Found!</h3>
                                <p className="text-green-200 mt-1">
                                  {state.bestSolver.name} offers the best price: <span className="font-bold">{state.bestSolver.price}</span>
                                </p>
                              </div>
                            </div>

                            {/* Price Comparison */}
                            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-xs text-gray-400">Market Price</div>
                                <div className="font-bold text-white">0.0515 ETH</div>
                              </div>
                              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-xs text-gray-400">Your Price</div>
                                <div className="font-bold text-green-400">{state.bestSolver.price}</div>
                              </div>
                              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-xs text-gray-400">Savings</div>
                                <div className="font-bold text-green-400">0.0003 ETH</div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleNext}
                          className="w-full py-5 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-700 hover:to-indigo-800 text-white font-bold text-lg rounded-2xl shadow-xl shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center space-x-3"
                        >
                          <span>Proceed to Settlement</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L11.586 11H2a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </motion.button>

                        <div className="mt-6 text-center">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Solvers compete autonomously — no middleman
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 4: On-chain Settlement */}
                {state.step === 4 && (
                  <div className="text-center">
                    <motion.h2 
                      className="text-4xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      4. On-chain Settlement
                    </motion.h2>

                    {state.settlementStatus === 'pending' ? (
                      <>
                        <div className="flex flex-col items-center space-y-8">
                          <div className="relative">
                            <div className="w-20 h-20 border-4 border-cyan-500/30 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-20 h-20 border-4 border-cyan-400/50 rounded-full animate-spin"></div>
                            <div className="absolute inset-4 w-12 h-12 border-4 border-cyan-300/40 rounded-full animate-ping"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-300">Settling Your Swap...</h3>
                          <p className="text-gray-400 max-w-md">
                            The winning solver is finalizing your transaction on-chain. No gas fee incurred.
                          </p>

                          {/* API Call Animation — Fluid, Contained, Elegant */}
                          <div className="mt-12 w-full max-w-2xl">
                            <div className="flex flex-wrap justify-center gap-4">
                              {state.apiCalls.map((call, idx) => (
                                <motion.div
                                  key={call.id}
                                  className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl"
                                  initial={{ x: -100, opacity: 0 }}
                                  animate={{ 
                                    x: [0, 200, 400, 600, 800], 
                                    opacity: [0, 1, 1, 1, 0] 
                                  }}
                                  transition={{ 
                                    duration: 4, 
                                    times: [0, 0.1, 0.3, 0.7, 1], 
                                    ease: "linear" 
                                  }}
                                >
                                  {call.status === 'pending' ? (
                                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  ) : call.status === 'success' ? (
                                    <span className="text-2xl">✅</span>
                                  ) : (
                                    <span className="text-2xl">❌</span>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Transaction Details */}
                          <div className="mt-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full max-w-md">
                            <div className="font-bold text-gray-300 mb-4">Transaction Details</div>
                            <div className="space-y-3 text-left">
                              <div className="flex justify-between">
                                <span className="text-gray-400">From:</span>
                                <span>{state.intentData.amountIn} {state.intentData.tokenIn}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">To:</span>
                                <span>{state.intentData.minAmountOut} {state.intentData.tokenOut}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Network:</span>
                                <span>{state.intentData.chainOut}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Solver:</span>
                                <span className="text-cyan-300">{state.bestSolver?.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Expiry:</span>
                                <span>{state.intentData.expiry}</span>
                              </div>
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
                        <div className="text-9xl text-green-400 mb-8 animate-bounce">✅</div>
                        <h3 className="text-5xl font-black mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                          Swap Completed!
                        </h3>
                        <div className="max-w-md mx-auto bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-3xl p-8 border border-green-500/20 mb-10">
                          <div className="grid grid-cols-2 gap-6 text-left">
                            <div>
                              <p className="text-sm text-gray-400">From</p>
                              <p className="text-2xl font-bold">{state.intentData.amountIn} {state.intentData.tokenIn}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">To</p>
                              <p className="text-2xl font-bold text-green-300">~{state.intentData.minAmountOut} {state.intentData.tokenOut}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Network</p>
                              <p className="text-xl font-bold">{state.intentData.chainOut}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Status</p>
                              <p className="text-xl font-bold text-green-400">Success</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 mb-10">
                          <span className="px-5 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                            Gasless
                          </span>
                          <span className="px-5 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                            MEV Protected
                          </span>
                          <span className="px-5 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                            Cross-chain
                          </span>
                        </div>

                        <p className="text-gray-300 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                          Your swap was executed at the optimal price — fully gasless, MEV-resistant, and cross-chain verified.
                        </p>

                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetDemo}
                          className="px-12 py-5 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-700 hover:to-indigo-800 text-white font-bold text-xl rounded-2xl shadow-xl shadow-cyan-500/20 transition-all duration-300"
                        >
                          Start New Swap
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                      >
                        <div className="text-9xl text-red-400 mb-8 animate-pulse">⌛</div>
                        <h3 className="text-5xl font-black mb-6 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                          Intent Expired
                        </h3>
                        <p className="text-gray-300 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                          No solver fulfilled your intent within the time limit. No cost was incurred. Try again with a longer expiry.
                        </p>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetDemo}
                          className="px-12 py-5 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-700 hover:to-indigo-800 text-white font-bold text-xl rounded-2xl shadow-xl shadow-cyan-500/20 transition-all duration-300"
                        >
                          Try Again
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Swap History */}
          {state.swapHistory.length > 0 && (
            <motion.div 
              className="mt-8 p-6 border border-white/10 rounded-2xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">Recent Swaps</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {state.swapHistory.map((swap, index) => (
                  <motion.div
                    key={swap.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {swap.tokenIn.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{swap.amountIn} {swap.tokenIn} → {swap.minAmountOut} {swap.tokenOut}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {new Date(swap.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full text-xs font-medium border border-green-500/30">
                        Success
                      </span>
                      <div className="text-green-400 font-bold">${Number(swap.amountIn).toFixed(2)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* API Specification Section */}
      <section className="max-w-7xl mx-auto p-8 mt-12 border-t border-white/10 pt-8">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">API Specification</h2>
        <div className="bg-gradient-to-r from-gray-900/60 to-gray-950/60 rounded-2xl p-6 border border-white/10 overflow-x-auto">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
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

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-8 text-center text-gray-500 border-t border-white/10 mt-12">
        <p className="text-sm">
          Crafted with ❤️ by{' '}
          <a 
            href="https://x.com/fz_aamir" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            @fz_aamir
          </a>
          — A 2025-native DeFi interface built for elegance, performance, and immersion.
        </p>
      </footer>
    </div>
  );
};

export default App;