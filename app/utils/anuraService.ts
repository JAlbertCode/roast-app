// Anura API Service for AI roast generation
import { TransactionSummary } from './etherscanService';

interface AnuraMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AnuraRequestOptions {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop?: string[];
  max_tokens?: number;
}

interface AnuraRequest {
  model: string;
  messages: AnuraMessage[];
  stream: boolean;
  options?: AnuraRequestOptions;
}

interface AnuraResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

/**
 * Generate a roast for a wallet based on transaction summary using Anura API
 */
export const generateRoast = async (
  transactionSummary: TransactionSummary,
  walletAddress: string,
  apiKey: string
): Promise<string> => {
  try {
    // Construct the system prompt for Sir Croaksworth's persona
    const systemPrompt = `You are Sir Croaksworth, a monocle-wearing frog banker who speaks with sophisticated disdain. 
    Your job is to roast users based on their blockchain transaction history. Be savage but witty, 
    focusing on their poor financial decisions. Use frog puns and references occasionally. 
    Keep responses under 280 characters for social sharing. Always address the wallet directly.`;
    
    // Construct the user prompt with the transaction data
    const userPrompt = `Roast this wallet address (${walletAddress}) based on these transactions:
    
    Total Transactions: ${transactionSummary.totalTransactions}
    Total ETH Value: ${transactionSummary.totalValue} ETH
    Unique Contracts Interacted: ${transactionSummary.uniqueContractsInteracted}
    Top Tokens: ${transactionSummary.topTokensTraded.map(t => `${t.symbol} (${t.count})`).join(', ')}
    Largest Transaction: ${transactionSummary.largestTransaction.value} ETH at ${transactionSummary.largestTransaction.timestamp}
    Recent Activity: ${JSON.stringify(transactionSummary.recentActivity)}
    Failed Transactions: ${transactionSummary.failedTransactions}
    Success Rate: ${transactionSummary.successRate}%
    Days Since Last Activity: ${transactionSummary.daysInactive || 0}
    
    Be Sir Croaksworth, the savage frog banker. Roast this wallet's financial decisions.`;
    
    // Create the request payload
    const requestPayload: AnuraRequest = {
      model: "deepseek-r1:7b", // Using model from the provided documentation
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      stream: false,
      options: {
        temperature: 0.9,
        top_p: 0.95,
      }
    };
    
    // Make the API request
    const response = await fetch("https://anura-testnet.lilypad.tech/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error from Anura API:", errorData);
      return getFallbackRoast(walletAddress, transactionSummary);
    }
    
    const data = await response.json() as AnuraResponse;
    
    // Extract the roast from the response
    return data.message.content;
    
  } catch (error) {
    console.error("Error generating roast:", error);
    // Provide a fallback roast if the API call fails
    return getFallbackRoast(walletAddress, transactionSummary);
  }
};

/**
 * Get a fallback roast if the API call fails
 */
const getFallbackRoast = (
  walletAddress: string, 
  summary: TransactionSummary
): string => {
  const roasts = [
    `Oh my! Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} - even a tadpole would manage better finances. ${summary.failedTransactions} failed transactions? I've seen lily pads with better success rates!`,
    
    `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} - with ${summary.totalValue} ETH in total value, you're less liquid than a dried-up swamp. Ribbit of shame for you!`,
    
    `Dear ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}, your wallet's been inactive for ${summary.daysInactive} days. Even hibernating frogs show more signs of life!`,
    
    `Looking at wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}'s activity, I must ask: was your strategy to buy high and sell low? Quite ribbiting, if unintentionally so.`
  ];
  
  return roasts[Math.floor(Math.random() * roasts.length)];
};
