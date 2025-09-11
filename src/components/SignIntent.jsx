import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSwapStore } from '../store/useSwapStore';
import { fadeIn, slideIn } from '../utils/animations';

const SignIntent = () => {
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const setStep = useSwapStore(state => state.setStep);

  const handleSign = () => {
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setSigned(true);
    }, 1500);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="p-1"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">2. Sign Intent</h2>
      
      <div className="flex flex-col items-center justify-center py-8">
        {!signed ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSign}
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
              variants={slideIn}
              className="mt-6 text-gray-600 dark:text-gray-400 max-w-md text-center"
            >
              By signing, you're creating a permissionless intent that solvers can fulfill without requiring gas fees or exposing your trade to MEV.
            </motion.p>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-6xl text-green-500 mb-4">âœ…</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Intent Signed Successfully!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your swap intent has been created and is now available for solvers to fulfill.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300"
            >
              Next: Solvers Compete
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SignIntent;