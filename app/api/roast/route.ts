import { NextResponse } from 'next/server';
import { 
  summarizeTransactions,
  assessWalletCategory,
  TransactionSummary 
} from '../../utils/etherscanService';
import { generateRoast } from '../../utils/anuraService';
import { ChainId } from '../../utils/chains/types';
import { getTransactions, getTokenTransfers } from '../../utils/chains/blockchainService';

// Load environment variables
const ANURA_API_KEY = process.env.ANURA_API_KEY || '';

// Load blockchain API keys
const BLOCKCHAIN_API_KEYS: Record<ChainId, string> = {
  ethereum: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
  polygon: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || '',
  arbitrum: process.env.NEXT_PUBLIC_ARBISCAN_API_KEY || '',
  optimism: process.env.NEXT_PUBLIC_OPTIMISM_API_KEY || '',
  base: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '',
};

export async function POST(request: Request) {
  try {
    // Extract wallet address and chain from request
    const { walletAddress, chainId = 'ethereum' } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    // Check if selected chain API key is set
    if (!BLOCKCHAIN_API_KEYS[chainId as ChainId]) {
      return NextResponse.json(
        { error: `${chainId} API key is not configured` },
        { status: 500 }
      );
    }
    
    if (!ANURA_API_KEY) {
      return NextResponse.json(
        { error: 'Anura API key is not configured' },
        { status: 500 }
      );
    }
    
    // Fetch transactions data from selected chain
    const apiKey = BLOCKCHAIN_API_KEYS[chainId as ChainId];
    const transactions = await getTransactions(walletAddress, chainId as ChainId, apiKey);
    const tokenTransfers = await getTokenTransfers(walletAddress, chainId as ChainId, apiKey);
    
    // Process and summarize the transaction data
    const summary = summarizeTransactions(transactions, tokenTransfers, walletAddress);
    
    // Add chain information to summary
    const enhancedSummary = {
      ...summary,
      chain: chainId
    };
    
    // Assess wallet category (poor, average, wealthy)
    const walletCategory = assessWalletCategory(summary);
    
    // Generate roast using Anura API
    const roast = await generateRoast(enhancedSummary, walletAddress, ANURA_API_KEY);
    
    // Return the roast, wallet category, summary, and chain info
    return NextResponse.json({
      roast,
      walletCategory,
      summary: enhancedSummary,
      chain: chainId
    });
    
  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
