import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChainId, CHAIN_NAMES } from '../utils/chains/types';
import { chainConfigs } from '../utils/chains/config';

interface ChainSelectorProps {
  selectedChain: ChainId;
  onChainSelect: (chain: ChainId) => void;
  disabled?: boolean;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChain,
  onChainSelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const selectChain = (chain: ChainId) => {
    onChainSelect(chain);
    setIsOpen(false);
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -10,
      height: 0,
      transition: {
        duration: 0.2
      }
    },
    visible: { 
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <div className="relative">
      <motion.button
        className={`flex items-center justify-between w-full p-2 border rounded-md ${
          disabled ? 'cursor-not-allowed opacity-60 bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
        }`}
        onClick={toggleDropdown}
        disabled={disabled}
        variants={buttonVariants}
        whileHover={!disabled ? "hover" : undefined}
        whileTap={!disabled ? "tap" : undefined}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ color: chainConfigs[selectedChain].color }}>
            {chainConfigs[selectedChain].icon}
          </span>
          <span>{CHAIN_NAMES[selectedChain]}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </motion.button>

      <motion.div
        className="absolute mt-1 w-full bg-white dark:bg-gray-700 border rounded-md shadow-lg z-10 overflow-hidden"
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        variants={dropdownVariants}
      >
        <ul>
          {Object.keys(CHAIN_NAMES).map((chainId) => (
            <motion.li 
              key={chainId}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${
                chainId === selectedChain ? 'bg-gray-100 dark:bg-gray-600' : ''
              }`}
              onClick={() => selectChain(chainId as ChainId)}
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg" style={{ color: chainConfigs[chainId as ChainId].color }}>
                  {chainConfigs[chainId as ChainId].icon}
                </span>
                <span>{CHAIN_NAMES[chainId as ChainId]}</span>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default ChainSelector;
