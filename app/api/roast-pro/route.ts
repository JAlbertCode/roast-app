import { NextResponse } from 'next/server';
import { generateRoast, getRandomFallbackRoast } from '../../utils/anuraService';
import { getAllChainsData } from '../../utils/getAllChainData';

// Configure for Vercel Pro's 60-second timeout
export const runtime = 'nodejs';
export const maxDuration = 60;  // Maximum 60 seconds (available with Vercel Pro)

// Define interface for roast result
interface RoastResult {
  text: string;
  error: boolean;
  errorMessage?: string;
  isFallback?: boolean;
}

// Load environment variables
const ANURA_API_KEY = process.env.ANURA_API_KEY || '';

export async function POST(request: Request) {
  const startTime = Date.now();
  
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
    
    // Log request processing
    console.log(`Processing roast for wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);
    
    // Fetch data from all chains
    const { aggregatedSummary, walletCategory, mostActiveChain, chainSummaries } = 
      await getAllChainsData(walletAddress);
    
    console.log(`Chain data fetched in ${(Date.now() - startTime)/1000}s, generating roasts...`);
    
    // Check if we should use optimization mode (for faster response)
    const optimizeMode = request.headers.get('x-optimize-mode') === 'true';
    
    // Generate multiple roasts (3 in normal mode, 1 in optimize mode)
    const roastPromises = [];
    const numberOfRoasts = optimizeMode ? 1 : 3;
    
    // Create multiple roast promises with distinct parameters
    for (let i = 0; i < numberOfRoasts; i++) {
      // Add unique parameters for each request
      const uniqueParams = {
        personalityIndex: i % 5,
        styleIndex: i % 5,
        themeIndex: i % 5,
        timeout: i * 100,
        temperature: 0.7 + (i * 0.15),
        seed: Math.floor(Math.random() * 1000000) + (i * 97531)
      };
      
      // Create a promise for each roast
      const roastPromise = new Promise<RoastResult>(async (resolve) => {
        // Add small delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise(r => setTimeout(r, uniqueParams.timeout as number));
        }
        
        try {
          // Generate the roast
          console.log(`Generating roast #${i+1} with params:`, uniqueParams);
          const roast = await generateRoast(aggregatedSummary, walletAddress, ANURA_API_KEY, uniqueParams);
          resolve({ text: roast, error: false });
        } catch (err) {
          const error = err as Error;
          console.error(`Error in roast #${i+1}:`, error);
          
          // Generate fallback roast if the API fails
          const fallbackRoast = getRandomFallbackRoast(uniqueParams);
          resolve({ 
            text: fallbackRoast, 
            error: false,
            errorMessage: error.message,
            isFallback: true
          });
        }
      });
      
      roastPromises.push(roastPromise);
    }
    
    // Execute all roast generations in parallel
    const results = await Promise.all(roastPromises);
    
    // Extract roasts and errors
    const roasts = results.map(result => result.text);
    const errors = results.filter(result => result.error).map(result => result.errorMessage || 'Unknown error');
    
    // Calculate total processing time
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`Completed in ${totalTime}s with ${roasts.length} roasts generated`);
    
    // Return the results
    return NextResponse.json({
      roasts,
      errors,
      errorCount: errors.length,
      walletCategory,
      summary: aggregatedSummary,
      mostActiveChain,
      chainSummaries,
      processingTime: totalTime
    });
    
  } catch (error) {
    const err = error as Error;
    console.error('Error generating roast:', err);
    
    // Generate fallback roasts for error cases
    const fallbackRoasts = [
      getRandomFallbackRoast({ personalityIndex: 0, styleIndex: 0 }),
      getRandomFallbackRoast({ personalityIndex: 1, styleIndex: 1 }),
      getRandomFallbackRoast({ personalityIndex: 2, styleIndex: 2 })
    ];
    
    // Return with fallback data
    return NextResponse.json(
      { 
        error: 'API Error',
        details: err.message || 'Unknown error',
        errorCount: 1,
        errors: [err.message],
        roasts: fallbackRoasts,
        isFallback: true,
        walletCategory: 'average',
        summary: {
          totalTransactions: 0,
          totalValue: '0',
          uniqueContractsInteracted: 0,
          topTokensTraded: [],
          failedTransactions: 0,
          successRate: 0
        },
        processingTime: (Date.now() - startTime) / 1000
      },
      { status: 200 } // Return 200 so UI still works
    );
  }
}
