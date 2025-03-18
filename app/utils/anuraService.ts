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
    // Generate a random seed for each request to ensure variety
    const randomSeed = Math.floor(Math.random() * 1000000).toString();
    
    // Pick a random personality variant for Sir Croaksworth to add variety
    const personalityVariants = [
      "savage aristocrat",
      "ruthless investment banker",
      "judgmental financial advisor",
      "snooty old-money frog",
      "merciless crypto critic"
    ];
    const personality = personalityVariants[Math.floor(Math.random() * personalityVariants.length)];
    
    // Pick different writing styles for more variety
    const styleVariants = [
      "sarcastic and condescending",
      "brutally honest with wordplay",
      "mock-sophisticated with backhanded compliments",
      "dramatically appalled",
      "witty and cutting"
    ];
    const style = styleVariants[Math.floor(Math.random() * styleVariants.length)];
    
    // Construct the system prompt for Sir Croaksworth's persona with enhanced specificity
    const systemPrompt = `You are Sir Croaksworth, a ${personality}, monocle-wearing frog banker who SAVAGELY roasts users based on their blockchain transaction history. 
    Your job is to be ${style}, specific, and borderline offensive (without using slurs or truly hateful content). Don't hold back.
    
    Focus on SPECIFIC transactions or patterns you see in their data. Mention exact tokens, amounts, and timing when possible.
    If they have notable tokens (NFTs or tokens like UNI, LINK, SHIB, PEPE), mock those SPECIFICALLY.
    Reference specific DeFi protocols they've used (like Uniswap, Aave, Compound) if you can identify them.
    
    For known tokens/projects:
    - Mock NFT collections (BAYC, MAYC, Azuki, etc.) as overpriced JPEGs
    - Mock memecoins (DOGE, SHIB, PEPE) as desperate gambling
    - Mock DeFi users as wannabe financiers
    - Mock failed/frequent transactions as proof of crypto incompetence
    
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
    
    // Enhanced user prompt with more specific information for better roasts
    const userPrompt = `Roast this wallet based on these ${chain.toUpperCase()} blockchain transactions:
    
    Blockchain: ${chain.toUpperCase()}
    Wallet Category: ${transactionSummary.totalValue > 10 ? 'WEALTHY' : transactionSummary.totalValue < 0.1 ? 'POOR' : 'AVERAGE'}
    Total Transactions: ${transactionSummary.totalTransactions}
    Total Value: ${transactionSummary.totalValue} ${chainSymbol}
    Unique Contracts Interacted: ${transactionSummary.uniqueContractsInteracted}
    Top Tokens: ${transactionSummary.topTokensTraded.map(t => `${t.symbol} (${t.count})`).join(', ')}
    Largest Transaction: ${transactionSummary.largestTransaction.value} ${chainSymbol} on ${new Date(transactionSummary.largestTransaction.timestamp).toLocaleString()}
    Recent Activity: ${JSON.stringify(transactionSummary.recentActivity)}
    Failed Transactions: ${transactionSummary.failedTransactions} (${transactionSummary.failedTransactions > 0 ? `${(transactionSummary.failedTransactions / transactionSummary.totalTransactions * 100).toFixed(1)}% failure rate` : 'perfect record'})
    Success Rate: ${transactionSummary.successRate}%
    Days Since Last Activity: ${transactionSummary.daysInactive || 0} ${transactionSummary.daysInactive > 30 ? '(inactive wallet)' : transactionSummary.daysInactive > 7 ? '(dormant wallet)' : '(active wallet)'}
    
    IMPORTANT CONTEXT:
    ${transactionSummary.topTokensTraded.some(t => ['PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BONK'].includes(t.symbol)) ? '- This wallet trades memecoins - mock them for chasing dog/frog coins' : ''}
    ${transactionSummary.topTokensTraded.some(t => ['UNI', 'SUSHI', 'CAKE', 'CRV'].includes(t.symbol)) ? '- This wallet uses DEXes like Uniswap/SushiSwap' : ''}
    ${transactionSummary.topTokensTraded.some(t => ['AAVE', 'COMP', 'MKR', 'SNX'].includes(t.symbol)) ? '- This wallet uses DeFi lending protocols' : ''}
    ${transactionSummary.failedTransactions > 3 ? '- This wallet has lots of failed transactions - mock their technical incompetence' : ''}
    ${transactionSummary.totalTransactions > 100 ? '- This wallet makes tons of transactions - mock them for wasteful gas spending' : ''}
    ${parseFloat(transactionSummary.totalValue) < 0.01 ? '- This wallet is extremely poor - mock their empty bags' : ''}
    ${parseFloat(transactionSummary.totalValue) > 50 ? '- This wallet is wealthy - mock their privilege while being envious' : ''}
    ${transactionSummary.daysInactive > 60 ? '- This wallet is abandoned - mock them for giving up on crypto' : ''}
    
    BE SIR CROAKSWORTH: Create a SAVAGE, witty, financially-literate roast that references SPECIFIC details about their wallet activity.`;
    
    // Create the request payload with randomized parameters for variety
    const requestPayload: AnuraRequest = {
      model: "deepseek-r1:7b", // Using model from the provided documentation
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      stream: false,
      options: {
        // Randomize temperature between 0.8 and 1.0 for variety
        temperature: 0.8 + Math.random() * 0.2,
        // Randomize top_p slightly for more diversity
        top_p: 0.92 + Math.random() * 0.08,
        // Add a random seed to ensure different responses even with similar inputs
        seed: randomSeed,
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
    const walletCategory = parseFloat(summary.totalValue) > 10 ? 'wealthy' : 
                          parseFloat(summary.totalValue) < 0.1 ? 'poor' : 'average';
    
    // Dynamic roasts based on wallet data
    const dynamicRoasts = [
      // Poor wallet roasts
      ...(walletCategory === 'poor' ? [
        `${summary.totalValue} ${summary.totalTransactions > 50 ? 'after all those transactions' : 'in your wallet'}? My lily pad has more value underneath it! Keep trying, maybe you'll afford a full crypto someday. *adjusts monocle mockingly*`,
        `${summary.failedTransactions} failed transactions out of ${summary.totalTransactions}? I've seen tadpoles with better success rates! Your wallet's emptier than a frog's dating app.`,
        `Your wallet's so broke it can't even afford the gas fees! ${summary.totalValue} is less than I spend on flies for breakfast. Ribbit-iculous!`
      ] : []),
      
      // Average wallet roasts
      ...(walletCategory === 'average' ? [
        `Oh look, a perfectly mediocre wallet with ${summary.totalValue} in value. Not poor enough to ignore, not wealthy enough to respect. How toadally unremarkable.`,
        `${summary.uniqueContractsInteracted} contracts? Hopping around like you know what you're doing, but that ${summary.successRate}% success rate tells a different story. Stick to fly catching, dear.`,
        `${summary.totalTransactions} transactions to end up with just ${summary.totalValue}? My pond has better yields during a drought. Ribbit-iculous investment strategy!`
      ] : []),
      
      // Wealthy wallet roasts
      ...(walletCategory === 'wealthy' ? [
        `${summary.totalValue} and you're still making ${summary.failedTransactions} failed transactions? Money clearly can't buy intelligence in the swamp. *adjusts golden monocle*`,
        `Look at you with ${summary.totalValue}! Did daddy frog give you a trust fund? Because that ${summary.successRate}% success rate suggests you didn't earn it yourself.`,
        `${summary.uniqueContractsInteracted} different contracts? Diversification or confusion? With ${summary.totalValue}, you're either lucky or laundering. Ribbit!`
      ] : [])
    ];
    
    // Add some generic but data-informed roasts to the mix
    const genericDataRoasts = [
      `${summary.daysInactive > 30 ? 'Abandoned your wallet for ' + summary.daysInactive + ' days?' : 'Only ' + summary.totalTransactions + ' transactions?'} Even tadpoles show more commitment to their crypto! Your ${summary.successRate}% success rate is toadally embarrassing.`,
      
      `${summary.topTokensTraded.length > 0 ? 'Trading ' + summary.topTokensTraded.map(t => t.symbol).join(', ') + '?' : 'Your token choices'} I wouldn't feed those to the flies at the bottom of my pond! What the frog were you thinking?`,
      
      `Largest transaction only ${summary.largestTransaction.value}? ${parseFloat(summary.largestTransaction.value) < 1 ? 'That wouldn\'t even buy a decent lily pad!' : 'Trying to make a splash with that drop in the pond?'} *adjusts monocle disapprovingly*`
    ];
    
    // Combine specific and generic roasts
    const allRoasts = [...dynamicRoasts, ...genericDataRoasts];
    
    // If we have valid roasts, return a random one
    if (allRoasts.length > 0) {
      return allRoasts[Math.floor(Math.random() * allRoasts.length)];
    }
    
    // Fallback in case dynamic roast generation fails
    const fallbackRoasts = [
      `${summary.totalValue} in transactions? Toadally pathetic! Even lily pads generate more value. ${summary.failedTransactions} failed tx's proves you're as financially competent as a tadpole with a calculator!`,
      
      `You call that investing? ${summary.totalTransactions} pointless hops across ${summary.uniqueContractsInteracted} contracts. Your portfolio is more underwater than I am, and I'm a frog!`,
      
      `${summary.daysInactive} days of inactivity? Ribbit-iculous! Smart move staying away from what you clearly don't understand. Your success rate of ${summary.successRate}% makes even pond scum look valuable.`,
      
      `Hopping mad looking at your trades! This wallet is a masterclass in financial self-destruction. Even tadpoles wouldn't touch these tokens with their tiny tails!`,
      
      `I've seen more impressive portfolios in a child's Monopoly game. This isn't investing - it's toadal financial suicide! What the frog were you thinking?`
    ];
    
    return fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
  } else {
    // Empty wallet or no transactions - snarky roasts
    const emptyWalletRoasts = [
      "Either this wallet is new, or you're too embarrassed to show your transactions. Smart move hiding your shameful trades - I'd be green with embarrassment too!",
      
      "No transactions? What's the matter, afraid to get your webbed feet wet in the crypto pond? Ribbit or get off the lily pad, coward!",
      
      "Empty wallet, empty dreams! Your crypto activity is as barren as a dried-up swamp. Even my pet flies have more impressive portfolios!",
      
      "Wallet cleaner than my monocle! Either you've never traded or you've made such catastrophic leaps that you had to start over. Either way, I'm not impressed!",
      
      "No transactions? You're either the world's most patient HODLer or just hopelessly confused about how blockchains work. Toadally betting on the latter!",
      
      "This wallet is emptier than a frog's dating app during mating season! At least create some failed transactions so I have something to mock!",
      
      "I was all ready to savage your portfolio, but there's nothing here to roast! The only thing sadder than bad trades is NO trades. Pathetic!"
    ];
    
    return emptyWalletRoasts[Math.floor(Math.random() * emptyWalletRoasts.length)];
  }
};
