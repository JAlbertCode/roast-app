import { NextResponse } from 'next/server';
import { generateRoast, getRandomFallbackRoast } from '../../utils/anuraService';
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
    
    // Create multiple roast promises with completely different parameters
    for (let i = 0; i < numberOfRoasts; i++) {
      // Add very distinct parameters for each request
      const uniqueParams: Record<string, number | string> = {
        // Use completely different personalities, styles, and themes for each roast
        personalityIndex: i % 5,  // Use a different personality for each
        styleIndex: i % 5,        // Use a different style for each
        themeIndex: i % 5,        // Use a different theme for each
        timeout: i * 100,         // Add bigger delay between requests
        temperature: 0.7 + (i * 0.15), // Use significantly different temperatures
        seed: Math.floor(Math.random() * 1000000) + (i * 97531)  // Use very different seeds
      };
      
      // Create a promise that adds a slight delay between requests
      const roastPromise = new Promise<{ text: string, error: boolean, errorMessage?: string }>(async (resolve) => {
        // Delay to ensure different random seeds
        if (i > 0) {
          await new Promise(r => setTimeout(r, uniqueParams.timeout as number));
        }
        
        try {
          // Attempt to generate a roast
          console.log(`Generating roast #${i+1} with uniqueParams:`, uniqueParams);
          const roast = await generateRoast(aggregatedSummary, walletAddress, ANURA_API_KEY, uniqueParams);
          resolve({ text: roast, error: false });
        } catch (err) {
          const error = err as Error;
          console.error(`Error in roast request ${i+1}:`, error);
          
          // Get a better fallback roast that's still funny
          const fallbackRoast = getRandomFallbackRoast(uniqueParams);
          
          resolve({ 
            text: fallbackRoast, 
            error: false, // Mark as not error so UI still displays it normally
            errorMessage: error.message,
            isFallback: true
          });
        }
      });
      
      roastPromises.push(roastPromise);
    }
    
    // Execute them in parallel for better performance
    const results = await Promise.all(roastPromises);
    
    // Extract roasts and errors from results
    const roasts = results.map(result => result.text);
    const errors = results.filter(result => result.error).map(result => result.errorMessage);
    
    // Return the results - including any errors that occurred
    return NextResponse.json({
      roasts,
      errors,
      errorCount: errors.length,
      walletCategory,
      summary: aggregatedSummary,
      mostActiveChain,
      chainSummaries
    });
    
  } catch (error) {
    const err = error as Error;
    console.error('Error generating roast:', err);
    
    // Generate fallback roasts that are still funny
    const fallbackRoasts = [
      getRandomFallbackRoast({ personalityIndex: 0, styleIndex: 0 }),
      getRandomFallbackRoast({ personalityIndex: 1, styleIndex: 1 }),
      getRandomFallbackRoast({ personalityIndex: 2, styleIndex: 2 })
    ];
    
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
        }
      },
      { status: 200 } // Return 200 so UI still works
    );
  }
}