// Anura API Service for AI roast generation
import { TransactionSummary } from './etherscanService'
import { ChainId } from './chains/types'

interface AnuraMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AnuraRequestOptions {
  temperature?: number
  top_p?: number
  top_k?: number
  stop?: string[]
  max_tokens?: number
  seed?: number
}

interface AnuraRequest {
  model: string
  messages: AnuraMessage[]
  stream: boolean
  options?: AnuraRequestOptions
}

// interface AnuraResponse {
//   model: string;
//   message: {
//     role: string;
//     content: string;
//   };
//   done: boolean;
// }

interface UniqueParams {
  seed?: number
  temperature?: number
  personalityIndex?: number
  styleIndex?: number
  themeIndex?: number
}

/**
 * Clean and format the roast text, removing any quotation marks and artifacts
 */
function cleanRoastText(content: string): string {
  // Trim the content
  let cleanedText = content.trim()

  // Clean up thinking tags and other artifacts
  cleanedText = cleanedText.replace(
    /\\u003cthink\\u003e[\s\S]*?\\u003c\/think\\u003e/g,
    ''
  )
  cleanedText = cleanedText.replace(/\\u003c\/?think\\u003e/g, '')
  cleanedText = cleanedText.replace(/<think>[\s\S]*?<\/think>/g, '')
  cleanedText = cleanedText.replace(/<\/?think>/g, '')

  // Remove any markdown formatting indicators
  cleanedText = cleanedText.replace(/^```[\s\S]*?```$/gm, '')

  // Remove extra newlines and quotes
  cleanedText = cleanedText.replace(/\\n/g, ' ')
  cleanedText = cleanedText.replace(/\n+/g, ' ')
  cleanedText = cleanedText.replace(/"\s*"/g, ' ')
  cleanedText = cleanedText.replace(/\s+/g, ' ')

  // Decode unicode escape sequences
  cleanedText = cleanedText.replace(/\\u([0-9a-fA-F]{4})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  })

  // CRITICAL: Remove all escaped and unescaped quotation marks
  cleanedText = cleanedText.replace(/\\"/g, '')
  cleanedText = cleanedText.replace(/"/g, '')
  cleanedText = cleanedText.replace(/"/g, '')
  cleanedText = cleanedText.replace(/"/g, '')
  cleanedText = cleanedText.replace(/'/g, "'")
  
  // Convert token tickers to lowercase
  const tokenTickers = ['ETH', 'BTC', 'UNI', 'SUSHI', 'PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BONK', 'CAKE', 'CRV', 'AAVE', 'MATIC', 'ARB', 'OP', 'LINK', 'DAI', 'USDC', 'USDT'];
  tokenTickers.forEach(ticker => {
    const pattern = new RegExp(`\\b${ticker}\\b`, 'g');
    cleanedText = cleanedText.replace(pattern, ticker.toLowerCase());
  });

  return cleanedText.trim()
}

/**
 * Generate a roast for a wallet based on transaction summary using Anura API
 */
export const generateRoast = async (
  transactionSummary: TransactionSummary,
  walletAddress: string,
  apiKey: string,
  uniqueParams: UniqueParams = {}
): Promise<string> => {
  try {
    // Use the provided seed or generate a random one
    const randomSeed = uniqueParams.seed || Math.floor(Math.random() * 1000000)

    // Construct a concise, purely funny roast prompt
    const systemPrompt = `You are Sir Croaksworth, a savage banker who BRUTALLY roasts crypto wallets with hilarious, shareable insults.
    
    GIVE ONE PERFECT ROAST WITH NO EXTRA TEXT - NO explanations, NO lead-ins, NO quotes.
    
    Write as a mean comedian delivering a perfect one-liner about terrible financial decisions:
    - Be SPECIFIC about their actual tokens/transactions
    - Prioritize references to their real wallet activity over generic jokes
    - Call out specific trades, NFTs, or patterns in their wallet
    - IMPORTANT: Don't capitalize token names or tickers - write them in lowercase (e.g., "eth" not "ETH", "uni" not "UNI")
    - Be EXTREMELY witty, ruthlessly funny and HIGHLY SHAREABLE
    - Keep it under 180 characters
    - DO NOT use quotation marks at all
    - Frog puns are optional and secondary to wallet-specific jokes
    - Direct insult to "you" (the wallet owner) - not in third person
    - Make the insult clever, unexpected and biting
    
    BAD EXAMPLE: "Your wallet has the sophistication of a tadpole with a calculator."
    BAD EXAMPLE: "I see you like trading. Ribbit ribbit, that's frog for 'you're bad at this.'"
    BAD EXAMPLE: "Your UNI trades scream poor decisions." (UNI should be lowercase as "uni")
    
    GOOD EXAMPLE: Your uni trades scream 'I read half an article once and went all in.' That 80% slippage tolerance explains your net worth better than your resume ever could.
    GOOD EXAMPLE: Calling those shib transactions an 'investment strategy' is like calling a dumpster fire a BBQ. At least a dumpster fire keeps you warm.
    
    JUST GIVE THE ROAST LINE WITH NO QUOTES.`

    // Get the chain information
    const chain = transactionSummary.chain || 'ethereum' as ChainId
    const chainSymbol =
      chain === 'ethereum'
        ? 'ETH'
        : chain === 'polygon'
        ? 'MATIC'
        : chain === 'arbitrum'
        ? 'ARB'
        : chain === 'optimism'
        ? 'OP'
        : chain === 'base'
        ? 'BASE'
        : 'ETH'

    // Format wallet value with appropriate size description
    const walletValueFormatted =
      parseFloat(transactionSummary.totalValue) > 10
        ? `Large (${transactionSummary.totalValue} ${chainSymbol})`
        : parseFloat(transactionSummary.totalValue) < 0.1
        ? `Tiny (${transactionSummary.totalValue} ${chainSymbol})`
        : `Average (${transactionSummary.totalValue} ${chainSymbol})`

    // Direct, transaction-focused prompt
    const userPrompt = `SAVAGE ROAST FOR THIS WALLET'S TRANSACTIONS:
    
    CHAIN: ${(chain as string).toUpperCase()}
    TOKENS TRADED: ${
      transactionSummary.topTokensTraded.length > 0
        ? transactionSummary.topTokensTraded.map((t) => t.symbol).join(', ')
        : 'None'
    }
    WALLET VALUE: ${walletValueFormatted}
    TOTAL TX COUNT: ${transactionSummary.totalTransactions} 
    FAILED TX COUNT: ${transactionSummary.failedTransactions}
    INACTIVE DAYS: ${transactionSummary.daysInactive ?? 0}
    
    SPECIAL NOTES:
    ${
      transactionSummary.topTokensTraded.some((t) =>
        ['PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BONK'].includes(t.symbol)
      )
        ? '- Trades meme coins (mention specific coins like pepe, shib, etc. in lowercase)'
        : ''
    }
    ${
      transactionSummary.topTokensTraded.some((t) =>
        ['UNI', 'SUSHI', 'CAKE', 'CRV'].includes(t.symbol)
      )
        ? '- Uses DeFi exchanges (mention specific tokens like uni, sushi, etc. in lowercase)'
        : ''
    }
    ${parseFloat(transactionSummary.totalValue) < 0.01 ? '- Almost empty wallet (mock their poverty)' : ''}
    ${transactionSummary.daysInactive && transactionSummary.daysInactive > 30 ? '- Abandoned wallet (make fun of giving up or paper hands)' : ''}
    ${
      transactionSummary.failedTransactions && transactionSummary.failedTransactions > 3
        ? '- Lots of failed transactions (mock their technical incompetence)'
        : ''
    }
    
    REMEMBER: Write all token names in lowercase (eth, btc, uni, etc.), not uppercase.
    
    GIVE ONE PERFECT ROAST LINE - NO QUOTATION MARKS - NO EXPLANATIONS. MAKE IT EXTREMELY FUNNY AND SHAREABLE.`

    // Prepare the request payload
    const requestPayload: AnuraRequest = {
      model: 'deepseek-r1:7b', // Using model from the provided documentation
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false, // Explicitly disable streaming
      options: {
        // Use the provided temperature or a high default for creativity
        temperature: uniqueParams.temperature || 0.95,
        // Keep top_p high for diverse responses
        top_p: 0.98,
        // Use the provided seed for deterministic but varied responses
        seed: randomSeed,
      },
    }

    // Define API URL (with fallback)
    const apiUrl = 'https://anura-testnet.lilypad.tech/api/v1/chat/completions';
    console.log(`Making API request to: ${apiUrl}`);
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      // Make the API request
      const response = await fetch(
        apiUrl,
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Explicitly request JSON format
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      }
      )

      if (!response.ok) {
        // Print the full error details to help debug API issues
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
        })
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      // Log response status for debugging
      console.log(`Anura API Response Status: ${response.status} ${response.statusText}`)
      console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()))
      
      // Try to parse the response
      const responseText = await response.text()

      // Log the raw response for debugging
      console.log(
        'RAW RESPONSE TEXT (first 200 chars):',
        responseText.substring(0, 200)
      )

      // Check if we got an event stream response (despite asking for non-streaming)
      if (responseText.includes('event:') || responseText.includes('data:')) {
        // This is a server-sent event stream
        console.log('Detected event stream response')
        
        let combinedContent = '';
      
        // Split into individual events
        const events = responseText.split('\n\n').filter(event => event.trim());
        console.log(`Found ${events.length} events in stream`);
        
        // Process all events to extract content
        for (const event of events) {
          // Look for delta events with content
          if (event.includes('event: delta') && event.includes('data:')) {
            try {
              // Extract the JSON data part
              const dataMatch = event.match(/data: (\{[\s\S]*\})/);
              if (dataMatch && dataMatch[1]) {
                const deltaData = JSON.parse(dataMatch[1]);
                
                // Extract content from the delta
                if (deltaData.message && deltaData.message.content) {
                  combinedContent += deltaData.message.content;
                }
              }
            } catch (err) {
              console.error('Error parsing delta event:', err);
            }
          }
        }
        
        // If we extracted content from the deltas, use it
        if (combinedContent) {
          return cleanRoastText(combinedContent);
        }
        
        // Fallback to extraction methods for other formats
        
        // Look for completion data in the stream
        const completionMatch = responseText.match(
          /data:\s*\{"model":[\s\S]*?"message"[\s\S]*?\}/
        )
        if (completionMatch && completionMatch[0]) {
          try {
            // Extract just the JSON part after "data:"
            const jsonText = completionMatch[0].replace(/^data:\s*/, '')
            const data = JSON.parse(jsonText)

            if (data.message && data.message.content) {
              return cleanRoastText(data.message.content)
            }
          } catch (err) {
            console.error('Error parsing completion data:', err)
          }
        }

        // Look for content directly in the stream
        const contentMatch = responseText.match(/"content":"([\s\S]*?)"(,|\})/)
        if (contentMatch && contentMatch[1]) {
          const content = contentMatch[1].trim()
          return cleanRoastText(content)
        }

        // Check for explicit error messages
        const errorMatch = responseText.match(
          /error response from server: ([\s\S]*?)($|\n)/
        )
        if (errorMatch && errorMatch[1]) {
          throw new Error(`Anura API error: ${errorMatch[1]}`)
        }

        // If we get here, try to salvage something from the response
        console.error('Could not extract content from event stream');
        throw new Error('Failed to parse streaming response from API');
    }

    // Try to parse as a regular JSON response
    try {
      const data = JSON.parse(responseText)
      console.log('Parsed API response data:', JSON.stringify(data).substring(0, 300))

      // Handle different possible response formats:
      
      // Format 1: Anura API standard format
      if (data.message && data.message.content) {
        return cleanRoastText(data.message.content)
      } 
      // Format 2: OpenAI-compatible completion format
      else if (data.choices && data.choices[0]) {
        if (data.choices[0].text) {
          return cleanRoastText(data.choices[0].text)
        } else if (data.choices[0].message && data.choices[0].message.content) {
          return cleanRoastText(data.choices[0].message.content)
        }
      }
      // Format 3: Possible simple text in content field
      else if (data.content) {
        return cleanRoastText(data.content)
      }
      // Format 4: Any text field that might contain the response
      else {
        // Try to find any plausible content field
        for (const key of Object.keys(data)) {
          if (typeof data[key] === 'string' && data[key].length > 20) {
            return cleanRoastText(data[key])
          } else if (data[key] && typeof data[key] === 'object') {
            for (const subKey of Object.keys(data[key])) {
              if (['content', 'text', 'response', 'result'].includes(subKey) && 
                  typeof data[key][subKey] === 'string') {
                return cleanRoastText(data[key][subKey])
              }
            }
          }
        }
      }
      
      console.error('Unexpected response format:', data)
      throw new Error('Could not extract roast text from API response')
    } catch (error) {
      console.error('Error parsing response:', error)
      console.error('Response text:', responseText.substring(0, 500))
      throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : String(error)}`)
      }
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Check if this was a timeout
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API request timed out after 15 seconds');
        throw new Error('API request timed out. Please try again.');
      }
      
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    // Log the full error and re-throw it
    console.error('Error generating roast:', error)
    throw error
  }
}

/**
 * Generate fallback roast when API fails
 */
export const getRandomFallbackRoast = (
  uniqueParams: UniqueParams = {}
): string => {
  // Determine which set of fallbacks to use based on parameters
  const index = uniqueParams.personalityIndex || Math.floor(Math.random() * 6)

  // Different sets of fallbacks for variety
  const fallbackSets = [
    // Set 1: Trading strategy mockery
    [
      'Your crypto strategy is just a toddler playing Jenga with your savings. At least the toddler knows when things are about to collapse.',
      'If disappointment had a blockchain address, it would be yours. Even your failed transactions are embarrassed by you.',
      'Calling your wallet an investment portfolio is like calling a dumpster a five-star restaurant. Both leave you broke and confused.',
    ],
    // Set 2: Financial decision mockery
    [
      "Your wallet screams 'I read half a CoinDesk article once.' Congrats on funding some crypto bro's new yacht.",
      'Your transaction history looks like someone with a calculator having a seizure. Chaotic button pressing with zero strategy.',
      "The gas fees you've wasted could have paid for therapy to explore why you make such terrible decisions.",
    ],
    // Set 3: Token-specific
    [
      "Your meme coin addiction is just gambling with extra steps and worse odds. Vegas would at least comp you a drink for those losses.",
      "That stablecoin hoarding strategy is peak 'I'm scared of real investing but also inflation.' Have you considered buying literal mattress stuffing instead?",
      "Your DEX swaps have all the coherence of a drunk person trying to order at a drive-thru. 'I'll have... no wait... actually...'"
    ],
    // Set 4: Witty insults
    [
      "Your wallet is what financial advisors show as a cautionary tale: 'This happens when you invest while intoxicated.'",
      "Remember when people said 'be your own bank'? They definitely didn't mean whatever tragic experiment you're conducting.",
      "I'm trying to find something positive to say about your wallet, but that would require Tolkien-level fiction skills.",
    ],
    // Set 5: Absurd comparisons
    [
      "Your crypto strategy makes as much sense as drying yourself with a wet towel. Somehow you're worse off after each attempt.",
      'Your portfolio has the stability of a one-legged flamingo on an ice rink during an earthquake. Impressively bad.',
      "Looking at your transactions is like watching someone fight fire with gasoline while calling it 'innovative firefighting.'",
    ],
    // Set 6: Chain-specific
    [
      "If your wallet could speak, it would file for emancipation. No digital entity deserves the abuse you've put it through.",
      "You've spent more on failed transactions than most people spend on coffee in a year. Have you considered just burning money directly? It's more efficient.",
      'Your crypto journey is what happens when FOMO meets YOLO and they have an ugly baby called BROKE-O.',
    ],
  ]

  // Get the appropriate set
  const set = fallbackSets[index % fallbackSets.length]

  // Pick a random roast from that set and clean it
  const roast =
    set[
      (uniqueParams.styleIndex !== undefined ? uniqueParams.styleIndex % set.length : Math.floor(Math.random() * set.length))
    ]
  return cleanRoastText(roast)
}
