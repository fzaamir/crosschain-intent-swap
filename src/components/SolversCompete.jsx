import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSwapStore } from '../store/useSwapStore';
import { staggerContainer, staggerItem } from '../utils/animations';

const SolversCompete = () => {
  const [solvers, setSolvers] = useState([]);
  const [bestSolver, setBestSolver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const setStep = useSwapStore(state => state.setStep);

  useEffect(() => {
    // Simulate solvers bidding
    const timer = setTimeout(() => {
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
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Solvers are competing for your intent...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">3. Solvers Compete</h2>
      
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {solvers.map((solver, index) => (
          <motion.div
            key={solver.id}
            variants={staggerItem}
            className={`solver-card border rounded-xl p-5 shadow-md ${
              solver.id === bestSolver.id
                ? 'best border-2'
                : 'border-gray-200 dark:border-gray-700'
            } bg-white dark:bg-gray-800`}
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
            <div className="text-2xl text-green-500 mr-3">ðŸŽ‰</div>
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
          onClick={() => setStep(4)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300"
        >
          Settle Swap
        </motion.button>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="mr-1">â“˜</span>
          <span>Multiple solvers compete to give you the best price</span>
        </div>
      </div>
    </div>
  );
};

export default SolversCompete;