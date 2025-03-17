import { ChainId, ChainConfig } from './types';
import { chainConfigs, getChainConfig } from './config';
import { Transaction } from '../etherscanService';

/**
 * Get the first block of 2025 for a specific chain
 */
export const getFirstBlockOf2025 = async (
  chainId: ChainId,
  apiKey: string
): Promise<string> => {
  try {
    const config = getChainConfig(chainId);
    // Jan 1, 2025 at 00:00:00 GMT in UNIX timestamp
    const timestamp = "1735689600";
    
    const response = await fetch(
      `${config.apiUrl}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&${config.apiKeyParam}=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === "1") {
      return data.result;
    } else {
      console.error(`Error getting first block of 2025 for ${config.name}:`, data.message);
      // Fallback to approximate value from config
      return config.firstBlockOf2025;
    }
  } catch (error) {
    console.error(`Error fetching first block of 2025 for ${chainId}:`, error);
    // Fallback to approximate value from config
    return chainConfigs[chainId].firstBlockOf2025;
  }
};

/**
 * Fetch transactions for a wallet from a specific blockchain explorer
 */
export const getTransactions = async (
  walletAddress: string, 
  chainId: ChainId,
  apiKey: string
): Promise<Transaction[]> => {
  try {
    const config = getChainConfig(chainId);
    const firstBlock2025 = await getFirstBlockOf2025(chainId, apiKey);
    
    const url = `${config.apiUrl}?module=account&action=txlist&address=${walletAddress}&startblock=${firstBlock2025}&endblock=99999999&sort=desc&${config.apiKeyParam}=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "1") {
      return data.result.map((tx: any) => ({
        ...tx,
        chain: chainId, // Add chain information to each transaction
      }));
    } else {
      console.error(`Error fetching transactions from ${config.name}:`, data.message);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching transactions from ${chainId}:`, error);
    return [];
  }
};

/**
 * Fetch ERC20 token transfers for a wallet from a specific blockchain
 */
export const getTokenTransfers = async (
  walletAddress: string, 
  chainId: ChainId,
  apiKey: string
): Promise<Transaction[]> => {
  try {
    const config = getChainConfig(chainId);
    const firstBlock2025 = await getFirstBlockOf2025(chainId, apiKey);
    
    const url = `${config.apiUrl}?module=account&action=tokentx&address=${walletAddress}&startblock=${firstBlock2025}&endblock=99999999&sort=desc&${config.apiKeyParam}=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "1") {
      return data.result.map((tx: any) => ({
        ...tx,
        chain: chainId, // Add chain information to each transaction
      }));
    } else {
      console.error(`Error fetching token transfers from ${config.name}:`, data.message);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching token transfers from ${chainId}:`, error);
    return [];
  }
};

/**
 * Fetch transactions from multiple chains
 */
export const getAllChainTransactions = async (
  walletAddress: string,
  apiKeys: Record<ChainId, string>
): Promise<Record<ChainId, Transaction[]>> => {
  const results: Record<ChainId, Transaction[]> = {} as Record<ChainId, Transaction[]>;
  
  // Process chains in parallel
  const chainPromises = Object.keys(chainConfigs).map(async (chainId) => {
    const chain = chainId as ChainId;
    const apiKey = apiKeys[chain];
    
    if (!apiKey) {
      results[chain] = [];
      return;
    }
    
    const chainTransactions = await getTransactions(walletAddress, chain, apiKey);
    results[chain] = chainTransactions;
  });
  
  await Promise.all(chainPromises);
  return results;
};

/**
 * Fetch token transfers from multiple chains
 */
export const getAllChainTokenTransfers = async (
  walletAddress: string,
  apiKeys: Record<ChainId, string>
): Promise<Record<ChainId, Transaction[]>> => {
  const results: Record<ChainId, Transaction[]> = {} as Record<ChainId, Transaction[]>;
  
  // Process chains in parallel
  const chainPromises = Object.keys(chainConfigs).map(async (chainId) => {
    const chain = chainId as ChainId;
    const apiKey = apiKeys[chain];
    
    if (!apiKey) {
      results[chain] = [];
      return;
    }
    
    const chainTokenTransfers = await getTokenTransfers(walletAddress, chain, apiKey);
    results[chain] = chainTokenTransfers;
  });
  
  await Promise.all(chainPromises);
  return results;
};
