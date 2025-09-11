import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [step, setStep] = useState(1);
  const [intentData, setIntentData] = useState({
    tokenIn: 'USDC',
    tokenOut: 'ETH',
    chainIn: 'Ethereum',
    chainOut: 'Arbitrum',
    amountIn: '100',
    minAmountOut: '0.05',
    expiry: '15 min'
  });
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [solvers, setSolvers] = useState([]);
  const [bestSolver, setBestSolver] = useState(null);
  const [settlementStatus, setSettlementStatus] = useState('pending'); // pending, success, timeout

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIntentData(prev => ({ ...prev, [name]: value }));
  };

  // Handle next step
  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setSigning(true);
      setTimeout(() => {
        setSigning(false);
        setSigned(true);
        setTimeout(() => {
          setStep(3);
        }, 1500);
      }, 2000);
    } else if (step === 3) {
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
      
      setSolvers(sortedSolvers);
      setBestSolver(sortedSolvers[0]);
      setStep(4);
    } else if (step === 4) {
      // Simulate settlement
      setTimeout(() => {
        setSettlementStatus('success');
      }, 2000);
    }
  };

  // Reset the demo
  const resetDemo = () => {
    setStep(1);
    setSigned(false);
    setSolvers([]);
    setBestSolver(null);
    setSettlementStatus('pending');
  };

  // Token and chain options
  const tokenOptions = ['USDC', 'USDT', 'DAI', 'WETH', 'WBTC'];
  const chainOptions = ['Ethereum', 'Polygon', 'BNB Chain', 'Arbitrum', 'Optimism', 'Base'];

  // Progress bar width calculation
  const progressWidth = `${(step / 4) * 100}%`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Token Swap with INTENTs
          </h1>
          <button 
            onClick={toggleDarkMode}
            className="mt-4 md:mt-0 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-300 flex items-center"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
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
          <div className="w-full p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
            <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Swap Flow</h2>
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              <ul className="space-y-6">
                {[1, 2, 3, 4].map((s) => (
                  <li key={s} className="relative">
                    {/* Connector dot */}
                    <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                      step === s 
                        ? 'bg-green-500 border-green-500' 
                        : step > s 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500'
                    }`}></div>
                    
                    <div className={`pl-6 ${
                      step === s 
                        ? 'text-green-600 dark:text-green-400 font-semibold' 
                        : step > s 
                          ? 'text-gray-700 dark:text-gray-300' 
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span className="block">
                        {s === 1 && 'Set Goal'}
                        {s === 2 && 'Sign Intent'}
                        {s === 3 && 'Solvers Compete'}
                        {s === 4 && 'On-chain Settlement'}
                      </span>
                      {step === s && (
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
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-6 border rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Set Goal */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">1. Set Goal</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Token In
                        </label>
                        <select
                          name="tokenIn"
                          value={intentData.tokenIn}
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
                          value={intentData.tokenOut}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {tokenOptions.filter(t => t !== intentData.tokenIn).map(token => (
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
                          value={intentData.chainIn}
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
                          value={intentData.chainOut}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {chainOptions.filter(c => c !== intentData.chainIn).map(chain => (
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
                          value={intentData.amountIn}
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
                          value={intentData.minAmountOut}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0.05"
                        />
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
                {step === 2 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">2. Sign Intent</h2>
                    
                    {!signed ? (
                      <div className="flex flex-col items-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNext}
                          disabled={signing}
                          className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center ${
                            signing 
                              ? 'bg-yellow-500 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                          }`}
                        >
                          {signing ? (
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
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">3. Solvers Compete</h2>
                    
                    {solvers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Solvers are competing for your intent...</p>
                      </div>
                    ) : (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                        >
                          {solvers.map((solver, index) => (
                            <motion.div
                              key={solver.id}
                              initial={{ y: 50, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className={`border rounded-xl p-5 shadow-md ${
                                solver.id === bestSolver.id
                                  ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{solver.name}</h3>
                                {solver.id === bestSolver.id && (
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
                            </motion.div>
                          ))}
                        </motion.div>
                        
                        {bestSolver && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="text-2xl text-green-500 mr-3">🎉</div>
                              <div>
                                <h3 className="font-bold text-green-700 dark:text-green-300">Best Price Found!</h3>
                                <p className="text-green-600 dark:text-green-400">
                                  {bestSolver.name} offers the best price: {bestSolver.price}
                                </p>
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
                {step === 4 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">4. On-chain Settlement</h2>
                    
                    {settlementStatus === 'pending' ? (
                      <>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Settling Swap...
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Your intent is being fulfilled on-chain
                        </p>
                      </>
                    ) : settlementStatus === 'success' ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                      >
                        <div className="text-7xl text-green-500 mb-6">✅</div>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                          Swap Completed!
                        </h3>
                        <div className="max-w-md mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-8">
                          <div className="grid grid-cols-2 gap-4 text-left">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                              <p className="font-semibold">{intentData.amountIn} {intentData.tokenIn}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">To</p>
                              <p className="font-semibold">~{intentData.minAmountOut} {intentData.tokenOut}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Network</p>
                              <p className="font-semibold">{intentData.chainOut}</p>
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
        </main>
      </div>

      {/* API Simulation Section */}
      <section className="max-w-6xl mx-auto p-6 mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">API Simulation</h2>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-800 dark:text-gray-200">
{`POST /v1/intents
{
  "tokenIn": "${intentData.tokenIn}",
  "tokenOut": "${intentData.tokenOut}",
  "chainIn": "${intentData.chainIn}",
  "chainOut": "${intentData.chainOut}",
  "amountIn": "${intentData.amountIn}",
  "minAmountOut": "${intentData.minAmountOut}",
  "expiry": "${intentData.expiry}"
}`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default App;