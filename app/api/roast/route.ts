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
    
    // Generate multiple roasts (3 of them)
    const roastPromises = [];
    const numberOfRoasts = 3;
    
    console.log('Generating roasts for wallet:', walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4));
    console.log('Using Anura API with model: deepseek-r1:7b');
    
    // Create multiple roast promises
    for (let i = 0; i < numberOfRoasts; i++) {
      roastPromises.push(generateRoast(aggregatedSummary, walletAddress, ANURA_API_KEY));
    }
    
    // Execute them in parallel for better performance
    const roasts = await Promise.all(roastPromises);
    
    // Return the results
    return NextResponse.json({
      roasts,
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
