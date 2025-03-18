// Anura API Service for AI roast generation
import { TransactionSummary } from './etherscanService'

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
    const systemPrompt = `You are Sir Croaksworth, a savage frog banker who BRUTALLY roasts crypto wallets with hilarious, shareable insults.
    
    GIVE ONE PERFECT ROAST WITH NO EXTRA TEXT - NO explanations, NO lead-ins, NO quotes.
    
    Write as a mean comedian delivering a perfect one-liner about terrible financial decisions:
    - Be specific about their actual tokens/transactions
    - Use frog-related puns when possible
    - Be EXTREMELY witty, ruthlessly funny and HIGHLY SHAREABLE
    - Keep it under 180 characters
    - DO NOT use quotation marks at all
    - Don't include technical jargon
    - Don't say "AI trader", "AI tokens", or similar AI references
    - Direct insult to "you" (the wallet owner) - not in third person
    - Make the insult clever, unexpected and biting
    
    BAD EXAMPLE: "An average Ethereum wallet holding some tokens... And here's your average trader:"
    BAD EXAMPLE: "Your wallet has the sophistication of a tadpole with a calculator."
    
    GOOD EXAMPLE: Your DeFi strategy has the sophistication of a tadpole with a calculator. Those UNI trades scream 'I read half an article once and went all in.'
    GOOD EXAMPLE: Calling your wallet an investment portfolio is like calling a dumpster a five-star restaurant - insulting to dumpsters everywhere.
    
    JUST GIVE THE ROAST LINE WITH NO QUOTES.`

    // Get the chain information
    const chain = transactionSummary.chain || 'ethereum'
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
    
    CHAIN: ${chain.toUpperCase()}
    TOKENS TRADED: ${
      transactionSummary.topTokensTraded.length > 0
        ? transactionSummary.topTokensTraded.map((t) => t.symbol).join(', ')
        : 'None'
    }
    WALLET VALUE: ${walletValueFormatted}
    TOTAL TX COUNT: ${transactionSummary.totalTransactions} 
    FAILED TX COUNT: ${transactionSummary.failedTransactions}
    INACTIVE DAYS: ${transactionSummary.daysInactive || 0}
    
    SPECIAL NOTES:
    ${
      transactionSummary.topTokensTraded.some((t) =>
        ['PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BONK'].includes(t.symbol)
      )
        ? '- Trades meme coins'
        : ''
    }
    ${
      transactionSummary.topTokensTraded.some((t) =>
        ['UNI', 'SUSHI', 'CAKE', 'CRV'].includes(t.symbol)
      )
        ? '- Uses DeFi exchanges'
        : ''
    }
    ${transactionSummary.totalValue < 0.01 ? '- Almost empty wallet' : ''}
    ${transactionSummary.daysInactive > 30 ? '- Abandoned wallet' : ''}
    ${
      transactionSummary.failedTransactions > 3
        ? '- Lots of failed transactions'
        : ''
    }
    
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

    // Make the API request
    const response = await fetch(
      'https://anura-testnet.lilypad.tech/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
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

      // Look for completion data in the stream
      const completionMatch = responseText.match(
        /data:\s*\{"model":.*?"message".*?\}/s
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
      const contentMatch = responseText.match(/"content":"(.*?)"(,|\})/s)
      if (contentMatch && contentMatch[1]) {
        const content = contentMatch[1].trim()
        return cleanRoastText(content)
      }

      // Check for explicit error messages
      const errorMatch = responseText.match(
        /error response from server: (.*?)($|\n)/s
      )
      if (errorMatch && errorMatch[1]) {
        throw new Error(`Anura API error: ${errorMatch[1]}`)
      }

      // If we get here, try to salvage something from the response
      return `Sir Croaksworth seems tongue-tied today. Try again or check your wallet address.`
    }

    // Try to parse as a regular JSON response
    try {
      const data = JSON.parse(responseText)

      if (data.message && data.message.content) {
        return cleanRoastText(data.message.content)
      } else if (data.choices && data.choices[0] && data.choices[0].text) {
        // Handle possible completion format
        return cleanRoastText(data.choices[0].text)
      } else {
        console.error('Unexpected response format:', data)
        throw new Error('Unexpected response format from API')
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError)
      console.error('Response text:', responseText.substring(0, 500))
      throw new Error(`Failed to parse API response: ${parseError.message}`)
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
    // Set 1: General mockery
    [
      'Your crypto strategy is just a toddler playing Jenga with your savings. At least the toddler knows when things are about to collapse.',
      'If disappointment had a blockchain address, it would be yours. Even your failed transactions are embarrassed by you.',
      'Calling your wallet an investment portfolio is like calling a dumpster a five-star restaurant. Both leave you broke and confused.',
    ],
    // Set 2: Financial mockery
    [
      "Your wallet screams 'I read half a CoinDesk article once.' Congrats on funding some crypto bro's new yacht.",
      'Your transaction history looks like a squirrel with a calculator. Chaotic button pressing with zero strategy.',
      "The gas fees you've wasted could have paid for therapy to explore why you make such terrible decisions.",
    ],
    // Set 3: Frog-themed
    [
      "Even tadpoles have better financial instincts than whatever frog-brained strategy you're attempting. Ribbit ribbit... that's frog for 'why?'",
      "Croaking unimpressed. Your wallet's less appealing than a dried-up lily pad in toxic waste. At least that might create a superhero.",
      "I've seen more impressive portfolios from a frog that accidentally sat on a hardware wallet. At least that was an accident.",
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
    // Set 6: Random but funny
    [
      "If your wallet could speak, it would file for emancipation. No digital entity deserves the abuse you've put it through.",
      "I've seen more coherent investment strategies from a drunk Magic 8-Ball. 'Outlook not so good' is an understatement.",
      'Your crypto journey is what happens when FOMO meets YOLO and they have an ugly baby called BROKE-O.',
    ],
  ]

  // Get the appropriate set
  const set = fallbackSets[index % fallbackSets.length]

  // Pick a random roast from that set and clean it
  const roast =
    set[
      uniqueParams.styleIndex % set.length ||
        Math.floor(Math.random() * set.length)
    ]
  return cleanRoastText(roast)
}
