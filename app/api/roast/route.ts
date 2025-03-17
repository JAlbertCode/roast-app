import { NextResponse } from 'next/server';
import { TransactionSummary } from '../../utils/etherscanService';
import { generateRoast } from '../../utils/anuraService';
import { getAllChainsData } from '../../utils/getAllChainData';

// Load environment variables
const ANURA_API_KEY = process.env.ANURA_API_KEY || '';

export async function POST(request: Request) {
  try {
    // Extract wallet address from request
    const { walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    // Check if Anura API key is set
    if (!ANURA_API_KEY) {
      return NextResponse.json(
        { error: 'Anura API key is not configured' },
        { status: 500 }
      );
    }
    
    // Check if at least Ethereum API key is set
    if (!process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY) {
      return NextResponse.json(
        { error: 'At least Ethereum API key is required' },
        { status: 500 }
      );
    }
    
    // Fetch data from all chains
    const { aggregatedSummary, walletCategory, mostActiveChain, chainSummaries } = 
      await getAllChainsData(walletAddress);
    
    // Generate roast using Anura API
    const roast = await generateRoast(aggregatedSummary, walletAddress, ANURA_API_KEY);
    
    // Return the results
    return NextResponse.json({
      roast,
      walletCategory,
      summary: aggregatedSummary,
      mostActiveChain,
      chainSummaries
    });
    
  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
