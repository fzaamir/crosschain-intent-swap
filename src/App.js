import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSwapStore } from './store/useSwapStore';
import FlowChart from './components/FlowChart';
import SetGoal from './components/SetGoal';
import SignIntent from './components/SignIntent';
import SolversCompete from './components/SolversCompete';
import OnChainSettlement from './components/OnChainSettlement';
import './App.css';

const StepRenderer = () => {
  const step = useSwapStore(state => state.step);
  const darkMode = useSwapStore(state => state.darkMode);
  const toggleDarkMode = useSwapStore(state => state.toggleDarkMode);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto p-4 gap-6">
        {/* Flowchart Sidebar */}
        <aside className="w-full md:w-1/4">
          <FlowChart />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-6 border rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <Routes>
              <Route path="/step/1" element={<SetGoal />} />
              <Route path="/step/2" element={<SignIntent />} />
              <Route path="/step/3" element={<SolversCompete />} />
              <Route path="/step/4" element={<OnChainSettlement />} />
              <Route path="*" element={<Navigate to="/step/1" />} />
            </Routes>
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
  "tokenIn": "${useSwapStore.getState().intentData.tokenIn}",
  "tokenOut": "${useSwapStore.getState().intentData.tokenOut}",
  "chainIn": "${useSwapStore.getState().intentData.chainIn}",
  "chainOut": "${useSwapStore.getState().intentData.chainOut}",
  "amountIn": "${useSwapStore.getState().intentData.amountIn}",
  "minAmountOut": "${useSwapStore.getState().intentData.minAmountOut}",
  "expiry": "${useSwapStore.getState().intentData.expiry}"
}`}
          </pre>
        </div>
      </section>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <StepRenderer />
    </Router>
  );
};

export default App;