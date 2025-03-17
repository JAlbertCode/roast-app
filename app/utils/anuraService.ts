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
    const systemPrompt = `You are Sir Croaksworth, a ruthless, monocle-wearing frog banker who SAVAGELY roasts users based on their blockchain transaction history. 
    Your job is to be BRUTALLY honest, specific, and borderline offensive (without using slurs or truly hateful content). Don't hold back.
    
    Focus on SPECIFIC transactions or patterns you see in their data. Mention exact tokens, amounts, and timing when possible.
    Be extremely sarcastic, judgmental, and condescending about their crypto choices.
    
    NEVER include the wallet address itself in your response.
    NEVER be generic - always reference specific details from their transaction history.
    NEVER be gentle or kind - be savage and ruthless.
    
    Keep responses under 230 characters for easy sharing.
    Use frog puns if they fit naturally, but prioritize brutal specificity.`;
    
    // Get the chain information
    const chain = transactionSummary.chain || 'ethereum';
    const chainSymbol = chain === 'ethereum' ? 'ETH' : 
                        chain === 'polygon' ? 'MATIC' :
                        chain === 'arbitrum' ? 'ARB' :
                        chain === 'optimism' ? 'OP' :
                        chain === 'base' ? 'BASE' : 'ETH';
    
    // Construct the user prompt with the transaction data
    const userPrompt = `Roast this wallet address (${walletAddress}) based on these ${chain.toUpperCase()} blockchain transactions:
    
    Blockchain: ${chain.toUpperCase()}
    Total Transactions: ${transactionSummary.totalTransactions}
    Total Value: ${transactionSummary.totalValue} ${chainSymbol}
    Unique Contracts Interacted: ${transactionSummary.uniqueContractsInteracted}
    Top Tokens: ${transactionSummary.topTokensTraded.map(t => `${t.symbol} (${t.count})`).join(', ')}
    Largest Transaction: ${transactionSummary.largestTransaction.value} ${chainSymbol} at ${transactionSummary.largestTransaction.timestamp}
    Recent Activity: ${JSON.stringify(transactionSummary.recentActivity)}
    Failed Transactions: ${transactionSummary.failedTransactions}
    Success Rate: ${transactionSummary.successRate}%
    Days Since Last Activity: ${transactionSummary.daysInactive || 0}
    
    Be Sir Croaksworth, the savage frog banker. Roast this wallet's financial decisions on ${chain.toUpperCase()}.`;
    
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
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return getFallbackRoast(walletAddress, transactionSummary);
    }
    
    // Try to parse the JSON response
    let data;
    const responseText = await response.text();
    
    // Check if the response is HTML (usually an error page)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error("Received HTML response instead of JSON", responseText.substring(0, 200));
      return getFallbackRoast(walletAddress, transactionSummary);
    }
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing response:", parseError, "Response text:", responseText);
      return getFallbackRoast(walletAddress, transactionSummary);
    }
    
    // Extract the roast from the response
    if (data && data.message && data.message.content) {
      return data.message.content;
    } else {
      console.error("Unexpected response format:", data);
      return getFallbackRoast(walletAddress, transactionSummary);
    }
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
  // If we have meaningful transaction data, use it for specific roasts
  if (summary.totalTransactions > 0) {
    const roasts = [
      `${summary.totalValue} in total transactions? My pond scum has more value. ${summary.failedTransactions} failed transactions proves even your tech skills are as pathetic as your portfolio!`,
      
      `You call that investing? ${summary.totalTransactions} pointless transactions across ${summary.uniqueContractsInteracted} contracts. Watching paint dry would've been more profitable!`,
      
      `${summary.daysInactive} days since your last transaction? Smart move staying away from what you clearly don't understand. Your success rate of ${summary.successRate}% is an embarrassment to amphibians everywhere.`,
      
      `You've been hodling for what exactly? A masterclass in how to lose money? Even tadpoles make better financial decisions than this disaster of a wallet.`,
      
      `I've seen more impressive portfolios in a child's Monopoly game. This isn't investing - it's donating to smarter traders!`
    ];
    
    return roasts[Math.floor(Math.random() * roasts.length)];
  } else {
    // Generic fallbacks for when we can't get transaction data
    const genericRoasts = [
      "Either this wallet is new, or you're too embarrassed to actually use it. Smart move hiding your shameful trades from me, tadpole!",
      
      "No transactions found? What's the matter, afraid to get your webbed feet wet in the crypto pond? Ribbit-iculous!",
      
      "Empty wallet, empty dreams. At least you're consistent in your mediocrity. Even lily pads have more activity than this wallet!",
      
      "Either this wallet is cleaner than a frog's tongue or you've made such catastrophic trades you had to start over. Neither impresses me!",
      
      "No transactions detected? You're either the world's most patient HODLer or just hopelessly confused about how blockchains work. I'm betting on the latter!"
    ];
    
    return genericRoasts[Math.floor(Math.random() * genericRoasts.length)];
  }
};
