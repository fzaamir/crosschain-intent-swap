import React from 'react';
import { useSwapStore } from '../store/useSwapStore';

const FlowChart = () => {
  const step = useSwapStore(state => state.step);
  const steps = [
    { id: 1, title: 'Set Goal' },
    { id: 2, title: 'Sign Intent' },
    { id: 3, title: 'Solvers Compete' },
    { id: 4, title: 'On-chain Settlement' }
  ];

  return (
    <div className="w-full p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Swap Flow</h2>
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
        
        <ul className="space-y-6">
          {steps.map((s) => (
            <li key={s.id} className="relative">
              {/* Connector dot */}
              <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                step === s.id 
                  ? 'bg-green-500 border-green-500' 
                  : step > s.id 
                    ? 'bg-green-500 border-green-500' 
                    : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500'
              }`}></div>
              
              <div className={`pl-6 ${
                step === s.id 
                  ? 'text-green-600 dark:text-green-400 font-semibold' 
                  : step > s.id 
                    ? 'text-gray-700 dark:text-gray-300' 
                    : 'text-gray-500 dark:text-gray-400'
              }`}>
                <span className="block">{s.title}</span>
                {step === s.id && (
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
  );
};

export default FlowChart;