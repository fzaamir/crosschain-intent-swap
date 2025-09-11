// App.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const App = () => {
  // Load initial state
  const loadInitialState = () => {
    try {
      const savedState = localStorage.getItem("tokenSwapState");
      if (savedState) return JSON.parse(savedState);
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }
    return {
      step: 1,
      intentData: {
        tokenIn: "USDC",
        tokenOut: "ETH",
        chainIn: "Ethereum",
        chainOut: "Arbitrum",
        amountIn: "100",
        minAmountOut: "0.05",
        expiry: "30 seconds",
      },
      signing: false,
      signed: false,
      solvers: [],
      bestSolver: null,
      settlementStatus: "pending",
      apiCalls: [],
      swapHistory: [],
      achievements: [
        { id: 1, name: "First Swap", description: "Complete your first token swap", unlocked: false },
        { id: 2, name: "Cross-chain Explorer", description: "Swap between different chains", unlocked: false },
        { id: 3, name: "MEV Protector", description: "Complete 5 gasless swaps", unlocked: false },
      ],
    };
  };

  const [state, setState] = useState(loadInitialState);
  const [showAchievement, setShowAchievement] = useState(null);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("tokenSwapState", JSON.stringify(state));
  }, [state]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      intentData: { ...prev.intentData, [name]: value },
    }));
  };

  // === Expiry helpers ===
  const getSolverDelay = (expiry) => {
    switch (expiry) {
      case "30 seconds": return [5000, 10000];
      case "1 min": return [10000, 20000];
      case "5 min": return [20000, 40000];
      default: return [3000, 5000];
    }
  };
  const getSettlementDelay = (expiry) => {
    switch (expiry) {
      case "30 seconds": return [3000, 7000];
      case "1 min": return [6000, 12000];
      case "5 min": return [15000, 30000];
      default: return [3000, 7000];
    }
  };

  // === Cursor effect ===
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // === Handle steps ===
  const handleNext = useCallback(() => {
    setState((prev) => {
      if (prev.step === 1) return { ...prev, step: 2 };

      if (prev.step === 2) {
        const newState = { ...prev, signing: true };
        setTimeout(() => {
          setState((p) => ({ ...p, signing: false, signed: true, step: 3 }));
        }, 1500);
        return newState;
      }

      if (prev.step === 3) {
        const mockSolvers = [
          { id: 1, name: "UniswapX", price: "0.0512 ETH", time: "0.8s" },
          { id: 2, name: "CoW Swap", price: "0.0508 ETH", time: "0.6s" },
          { id: 3, name: "1inch Fusion", price: "0.0515 ETH", time: "0.9s" },
          { id: 4, name: "Matcha", price: "0.0509 ETH", time: "0.7s" },
        ];
        const sortedSolvers = [...mockSolvers].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        const newState = { ...prev, solvers: sortedSolvers, bestSolver: sortedSolvers[0] };

        const [min, max] = getSolverDelay(prev.intentData.expiry);
        const delay = min + Math.random() * (max - min);
        setTimeout(() => setState((p) => ({ ...p, step: 4 })), delay);
        return newState;
      }

      if (prev.step === 4) {
        const isSuccess = Math.random() > 0.1;
        const [min, max] = getSettlementDelay(prev.intentData.expiry);
        const executionTime = min + Math.random() * (max - min);

        const newApiCall = {
          id: Date.now(),
          from: `${prev.intentData.amountIn} ${prev.intentData.tokenIn} on ${prev.intentData.chainIn}`,
          to: `${prev.intentData.minAmountOut} ${prev.intentData.tokenOut} on ${prev.intentData.chainOut}`,
          solver: prev.bestSolver.name,
          status: "pending",
        };
        const newState = { ...prev, apiCalls: [...prev.apiCalls, newApiCall] };

        setTimeout(() => {
          setState((p) => {
            const updatedCalls = p.apiCalls.map((c) =>
              c.id === newApiCall.id ? { ...c, status: isSuccess ? "success" : "timeout" } : c
            );
            let newHistory = p.swapHistory;
            let newAchievements = [...p.achievements];

            if (isSuccess) {
              const newSwap = { ...p.intentData, timestamp: new Date().toISOString(), id: Date.now() };
              newHistory = [newSwap, ...p.swapHistory.slice(0, 9)];
              if (!newAchievements[0].unlocked) { newAchievements[0].unlocked = true; setShowAchievement(newAchievements[0]); }
              if (p.intentData.chainIn !== p.intentData.chainOut && !newAchievements[1].unlocked) { newAchievements[1].unlocked = true; setShowAchievement(newAchievements[1]); }
              if (newHistory.length >= 5 && !newAchievements[2].unlocked) { newAchievements[2].unlocked = true; setShowAchievement(newAchievements[2]); }
            }

            return { ...p, settlementStatus: isSuccess ? "success" : "timeout", apiCalls: updatedCalls, swapHistory: newHistory, achievements: newAchievements };
          });
        }, executionTime);

        return newState;
      }

      return prev;
    });
  }, []);

  // Reset demo
  const resetDemo = () => setState((p) => ({
    ...p, step: 1, signing: false, signed: false, solvers: [], bestSolver: null, settlementStatus: "pending", apiCalls: []
  }));
  const resetAllData = () => { localStorage.removeItem("tokenSwapState"); window.location.reload(); };

  // Options
  const tokenOptions = ["USDC", "USDT", "DAI", "WETH", "WBTC"];
  const chainOptions = ["Ethereum", "Polygon", "BNB Chain", "Arbitrum", "Optimism", "Base"];
  const expiryOptions = ["30 seconds", "1 min", "5 min"];

  // Progress bar
  const progressWidth = `${Math.min((state.step / 4) * 100, 100)}%`;
  const calculateGasSavings = () => 50;
  const priceImpact = useMemo(() => Math.random() * 2, [state.step]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div className="absolute w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" animate={{ x: [0, 150, -150, 0], y: [0, -100, 100, 0] }} transition={{ repeat: Infinity, duration: 25 }} />
      <motion.div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/3 left-1/2" animate={{ x: [0, -200, 200, 0], y: [0, 150, -150, 0] }} transition={{ repeat: Infinity, duration: 40 }} />

      {/* Custom cursor */}
      <motion.div className="fixed top-0 left-0 w-8 h-8 rounded-full bg-indigo-400/40 pointer-events-none mix-blend-screen z-50" animate={{ x: cursor.x - 16, y: cursor.y - 16 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />

      {/* Header */}
      <header className="p-6 border-b border-gray-800 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }} className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Token Swap with INTENTs
          </motion.h1>
          <div className="flex items-center mt-4 md:mt-0 space-x-3">
            <button onClick={resetAllData} className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-300">Reset All</button>
            <div className="px-4 py-2 bg-gray-800 rounded-lg flex items-center"><span className="mr-2">🌙</span> Dark Mode</div>
          </div>
        </div>
      </header>
            {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2 relative z-10">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: progressWidth }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto p-4 gap-6 relative z-10">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4">
          {/* Flowchart */}
          <div className="w-full p-4 border rounded-lg shadow-md bg-gray-800 mb-6">
            <h2 className="font-semibold mb-4 text-gray-200">Swap Flow</h2>
            <div className="relative pl-8">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
              <ul className="space-y-6">
                {[1, 2, 3, 4].map((s) => (
                  <li key={s} className="relative">
                    <div
                      className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                        state.step === s
                          ? "bg-green-500 border-green-500"
                          : state.step > s
                          ? "bg-green-500 border-green-500"
                          : "bg-gray-800 border-gray-600"
                      }`}
                    />
                    <div
                      className={`pl-6 ${
                        state.step === s
                          ? "text-green-400 font-semibold"
                          : state.step > s
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="block">
                        {s === 1 && "Set Goal"}
                        {s === 2 && "Sign Intent"}
                        {s === 3 && "Solvers Compete"}
                        {s === 4 && "On-chain Settlement"}
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
              {state.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg flex items-center ${
                    achievement.unlocked
                      ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white"
                      : "bg-gray-700 text-gray-500"
                  }`}
                >
                  <div className="text-xl mr-3">
                    {achievement.unlocked ? "🏆" : "🔒"}
                  </div>
                  <div>
                    <div
                      className={`font-medium ${
                        achievement.unlocked ? "text-white" : ""
                      }`}
                    >
                      {achievement.name}
                    </div>
                    <div className="text-xs">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content container */}
        <main className="flex-1">
          <div className="p-6 border rounded-xl shadow-lg bg-gray-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step sections go here */}
                                {/* Step 1: Set Goal */}
                {state.step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-white">
                      1. Set Goal
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Token In */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Token In
                        </label>
                        <select
                          name="tokenIn"
                          value={state.intentData.tokenIn}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          {tokenOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Token Out */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Token Out
                        </label>
                        <select
                          name="tokenOut"
                          value={state.intentData.tokenOut}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          {tokenOptions
                            .filter((t) => t !== state.intentData.tokenIn)
                            .map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Chain In */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Chain In
                        </label>
                        <select
                          name="chainIn"
                          value={state.intentData.chainIn}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          {chainOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Chain Out */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Chain Out
                        </label>
                        <select
                          name="chainOut"
                          value={state.intentData.chainOut}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          {chainOptions
                            .filter((c) => c !== state.intentData.chainIn)
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Amount In */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Amount In
                        </label>
                        <input
                          type="number"
                          name="amountIn"
                          value={state.intentData.amountIn}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Minimum Receive */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Minimum Receive
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          name="minAmountOut"
                          value={state.intentData.minAmountOut}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Expiry */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Expiry Time
                        </label>
                        <select
                          name="expiry"
                          value={state.intentData.expiry}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          {expiryOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price Impact Bar */}
                      <div className="flex items-end">
                        <div className="bg-indigo-900/30 p-3 rounded-lg w-full">
                          <div className="text-sm text-indigo-300 mb-1">
                            Price Impact
                          </div>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                              <div
                                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                                style={{ width: `${priceImpact}%` }}
                              />
                            </div>
                            <div className="text-sm font-medium text-green-400">
                              {priceImpact.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Next button */}
                    <div className="flex flex-wrap gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNext}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md transition duration-300"
                      >
                        Next: Sign Intent
                      </motion.button>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-1">ⓘ</span>
                        Gasless • MEV Protected • Cross-chain
                      </div>
                    </div>
                  </div>
                )}
                                {/* Step 2: Sign Intent */}
                {state.step === 2 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6 text-white">
                      2. Sign Intent
                    </h2>

                    {!state.signed ? (
                      <div className="flex flex-col items-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNext}
                          disabled={state.signing}
                          className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center ${
                            state.signing
                              ? "bg-yellow-600 cursor-not-allowed"
                              : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                          }`}
                        >
                          {state.signing ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Signing...
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                              Sign with Wallet
                            </>
                          )}
                        </motion.button>

                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="mt-6 text-gray-400 max-w-md text-center"
                        >
                          By signing, you're creating a permissionless intent
                          that solvers can fulfill without requiring gas fees or
                          exposing your trade to MEV.
                        </motion.p>

                        {/* Gas Savings */}
                        <div className="mt-8 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl w-full max-w-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-green-300 font-medium">
                              Gas Savings
                            </span>
                            <span className="text-green-400 font-bold">
                              ${calculateGasSavings().toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full"
                              style={{ width: "100%" }}
                            />
                          </div>
                          <div className="text-xs text-green-400 mt-2">
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
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Intent Signed Successfully!
                        </h3>
                        <p className="text-gray-400 mb-6">
                          Your swap intent has been created and is now available
                          for solvers to fulfill.
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
                    <h2 className="text-2xl font-bold mb-6 text-white">
                      3. Solvers Compete
                    </h2>

                    {state.solvers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="text-gray-400">
                          Solvers are competing for your intent...
                        </p>

                        {/* Chain flow animation */}
                        <div className="mt-8 w-full max-w-md">
                          <div className="flex items-center justify-between">
                            <div className="px-4 py-2 bg-indigo-900/30 rounded-lg">
                              {state.intentData.chainIn}
                            </div>
                            <div className="flex-1 mx-4 relative">
                              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                              <motion.div
                                className="absolute top-0 left-0 w-4 h-4 bg-indigo-500 rounded-full"
                                animate={{ x: [0, 200] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1.5,
                                }}
                              />
                            </div>
                            <div className="px-4 py-2 bg-purple-900/30 rounded-lg">
                              {state.intentData.chainOut}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Solvers list */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                        >
                          {state.solvers.map((solver, i) => (
                            <motion.div
                              key={solver.id}
                              initial={{ y: 50, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className={`border rounded-xl p-5 shadow-md ${
                                solver.id === state.bestSolver.id
                                  ? "border-2 border-green-500 bg-gradient-to-br from-green-900/20 to-emerald-900/20 scale-105"
                                  : "border-gray-700 bg-gray-800"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-white">
                                  {solver.name}
                                </h3>
                                {solver.id === state.bestSolver.id && (
                                  <span className="px-2 py-1 bg-green-900 text-green-300 text-xs font-semibold rounded">
                                    BEST
                                  </span>
                                )}
                              </div>
                              <div className="text-2xl font-bold text-white mb-1">
                                {solver.price}
                              </div>
                              <div className="text-sm text-gray-400">
                                Fulfilled in {solver.time}
                              </div>

                              {/* Solver rating */}
                              <div className="mt-3 flex items-center">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={
                                      idx < 4 ||
                                      (idx === 4 && solver.id === 1)
                                        ? "text-yellow-400 mr-1"
                                        : "text-gray-600 mr-1"
                                    }
                                  >
                                    ★
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>

                        {/* Best price highlight */}
                        {state.bestSolver && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="text-2xl text-green-500 mr-3">
                                🎉
                              </div>
                              <div>
                                <h3 className="font-bold text-green-300">
                                  Best Price Found!
                                </h3>
                                <p className="text-green-400">
                                  {state.bestSolver.name} offers the best price:{" "}
                                  {state.bestSolver.price}
                                </p>
                              </div>
                            </div>

                            {/* Price comparison */}
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                              <div className="p-2 bg-gray-700 rounded">
                                <div className="text-xs text-gray-400">
                                  Market Price
                                </div>
                                <div className="font-bold">0.0515 ETH</div>
                              </div>
                              <div className="p-2 bg-gray-700 rounded">
                                <div className="text-xs text-gray-400">
                                  Your Price
                                </div>
                                <div className="font-bold text-green-400">
                                  {state.bestSolver.price}
                                </div>
                              </div>
                              <div className="p-2 bg-gray-700 rounded">
                                <div className="text-xs text-gray-400">
                                  Savings
                                </div>
                                <div className="font-bold text-green-400">
                                  0.0003 ETH
                                </div>
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
                          <div className="flex items-center text-sm text-gray-400">
                            <span className="mr-1">ⓘ</span>
                            Multiple solvers compete to give you the best price
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 4: On-chain Settlement */}
                {state.step === 4 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6 text-white">
                      4. On-chain Settlement
                    </h2>

                    {state.settlementStatus === "pending" ? (
                      <>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                          Settling Swap...
                        </h3>
                        <p className="text-gray-400">
                          Your intent is being fulfilled on-chain
                        </p>
                      </>
                    ) : state.settlementStatus === "success" ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                      >
                        <div className="text-7xl text-green-500 mb-6">✅</div>
                        <h3 className="text-3xl font-bold text-white mb-4">
                          Swap Completed!
                        </h3>
                        <div className="max-w-md mx-auto bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 mb-8 border border-green-800">
                          <div className="grid grid-cols-2 gap-4 text-left">
                            <div>
                              <p className="text-sm text-gray-400">From</p>
                              <p className="font-semibold">
                                {state.intentData.amountIn}{" "}
                                {state.intentData.tokenIn}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">To</p>
                              <p className="font-semibold">
                                ~{state.intentData.minAmountOut}{" "}
                                {state.intentData.tokenOut}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Network</p>
                              <p className="font-semibold">
                                {state.intentData.chainOut}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Status</p>
                              <p className="font-semibold text-green-400">
                                Success
                              </p>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetDemo}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300"
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
                        <div className="text-7xl text-red-500 mb-6">⌛</div>
                        <h3 className="text-3xl font-bold text-white mb-4">
                          Intent Expired
                        </h3>
                        <p className="text-gray-400 max-w-md mb-6">
                          No solver was able to fulfill your intent within the
                          time limit. No cost was incurred.
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
            <div className="mt-6 p-6 border rounded-xl shadow-lg bg-gray-800">
              <h3 className="text-xl font-semibold mb-4 text-white">
                Recent Swaps
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {state.swapHistory.map((swap, i) => (
                  <motion.div
                    key={swap.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 bg-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-3">
                        {swap.tokenIn.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {swap.amountIn} {swap.tokenIn} → {swap.minAmountOut}{" "}
                          {swap.tokenOut}
                        </div>
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
      <section className="max-w-6xl mx-auto p-6 mt-6 border-t border-gray-800 pt-6 relative z-10">
        <h2 className="text-xl font-semibold mb-4 text-white">
          API Simulation
        </h2>
        <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto border border-gray-700">
          <pre className="text-sm text-gray-300">{`POST /v1/intents
{
  "tokenIn": "${state.intentData.tokenIn}",
  "tokenOut": "${state.intentData.tokenOut}",
  "chainIn": "${state.intentData.chainIn}",
  "chainOut": "${state.intentData.chainOut}",
  "amountIn": "${state.intentData.amountIn}",
  "minAmountOut": "${state.intentData.minAmountOut}",
  "expiry": "${state.intentData.expiry}"
}`}</pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 py-6 border-t border-gray-800 text-center text-gray-400 relative z-10">
        <p>
          Made with <span className="text-red-500">❤️</span> by{" "}
          <a
            href="https://x.com/fz_aamir"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            @fz_aamir
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;





      
