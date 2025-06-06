import { ChainId } from './chains/types';
import { getTransactions, getTokenTransfers } from './chains/blockchainService';
import { summarizeTransactions, assessWalletCategory, TransactionSummary } from './etherscanService';
import { getChainConfig } from './chains/config';

// Load blockchain API keys from environment variables
const getApiKeys = (): Record<ChainId, string> => {
  return {
    ethereum: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
    polygon: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || '',
    arbitrum: process.env.NEXT_PUBLIC_ARBISCAN_API_KEY || '',
    optimism: process.env.NEXT_PUBLIC_OPTIMISM_API_KEY || '',
    base: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '',
    avalanche: process.env.NEXT_PUBLIC_SNOWTRACE_API_KEY || '',
    fantom: process.env.NEXT_PUBLIC_FTMSCAN_API_KEY || '',
    bsc: process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || '',
    cronos: process.env.NEXT_PUBLIC_CRONOSCAN_API_KEY || '',
    zksync: process.env.NEXT_PUBLIC_ZKSYNC_API_KEY || '',
  };
};

export const getAllChainsData = async (
  walletAddress: string,
  fastMode: boolean = false
): Promise<{
  aggregatedSummary: TransactionSummary;
  walletCategory: 'poor' | 'average' | 'wealthy';
  mostActiveChain: ChainId | null;
  chainSummaries: Record<ChainId, TransactionSummary | null>;
}> => {
  const apiKeys = getApiKeys();
  const chainSummaries: Record<ChainId, TransactionSummary | null> = {} as Record<ChainId, TransactionSummary | null>;
  
  // Set transaction limits based on mode
  const txLimit = fastMode ? 30 : 100;
  const tokenTxLimit = fastMode ? 20 : 50;
  
  // In fast mode, focus only on most common chains
  const chainsToProcess = fastMode
    ? ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base']
    : Object.keys(apiKeys);
  
  // Collect promises for parallel execution
  const chainPromises = chainsToProcess.map(async (chainId) => {
    const chain = chainId as ChainId;
    const apiKey = apiKeys[chain];
    const config = getChainConfig(chain);
    
    // Skip if API key is required but not provided
    if (config.apiKeyParam && !apiKey) {
      chainSummaries[chain] = null;
      return;
    }
    
    try {
      // Fetch data for this chain with transaction limits
      const transactions = await getTransactions(walletAddress, chain, apiKey, txLimit);
      const tokenTransfers = await getTokenTransfers(walletAddress, chain, apiKey, tokenTxLimit);
      
      // Create summary for this chain
      const summary = summarizeTransactions(transactions, tokenTransfers, walletAddress);
      
      // Add chain information
      const enhancedSummary = {
        ...summary,
        chain: chain
      };
      
      // Store the summary
      chainSummaries[chain] = enhancedSummary;
    } catch (error) {
      console.error(`Error fetching data for ${chainId}:`, error);
      chainSummaries[chain] = null;
    }
  });
  
  // Wait for all chain data fetching to complete
  await Promise.all(chainPromises);
  
  // Create aggregated summary
  const aggregatedSummary: TransactionSummary = {
    totalTransactions: 0,
    totalValue: '0',
    uniqueContractsInteracted: 0,
    topTokensTraded: [],
    largestTransaction: { value: '0', timestamp: '' },
    recentActivity: [],
    failedTransactions: 0,
    successRate: 0,
    daysInactive: 0,
    chain: 'ethereum'
  };
  
  // Find most active chain
  let mostActiveChain: ChainId | null = null;
  let maxTransactions = 0;
  
  // Process all valid summaries
  Object.entries(chainSummaries).forEach(([chainId, summary]) => {
    if (!summary) return;
    
    // Update most active chain
    if (summary.totalTransactions > maxTransactions) {
      maxTransactions = summary.totalTransactions;
      mostActiveChain = chainId as ChainId;
    }
    
    // Aggregate transaction count
    aggregatedSummary.totalTransactions += summary.totalTransactions;
    
    // Aggregate value (simplified by adding as string)
    aggregatedSummary.totalValue = (
      parseFloat(aggregatedSummary.totalValue) + 
      parseFloat(summary.totalValue)
    ).toFixed(4);
    
    // Aggregate unique contracts
    aggregatedSummary.uniqueContractsInteracted += summary.uniqueContractsInteracted;
    
    // Aggregate failed transactions
    aggregatedSummary.failedTransactions += summary.failedTransactions;
    
    // Combine top tokens
    aggregatedSummary.topTokensTraded = [
      ...aggregatedSummary.topTokensTraded,
      ...summary.topTokensTraded
    ]
    // Sort and limit to top 5
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
    // Use most recent activity
    if (summary.recentActivity.length > 0) {
      aggregatedSummary.recentActivity = [
        ...aggregatedSummary.recentActivity,
        ...summary.recentActivity
      ]
      // Sort by date (newest first) and limit to 5
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    }
    
    // Use largest transaction if it's bigger
    if (parseFloat(summary.largestTransaction.value) > parseFloat(aggregatedSummary.largestTransaction.value)) {
      aggregatedSummary.largestTransaction = summary.largestTransaction;
    }
    
    // Set days inactive to minimum across all chains
    if (aggregatedSummary.daysInactive === 0 || 
        (summary.daysInactive !== undefined && aggregatedSummary.daysInactive !== undefined && 
         summary.daysInactive < aggregatedSummary.daysInactive)) {
      aggregatedSummary.daysInactive = summary.daysInactive;
    }
  });
  
  // Calculate overall success rate
  if (aggregatedSummary.totalTransactions > 0) {
    aggregatedSummary.successRate = parseFloat(
      ((aggregatedSummary.totalTransactions - aggregatedSummary.failedTransactions) /
        aggregatedSummary.totalTransactions * 100).toFixed(2)
    );
  }
  
  // If there's a most active chain, use it for the aggregated summary
  if (mostActiveChain) {
    aggregatedSummary.chain = mostActiveChain;
  }
  
  // Assess wallet category
  const walletCategory = assessWalletCategory(aggregatedSummary);
  
  return {
    aggregatedSummary,
    walletCategory,
    mostActiveChain,
    chainSummaries
  };
};