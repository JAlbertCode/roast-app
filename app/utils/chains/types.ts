// Chain interface and types

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  explorerUrl: string;
  apiUrl: string;
  apiKeyParam: string;
  icon: string;
  color: string;
  // First block of 2025 (approximate)
  firstBlockOf2025: string;
}

export type ChainId = 
  | 'ethereum'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'base';

export const CHAIN_NAMES: Record<ChainId, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  base: 'Base',
};
