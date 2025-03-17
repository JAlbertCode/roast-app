import React from 'react';
import { motion } from 'framer-motion';

interface ApiKeyAlertProps {
  missingKeys: string[];
  onClose: () => void;
}

const ApiKeyAlert: React.FC<ApiKeyAlertProps> = ({ missingKeys, onClose }) => {
  if (missingKeys.length === 0) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-center"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
    >
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 max-w-2xl w-full rounded shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">Missing API Keys</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                The following API keys are missing from your environment variables:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {missingKeys.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
              <p className="mt-2">
                Create a <code className="bg-yellow-200 px-1 py-0.5 rounded">.env.local</code> file with the required API keys to use all features.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 bg-yellow-100 text-yellow-500 hover:text-yellow-700 rounded-full p-1"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ApiKeyAlert;
