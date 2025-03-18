import { ChainConfig, ChainId } from './types';

// Chain configurations
export const chainConfigs: Record<ChainId, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    explorerUrl: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io/api',
    apiKeyParam: 'apikey',
    icon: '⟠',
    color: '#627EEA',
    firstBlockOf2025: '19000000', // Approximate
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    apiUrl: 'https://api.polygonscan.com/api',
    apiKeyParam: 'apikey',
    icon: '⬢',
    color: '#8247E5',
    firstBlockOf2025: '55000000', // Approximate
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    shortName: 'ARB',
    explorerUrl: 'https://arbiscan.io',
    apiUrl: 'https://api.arbiscan.io/api',
    apiKeyParam: 'apikey',
    icon: '◔',
    color: '#2D374B',
    firstBlockOf2025: '175000000', // Approximate
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    shortName: 'OP',
    explorerUrl: 'https://optimistic.etherscan.io',
    apiUrl: 'https://api-optimistic.etherscan.io/api',
    apiKeyParam: 'apikey',
    icon: '⚡',
    color: '#FF0420',
    firstBlockOf2025: '115000000', // Approximate
  },
  base: {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    explorerUrl: 'https://basescan.org',
    apiUrl: 'https://api.basescan.org/api',
    apiKeyParam: 'apikey',
    icon: '🔵',
    color: '#0052FF',
    firstBlockOf2025: '10000000', // Approximate
  },
};

// Function to detect which chain a wallet address belongs to
// This is a simplified implementation - in reality, addresses can exist on multiple chains
export const detectChain = (address: string): ChainId => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _address = address; // Silence the unused var warning
  // For now, default to Ethereum
  // In a real implementation, we might check recent activity on each chain
  return 'ethereum';
};

// Get chain config by ID
export const getChainConfig = (chainId: ChainId): ChainConfig => {
  return chainConfigs[chainId] || chainConfigs.ethereum;
};