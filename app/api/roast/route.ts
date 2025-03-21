import { NextResponse } from 'next/server';
import { generateRoast, getRandomFallbackRoast } from '../../utils/anuraService';
import { getAllChainsData } from '../../utils/getAllChainData';

// Define interface for roast result including isFallback property
interface RoastResult {
  text: string;
  error: boolean;
  errorMessage?: string;
  isFallback?: boolean; // Add this property to the type
}

// Load environment variables
const ANURA_API_KEY = process.env.ANURA_API_KEY || '';

export async function POST(request: Request) {
  try {
    // Extract wallet address and mode from request
    const { walletAddress, fastMode = false } = await request.json();
    
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
    
    // Fetch data from all chains with fast mode parameter
    const { aggregatedSummary, walletCategory, mostActiveChain, chainSummaries } = 
      await getAllChainsData(walletAddress, fastMode);
    
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
      const roastPromise = new Promise<RoastResult>(async (resolve) => {
        // Add increasingly longer delays between requests to avoid rate limiting
        const delayMs = i * 1000; // 0s, 1s, 2s delays
        if (i > 0) {
          console.log(`Waiting ${delayMs}ms before starting request #${i+1}...`);
          await new Promise(r => setTimeout(r, delayMs));
        }
        
        try {
          // Attempt to generate a roast
          console.log(`Generating roast #${i+1} with uniqueParams:`, uniqueParams);
          console.log(`Calling Anura API for roast #${i+1}`);
          const startTime = Date.now();
          const roast = await generateRoast(aggregatedSummary, walletAddress, ANURA_API_KEY, uniqueParams);
          const endTime = Date.now();
          console.log(`Got successful response for roast #${i+1} in ${(endTime - startTime)/1000}s`);
          resolve({ text: roast, error: false });
        } catch (err) {
          const error = err as Error;
          console.error(`Error in roast request ${i+1}:`, error);
          
          // Get a better fallback roast that's still funny
          // Get a truly random fallback roast
          // Create a unique seed based on timestamp + random + request number
          const uniqueSeed = Date.now() + Math.floor(Math.random() * 1000000) + (i * 31337);
          const fallbackRoast = getRandomFallbackRoast({ seed: uniqueSeed });
          
          resolve({ 
            text: fallbackRoast, 
            error: false, // Mark as not error so UI still displays it normally
            errorMessage: error.message,
            isFallback: true // Now included in our type definition
          });
        }
      });
      
      roastPromises.push(roastPromise);
    }
    
    // Execute them in parallel for better performance
    console.log(`Waiting for ${roastPromises.length} roast promises to complete...`);
    const results = await Promise.all(roastPromises);
    
    // Extract roasts and errors from results
    const roasts = results.map(result => result.text);
    const fallbackCount = results.filter(result => result.isFallback).length;
    console.log(`Got ${roastPromises.length} results with ${fallbackCount} fallbacks`);
    const errors = results.filter(result => result.error).map(result => result.errorMessage || 'Unknown error');
    
    // Log each result for debugging
    results.forEach((result, index) => {
      console.log(`Roast #${index + 1}: ${result.isFallback ? 'FALLBACK' : 'AI-GENERATED'} -> ${result.text.substring(0, 50)}...`);
    });
    
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
    
    // Generate truly random fallback roasts
    const fallbackRoasts = [];
    
    // Track used indices to avoid duplicates within a single response
    const usedIndices = new Set<number>();
    
    // Generate 3 unique fallbacks
    for (let i = 0; i < 3; i++) {
      // Create a unique seed for each roast based on timestamp + random number + index
      const uniqueSeed = Date.now() + Math.floor(Math.random() * 1000000) + (i * 31337);
      
      // Generate a fallback and make sure we track it to avoid duplicates
      let fallbackRoast;
      do {
        fallbackRoast = getRandomFallbackRoast({ seed: uniqueSeed + usedIndices.size });
      } while (fallbackRoasts.includes(fallbackRoast)); // Ensure we don't use the same roast twice
      
      fallbackRoasts.push(fallbackRoast);
    }
    
    return NextResponse.json(
      { 
        error: 'API Error',
        details: err.message || 'Unknown error',
        errorCount: 1,
        errors: [err.message],
        roasts: fallbackRoasts,
        isFallback: true, // Added back in since we have the type definition now
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