import { NextResponse } from 'next/server';
import { 
  getTransactions, 
  getTokenTransfers, 
  summarizeTransactions,
  assessWalletCategory,
  TransactionSummary 
} from '../../utils/etherscanService';
import { generateRoast } from '../../utils/anuraService';

// Load environment variables
const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
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
    
    // Check if API keys are set
    if (!ETHERSCAN_API_KEY) {
      return NextResponse.json(
        { error: 'Etherscan API key is not configured' },
        { status: 500 }
      );
    }
    
    if (!ANURA_API_KEY) {
      return NextResponse.json(
        { error: 'Anura API key is not configured' },
        { status: 500 }
      );
    }
    
    // Fetch transactions data from Etherscan
    const transactions = await getTransactions(walletAddress, ETHERSCAN_API_KEY);
    const tokenTransfers = await getTokenTransfers(walletAddress, ETHERSCAN_API_KEY);
    
    // Process and summarize the transaction data
    const summary = summarizeTransactions(transactions, tokenTransfers, walletAddress);
    
    // Assess wallet category (poor, average, wealthy)
    const walletCategory = assessWalletCategory(summary);
    
    // Generate roast using Anura API
    const roast = await generateRoast(summary, walletAddress, ANURA_API_KEY);
    
    // Return the roast and wallet category
    return NextResponse.json({
      roast,
      walletCategory,
      summary
    });
    
  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
