import { ChainId } from './chains/types';

// Required API keys for the application
const REQUIRED_API_KEYS = {
  ANURA_API_KEY: 'Anura API',
  NEXT_PUBLIC_ETHERSCAN_API_KEY: 'Ethereum (Etherscan)'
};

// Optional API keys for additional blockchains
const OPTIONAL_CHAIN_API_KEYS: Record<string, ChainId> = {
  NEXT_PUBLIC_POLYGONSCAN_API_KEY: 'polygon',
  NEXT_PUBLIC_ARBISCAN_API_KEY: 'arbitrum',
  NEXT_PUBLIC_OPTIMISM_API_KEY: 'optimism',
  NEXT_PUBLIC_BASESCAN_API_KEY: 'base'
};

/**
 * Check for missing required API keys and available chains
 */
export const checkApiKeys = () => {
  // Check required API keys
  const missingRequiredKeys: string[] = [];
  
  Object.entries(REQUIRED_API_KEYS).forEach(([key, name]) => {
    if (!process.env[key]) {
      missingRequiredKeys.push(name);
    }
  });

  // Check which chains are available based on API keys
  const availableChains: ChainId[] = ['ethereum']; // Ethereum is always available if required keys are present
  
  Object.entries(OPTIONAL_CHAIN_API_KEYS).forEach(([key, chainId]) => {
    if (process.env[key]) {
      availableChains.push(chainId);
    }
  });

  return {
    missingRequiredKeys,
    availableChains,
    allKeysPresent: missingRequiredKeys.length === 0
  };
};
