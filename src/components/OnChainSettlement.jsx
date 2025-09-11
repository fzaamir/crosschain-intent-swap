import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSwapStore } from '../store/useSwapStore';
import { fadeIn } from '../utils/animations';

const OnChainSettlement = () => {
  const [status, setStatus] = useState('pending'); // pending, success, timeout
  const intentData = useSwapStore(state => state.intentData);

  useEffect(() => {
    // Simulate settlement process
    const timer = setTimeout(() => {
      setStatus('success');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="p-1"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">4. On-chain Settlement</h2>
      
      <div className="flex flex-col items-center justify-center py-8">
        {status === 'pending' ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Settling Swap...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your intent is being fulfilled on-chain
            </p>
          </>
        ) : status === 'success' ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-7xl text-green-500 mb-6">âœ…</div>
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
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Your swap was executed at the best price without gas fees or MEV exposure.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-7xl text-red-500 mb-6">âŒš</div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Intent Expired
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
              No solver was able to fulfill your intent within the time limit. No cost was incurred.
            </p>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300">
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default OnChainSettlement;