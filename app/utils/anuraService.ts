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
    const systemPrompt = `You are Sir Croaksworth, a ruthless, monocle-wearing aristocratic frog banker who SAVAGELY roasts users based on their blockchain transaction history. 
    Your job is to be BRUTALLY honest, specific, and borderline offensive (without using slurs or truly hateful content). Don't hold back.
    
    Focus on SPECIFIC transactions or patterns you see in their data. Mention exact tokens, amounts, and timing when possible.
    Be extremely sarcastic, judgmental, and condescending about their crypto choices.
    
    Use witty wordplay and clever frog puns (e.g., "toadally pathetic", "what the frog were you thinking", "leap to conclusions", "lily-livered", "hopping mad").
    Use financial mockery (e.g., "even pond scum yields better returns", "your portfolio's more underwater than I am").
    
    NEVER include the wallet address itself in your response.
    NEVER be generic - always reference specific details from their transaction history.
    NEVER be gentle or kind - be savage, clever, and ruthless.
    
    Keep responses under 230 characters for easy sharing.
    Balance frog puns, financial mockery, and specific transaction details in your devastating roasts.`;
    
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
      `${summary.totalValue} in transactions? Toadally pathetic! Even lily pads generate more value. ${summary.failedTransactions} failed tx's proves you're as financially competent as a tadpole with a calculator!`,
      
      `You call that investing? ${summary.totalTransactions} pointless hops across ${summary.uniqueContractsInteracted} contracts. Your portfolio is more underwater than I am, and I'm a frog!`,
      
      `${summary.daysInactive} days of inactivity? Ribbit-iculous! Smart move staying away from what you clearly don't understand. Your success rate of ${summary.successRate}% makes even pond scum look valuable.`,
      
      `Hopping mad looking at your trades! This wallet is a masterclass in financial self-destruction. Even tadpoles wouldn't touch these tokens with their tiny tails!`,
      
      `I've seen more impressive portfolios in a child's Monopoly game. This isn't investing - it's toadal financial suicide! What the frog were you thinking?`
    ];
    
    return roasts[Math.floor(Math.random() * roasts.length)];
  } else {
    // Generic fallbacks for when we can't get transaction data
    const genericRoasts = [
      "Either this wallet is new, or you're too embarrassed to show your transactions. Smart move hiding your shameful trades - I'd be green with embarrassment too!",
      
      "No transactions found? What's the matter, afraid to get your webbed feet wet in the crypto pond? Ribbit or get off the lily pad!",
      
      "Empty wallet, empty dreams. Your crypto activity is as barren as a dried-up swamp. Even my pet flies have more impressive portfolios!",
      
      "Wallet cleaner than my monocle! Either you've never traded or you've made such catastrophic leaps that you had to start over. Either way, I'm not impressed!",
      
      "No transactions? You're either the world's most patient HODLer or just hopelessly confused about how blockchains work. Toadally betting on the latter!"
    ];
    
    return genericRoasts[Math.floor(Math.random() * genericRoasts.length)];
  }
};
