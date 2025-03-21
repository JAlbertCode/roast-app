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
  avalanche: {
    id: 43114,
    name: 'Avalanche',
    shortName: 'AVAX',
    explorerUrl: 'https://snowtrace.io',
    apiUrl: 'https://api.snowtrace.io/api',
    apiKeyParam: 'apikey', // Will use empty string for free tier
    icon: '❄️',
    color: '#E84142',
    firstBlockOf2025: '40000000', // Approximate
  },
  fantom: {
    id: 250,
    name: 'Fantom',
    shortName: 'FTM',
    explorerUrl: 'https://ftmscan.com',
    apiUrl: 'https://api.ftmscan.com/api',
    apiKeyParam: 'apikey',
    icon: '👻',
    color: '#1969FF',
    firstBlockOf2025: '70000000', // Approximate
  },
  bsc: {
    id: 56,
    name: 'BNB Chain',
    shortName: 'BNB',
    explorerUrl: 'https://bscscan.com',
    apiUrl: 'https://api.bscscan.com/api',
    apiKeyParam: 'apikey',
    icon: '🟡',
    color: '#F3BA2F',
    firstBlockOf2025: '35000000', // Approximate
  },
  cronos: {
    id: 25,
    name: 'Cronos',
    shortName: 'CRO',
    explorerUrl: 'https://cronoscan.com',
    apiUrl: 'https://api.cronoscan.com/api',
    apiKeyParam: 'apikey',
    icon: '🔷',
    color: '#002D74',
    firstBlockOf2025: '15000000', // Approximate
  },
  zksync: {
    id: 324,
    name: 'zkSync Era',
    shortName: 'ETH',
    explorerUrl: 'https://explorer.zksync.io',
    apiUrl: 'https://block-explorer-api.mainnet.zksync.io/api',
    apiKeyParam: '', // No API key required
    icon: '⚡',
    color: '#8C8DFC',
    firstBlockOf2025: '20000000', // Approximate
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