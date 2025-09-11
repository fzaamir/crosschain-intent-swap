import React from 'react';
import { motion } from 'framer-motion';
import { useSwapStore } from '../store/useSwapStore';
import { fadeIn } from '../utils/animations';

const SetGoal = () => {
  const intentData = useSwapStore(state => state.intentData);
  const updateIntent = useSwapStore(state => state.updateIntent);
  const setStep = useSwapStore(state => state.setStep);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateIntent({ [name]: value });
  };

  const handleNext = () => {
    // Update the step in the store
    setStep(2);
  };

  const tokenOptions = ['USDC', 'USDT', 'DAI', 'WETH', 'WBTC'];
  const chainOptions = ['Ethereum', 'Polygon', 'BNB Chain', 'Arbitrum', 'Optimism', 'Base'];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="p-1"
    >
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
      
      <button
        onClick={handleNext}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        Next: Sign Intent :
      </button>
    </motion.div>
  );
};

export default SetGoal;