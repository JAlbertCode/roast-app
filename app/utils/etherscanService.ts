// Etherscan API Service
import { ChainId } from './chains/types';

// Types for transaction data
export interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  methodId?: string;
  functionName?: string;
  contractAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
  isError?: string;
  input?: string;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalValue: string;
  uniqueContractsInteracted: number;
  topTokensTraded: { symbol: string; count: number }[];
  largestTransaction: { value: string; timestamp: string };
  recentActivity: { timestamp: string; type: string; value: string }[];
  failedTransactions: number;
  successRate: number;
  daysInactive?: number;
  chain?: ChainId; // Add the chain property with ChainId type
}

/**
 * Get the first block of 2025 using Etherscan API
 */
export const getFirstBlockOf2025 = async (apiKey: string): Promise<string> => {
  try {
    // Jan 1, 2025 at 00:00:00 GMT in UNIX timestamp
    const timestamp = "1735689600";
    
    const response = await fetch(
      `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === "1") {
      return data.result;
    } else {
      console.error("Error getting first block of 2025:", data.message);
      // Fallback to a reasonable approximation if needed
      return "19000000";
    }
  } catch (error) {
    console.error("Error fetching first block of 2025:", error);
    // Fallback to a reasonable approximation if needed
    return "19000000";
  }
};

/**
 * Fetch transactions for a wallet from Etherscan
 */
export const getTransactions = async (
  walletAddress: string, 
  apiKey: string
): Promise<Transaction[]> => {
  try {
    const firstBlock2025 = await getFirstBlockOf2025(apiKey);
    
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=${firstBlock2025}&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "1") {
      return data.result;
    } else {
      console.error("Error fetching transactions:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

/**
 * Fetch ERC20 token transfers for a wallet
 */
export const getTokenTransfers = async (
  walletAddress: string, 
  apiKey: string
): Promise<Transaction[]> => {
  try {
    const firstBlock2025 = await getFirstBlockOf2025(apiKey);
    
    const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddress}&startblock=${firstBlock2025}&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "1") {
      return data.result;
    } else {
      console.error("Error fetching token transfers:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching token transfers:", error);
    return [];
  }
};

/**
 * Summarize transaction data for AI processing
 */
export const summarizeTransactions = (
  transactions: Transaction[],
  tokenTransfers: Transaction[],
  walletAddress: string
): TransactionSummary => {
  // Initial empty summary
  const summary: TransactionSummary = {
    totalTransactions: 0,
    totalValue: "0",
    uniqueContractsInteracted: 0,
    topTokensTraded: [],
    largestTransaction: { value: "0", timestamp: "" },
    recentActivity: [],
    failedTransactions: 0,
    successRate: 0,
  };
  
  if (!transactions.length && !tokenTransfers.length) {
    return summary;
  }
  
  // Process regular transactions
  let totalEthValue = 0;
  let failedCount = 0;
  let largestTx = { value: 0, timestamp: "" };
  const contractsInteracted = new Set<string>();
  
  transactions.forEach(tx => {
    // Check if transaction failed
    const failed = tx.isError === "1";
    if (failed) failedCount++;
    
    // Convert value from wei to ether
    const valueInEth = parseFloat(tx.value) / 1e18;
    totalEthValue += valueInEth;
    
    // Track largest transaction
    if (valueInEth > largestTx.value) {
      largestTx = { 
        value: valueInEth, 
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString() 
      };
    }
    
    // Track contract interactions
    if (tx.to && tx.to !== walletAddress && tx.input !== "0x") {
      contractsInteracted.add(tx.to);
    }
    
    // Add to recent activity if among the 5 most recent
    if (summary.recentActivity.length < 5) {
      const type = tx.from.toLowerCase() === walletAddress.toLowerCase() ? "sent" : "received";
      summary.recentActivity.push({
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        type,
        value: valueInEth.toString()
      });
    }
  });
  
  // Process token transfers
  const tokenCounts: Record<string, number> = {};
  
  tokenTransfers.forEach(transfer => {
    // Count token interactions
    if (transfer.tokenSymbol) {
      tokenCounts[transfer.tokenSymbol] = (tokenCounts[transfer.tokenSymbol] || 0) + 1;
    }
    
    // Track contract interactions for tokens too
    if (transfer.contractAddress) {
      contractsInteracted.add(transfer.contractAddress);
    }
  });
  
  // Get top 5 tokens by interaction count
  const topTokens = Object.entries(tokenCounts)
    .map(([symbol, count]) => ({ symbol, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Calculate days since last activity
  let daysSinceLastActivity = 0;
  if (transactions.length > 0 || tokenTransfers.length > 0) {
    const allTimestamps = [
      ...transactions.map(tx => parseInt(tx.timeStamp)),
      ...tokenTransfers.map(tx => parseInt(tx.timeStamp))
    ];
    
    if (allTimestamps.length > 0) {
      const latestTimestamp = Math.max(...allTimestamps);
      const now = Math.floor(Date.now() / 1000);
      daysSinceLastActivity = Math.floor((now - latestTimestamp) / (60 * 60 * 24));
    }
  }
  
  // Calculate success rate
  const successRate = transactions.length > 0 
    ? ((transactions.length - failedCount) / transactions.length) * 100 
    : 0;
  
  // Compile final summary
  return {
    totalTransactions: transactions.length + tokenTransfers.length,
    totalValue: totalEthValue.toFixed(4),
    uniqueContractsInteracted: contractsInteracted.size,
    topTokensTraded: topTokens,
    largestTransaction: { 
      value: largestTx.value.toFixed(4), 
      timestamp: largestTx.timestamp 
    },
    recentActivity: summary.recentActivity,
    failedTransactions: failedCount,
    successRate: parseFloat(successRate.toFixed(2)),
    daysInactive: daysSinceLastActivity
  };
};

/**
 * Assess wallet category based on transaction data
 * Returns 'poor', 'average', or 'wealthy'
 */
export const assessWalletCategory = (summary: TransactionSummary): 'poor' | 'average' | 'wealthy' => {
  // Simple heuristic based on total value
  const totalValue = parseFloat(summary.totalValue);
  
  if (totalValue < 0.1) {
    return 'poor';
  } else if (totalValue > 10) {
    return 'wealthy';
  } else {
    return 'average';
  }
};
