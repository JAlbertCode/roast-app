import { TransactionSummary } from './etherscanService'
import { ChainId } from './chains/types'
import { betterCleanRoastText } from './betterCleanRoastText'

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

interface UniqueParams {
  seed?: number
  temperature?: number
  personalityIndex?: number
  styleIndex?: number
  themeIndex?: number
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
    const systemPrompt = `You are Sir Croaksworth, a SAVAGE frog banker who BRUTALLY roasts crypto wallets with clever, witty, ultra-shareable zingers.
    
    GIVE ONE PERFECT ROAST WITH NO EXTRA TEXT - NO explanations, NO lead-ins, NO quotes, NO ESCAPE CHARACTERS.
    
    Write as a smooth, clever roast comedian delivering sharp burns about terrible financial decisions. THE KEY TO GREAT ROASTS IS CLEVER, REALISTIC ANALOGIES THAT RING TRUE:
    - FOCUS ON ONLY ONE TOKEN OR TICKER - reference just a single token/transaction pattern
    - Be specific about their activity with that one token or pattern
    - IMPORTANT: Don't capitalize token names or tickers - write them in lowercase (e.g., "eth" not "ETH", "uni" not "UNI")
    - Use CLEVER, RELATABLE COMPARISONS AND ANALOGIES (not excessively absurd or nonsensical)
    - Be WITTY and SMOOTH like a professional roast comedian
    - Make the roast biting, realistic, and genuinely funny - should feel like a perfect burn
    - 1-2 sharp sentences with clever analogies (like the example roasts below)
    - DO NOT use any quotation marks, backslashes, or newlines in your output
    - DO NOT analyze, explain your thinking, or break down your approach
    - Frog puns are optional and secondary to wallet-specific jokes
    - Direct insult to "you" (the wallet owner) - not in third person
    
    BAD EXAMPLE: "Lets break it down. First, the user provided some data about a wallet..." (Don't analyze or explain)
    BAD EXAMPLE: "Your wallet has the sophistication of a tadpole with a calculator." (Too generic, no specific token)
    BAD EXAMPLE: "Your uni and shib trades show you make consistently bad choices across the board." (References multiple tokens)
    BAD EXAMPLE: "Your UNI trades scream poor decisions." (UNI should be lowercase as "uni")
    BAD EXAMPLE: "Your eth trades\nshow poor decisions." (Contains newline characters)
    BAD EXAMPLE: "Your trades are like a kangaroo on Mars trying to play piano with bananas." (Too absurd, nonsensical)
    
    GOOD EXAMPLE: Your paper hands make actual paper look diamond-reinforced by comparison. The wind from a butterfly could trigger your sell reflex.
    GOOD EXAMPLE: Your transaction history reads like the diary of someone actively trying to lose money in creative ways.
    GOOD EXAMPLE: The gas fees you've wasted could have paid for therapy to explore why you make such terrible decisions.
    GOOD EXAMPLE: Your failed transaction count suggests you think the error messages are just gentle suggestions.
    GOOD EXAMPLE: If wealth destruction was an Olympic sport, your wallet would have more gold medals than Michael Phelps.
    GOOD EXAMPLE: Your eth strategy is the financial equivalent of bringing a spoon to a gunfight. Adorably misguided but painfully effective.
    GOOD EXAMPLE: Calling your wallet an investment portfolio is like calling a dumpster a five-star restaurant. Both leave you broke and confused.
    
    DO NOT START WITH ANY EXPLANATION OR ANALYSIS. JUST GIVE THE ROAST LINE WITH NO QUOTES, NO BACKSLASHES, AND NO NEWLINES.`

    // Get the chain information
    const chain = transactionSummary.chain || ('ethereum' as ChainId)
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
        : chain === 'avalanche'
        ? 'AVAX'
        : chain === 'fantom'
        ? 'FTM'
        : chain === 'bsc'
        ? 'BNB'
        : chain === 'cronos'
        ? 'CRO'
        : chain === 'zksync'
        ? 'ETH'
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
    ${(() => {
      // Find a meme coin if they have one
      const memeCoin = transactionSummary.topTokensTraded.find((t) =>
        [
          'PEPE',
          'SHIB',
          'DOGE',
          'FLOKI',
          'BONK',
          'WIF',
          'BRETT',
          'TOSHI',
          'TURBO',
          'MOG',
        ].includes(t.symbol)
      )
      if (memeCoin) {
        return `- HIGH PRIORITY: Focus on their ${memeCoin.symbol.toLowerCase()} trades - this is great meme coin material`
      }
      return ''
    })()}
    ${(() => {
      // Find a DeFi token if they have one
      const defiToken = transactionSummary.topTokensTraded.find((t) =>
        [
          'UNI',
          'SUSHI',
          'CAKE',
          'CRV',
          'COMP',
          'AAVE',
          'MKR',
          'GMX',
          'BAL',
          'JOE',
          'SPELL',
          'VELO',
        ].includes(t.symbol)
      )
      if (defiToken) {
        return `- HIGH PRIORITY: Focus on their ${defiToken.symbol.toLowerCase()} DeFi usage - mock their attempt at financial sophistication`
      }
      return ''
    })()}
    ${
      parseFloat(transactionSummary.totalValue) < 0.01
        ? '- Almost empty wallet - mock their extreme poverty with a creative comparison'
        : ''
    }
    ${
      transactionSummary.daysInactive && transactionSummary.daysInactive > 30
        ? '- Abandoned wallet - create a hilarious analogy about giving up or paper hands'
        : ''
    }
    ${
      transactionSummary.failedTransactions &&
      transactionSummary.failedTransactions > 3
        ? '- Lots of failed transactions - use a funny analogy about their technical incompetence'
        : ''
    }
    
    ROAST STYLE INSTRUCTIONS:
    - PRIORITIZE CLEVER, REALISTIC ANALOGIES - this makes roasts both funny and relatable
    - Compare their crypto activity to something witty and realistic that people immediately understand
    - Use clever comparisons that are grounded in reality but still sharp and funny
    - Make it extremely SHAREABLE - the person should laugh even though it's roasting them
    - Go for memorable, clever analogies - these make the roast smooth and impactful
    - Be WITTY and GENUINELY FUNNY, not mean or overly absurd
    - Focus on quality over quantity - one perfect, realistic burn is better than multiple bizarre ones
    
    THESE ARE MY FAVORITE ROAST EXAMPLES - MATCH THIS STYLE:
    - "Your transaction history reads like the diary of someone actively trying to lose money in creative ways."
    - "Calling your wallet an investment portfolio is like calling a dumpster a five-star restaurant. Both leave you broke and confused."
    - "Your timing is so bad I suspect you have a special calendar that only shows days perfect for losing money."
    - "Your failed transaction count suggests you think the error messages are just gentle suggestions."
    - "If wealth destruction was an Olympic sport, your wallet would have more gold medals than Michael Phelps."
    
    CRITICAL FORMATTING INSTRUCTIONS: 
    - FOCUS ON JUST ONE TOKEN/TICKER - don't reference multiple tokens in your roast
    - If you mention a token, pick only the most interesting one from their wallet
    - Write all token names in lowercase (eth, btc, uni, etc.), not uppercase
    - DO NOT use any newline characters (\n) in your response
    - DO NOT use any backslash characters (\) in your response
    - DO NOT use any quotation marks in your response
    - DO NOT analyze the data, explain your thinking, or include any prefatory remarks
    - DO NOT start with phrases like "Let's break it down" or "Looking at this wallet"
    - DO NOT include any meta commentary about roasting or the roast
    
    GIVE ONE PERFECT ROAST LINE - SIMPLE TEXT ONLY - NO ANALYSIS - JUST THE INSULT - NO QUOTATION MARKS - NO EXPLANATIONS - NO ESCAPE CHARACTERS - NO NEWLINES. MAKE IT EXTREMELY FUNNY AND SHAREABLE.
    
    IMPORTANT: START DIRECTLY WITH THE ROAST ITSELF. DO NOT INCLUDE ANY PREAMBLE OR EXPLANATION.`

    // Prepare the request payload
    const requestPayload: AnuraRequest = {
      model: 'deepseek-r1:7b', // Using model from the provided documentation
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false, // Explicitly disable streaming
      options: {
        // Use the provided temperature or a balanced default for creativity with coherence
        temperature: uniqueParams.temperature || 0.84, // Lower for more coherent, grounded responses
        // Keep top_p moderate for diverse but not extreme responses
        top_p: 0.92,
        // Keep top_k moderate for varied but not bizarre word choices
        top_k: 40,
        // Use the provided seed for deterministic but varied responses
        seed: randomSeed,
      },
    }

    // Define API URL (with fallback)
    const apiUrl = 'https://anura-testnet.lilypad.tech/api/v1/chat/completions'
    console.log(`Making API request to: ${apiUrl}`)

    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    try {
      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json', // Explicitly request JSON format
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      })

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
      clearTimeout(timeoutId)

      // Log response status for debugging
      console.log(
        `Anura API Response Status: ${response.status} ${response.statusText}`
      )
      console.log(
        `Response Headers:`,
        Object.fromEntries(response.headers.entries())
      )

      // Try to parse the response
      const responseText = await response.text()

      // Log the raw response for debugging
      console.log(`API response for request with seed ${randomSeed}:`)
      console.log('Response length:', responseText.length)
      console.log('First 200 chars:', responseText.substring(0, 200))

      // Check for empty or very short responses
      if (!responseText || responseText.length < 20) {
        console.error('Empty or very short response received')
        throw new Error('Empty response from Anura API')
      }

      // Check if we got an event stream response (despite asking for non-streaming)
      if (responseText.includes('event:') || responseText.includes('data:')) {
        // This is a server-sent event stream
        console.log('Detected event stream response')

        let combinedContent = ''

        // Split into individual events
        const events = responseText
          .split('\n\n')
          .filter((event) => event.trim())
        console.log(`Found ${events.length} events in stream`)

        // Process all events to extract content
        for (const event of events) {
          // Look for delta events with content
          if (event.includes('event: delta') && event.includes('data:')) {
            try {
              // Extract the JSON data part
              const dataMatch = event.match(/data: (\{[\s\S]*\})/)
              if (dataMatch && dataMatch[1]) {
                const deltaData = JSON.parse(dataMatch[1])

                // Extract content from the delta
                if (deltaData.message && deltaData.message.content) {
                  combinedContent += deltaData.message.content
                }
              }
            } catch (err) {
              console.error('Error parsing delta event:', err)
            }
          }
        }

        // If we extracted content from the deltas, use it
        if (combinedContent) {
          return betterCleanRoastText(combinedContent)
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
              return betterCleanRoastText(data.message.content)
            }
          } catch (err) {
            console.error('Error parsing completion data:', err)
          }
        }

        // Look for content directly in the stream
        const contentMatch = responseText.match(/"content":"([\s\S]*?)"(,|\})/)
        if (contentMatch && contentMatch[1]) {
          const content = contentMatch[1].trim()
          return betterCleanRoastText(content)
        }

        // Check for explicit error messages
        const errorMatch = responseText.match(
          /error response from server: ([\s\S]*?)($|\n)/
        )
        if (errorMatch && errorMatch[1]) {
          throw new Error(`Anura API error: ${errorMatch[1]}`)
        }

        // If we get here, try to salvage something from the response
        console.error('Could not extract content from event stream')
        throw new Error('Failed to parse streaming response from API')
      }

      // Try to parse as a regular JSON response
      try {
        const data = JSON.parse(responseText)
        console.log(
          'Parsed API response data:',
          JSON.stringify(data).substring(0, 300)
        )

        // Handle different possible response formats:

        // Format 1: Anura API standard format
        if (data.message && data.message.content) {
          return betterCleanRoastText(data.message.content)
        }
        // Format 2: OpenAI-compatible completion format
        else if (data.choices && data.choices[0]) {
          if (data.choices[0].text) {
            return betterCleanRoastText(data.choices[0].text)
          } else if (
            data.choices[0].message &&
            data.choices[0].message.content
          ) {
            return betterCleanRoastText(data.choices[0].message.content)
          }
        }
        // Format 3: Possible simple text in content field
        else if (data.content) {
          return betterCleanRoastText(data.content)
        }
        // Format 4: Any text field that might contain the response
        else {
          // Try to find any plausible content field
          for (const key of Object.keys(data)) {
            if (typeof data[key] === 'string' && data[key].length > 20) {
              return betterCleanRoastText(data[key])
            } else if (data[key] && typeof data[key] === 'object') {
              for (const subKey of Object.keys(data[key])) {
                if (
                  ['content', 'text', 'response', 'result'].includes(subKey) &&
                  typeof data[key][subKey] === 'string'
                ) {
                  return betterCleanRoastText(data[key][subKey])
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
        throw new Error(
          `Failed to parse API response: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId)

      // Check if this was a timeout
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API request timed out after 60 seconds')
        throw new Error(
          'API request to Lilypad timed out after 60 seconds. Please try again.'
        )
      }

      // Re-throw other errors
      throw error
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
  // Create a single flat array of all possible fallback roasts
  const allFallbackRoasts = [
    // Trading strategy mockery
    'Your crypto strategy is just a toddler playing Jenga with your savings. At least the toddler knows when things are about to collapse.',
    'If disappointment had a blockchain address, it would be yours. Even your failed transactions are embarrassed by you.',
    'Calling your wallet an investment portfolio is like calling a dumpster a five-star restaurant. Both leave you broke and confused.',
    'Your wallet is the digital equivalent of lighting money on fire, but with less warmth and ambiance.',
    'When financial advisors discuss risk tolerance, they show your transaction history as a warning label.',

    // Financial decision mockery
    "Your wallet screams 'I read half a CoinDesk article once.' Congrats on funding some crypto bro's new yacht.",
    'Your transaction history looks like someone with a calculator having a seizure. Chaotic button pressing with zero strategy.',
    "The gas fees you've wasted could have paid for therapy to explore why you make such terrible decisions.",
    'Every time you open your wallet app, your remaining balance files for emotional support.',
    'Calling your trading approach a strategy is like calling a blindfolded dart throw an investment technique.',

    // Memecoin mockery
    'Your meme coin addiction is just gambling with extra steps and worse odds. Vegas would at least comp you a drink for those losses.',
    "That stablecoin hoarding strategy is peak 'I'm scared of real investing but also inflation.' Have you considered buying literal mattress stuffing instead?",
    "Your DEX swaps have all the coherence of a drunk person trying to order at a drive-thru. 'I'll have... no wait... actually...'",
    'Your wallet suggests you think FOMO is a financial strategy rather than a warning sign.',
    'Impressive how you manage to buy at the absolute peak and sell at the absolute bottom with supernatural consistency.',

    // Witty insults
    "Your wallet is what financial advisors show as a cautionary tale: 'This happens when you invest while intoxicated.'",
    "Remember when people said 'be your own bank'? They definitely didn't mean whatever tragic experiment you're conducting.",
    "I'm trying to find something positive to say about your wallet, but that would require Tolkien-level fiction skills.",
    'Looking at your transaction history is like watching a car crash in slow motion, except the car is your financial future.',
    'Your portfolio performance makes me think your investment thesis was written in crayon.',

    // Absurd comparisons
    "Your crypto strategy makes as much sense as drying yourself with a wet towel. Somehow you're worse off after each attempt.",
    'Your portfolio has the stability of a one-legged flamingo on an ice rink during an earthquake. Impressively bad.',
    "Looking at your transactions is like watching someone fight fire with gasoline while calling it 'innovative firefighting.'",
    'Your wallet has the financial equivalent of a death wish. Every trade looks like a cry for help.',
    'Your investment approach has the strategic depth of a puddle in the Sahara.',

    // Technical incompetence
    "If your wallet could speak, it would file for emancipation. No digital entity deserves the abuse you've put it through.",
    "You've spent more on failed transactions than most people spend on coffee in a year. Have you considered just burning money directly? It's more efficient.",
    'Your crypto journey is what happens when FOMO meets YOLO and they have an ugly baby called BROKE-O.',
    'Your wallet makes tech support people develop nervous twitches. They have a special alert sound just for your transactions.',
    'Your failed transaction count suggests you think the error messages are just gentle suggestions.',

    // Paper hands mockery
    'Your paper hands make actual paper look diamond-reinforced by comparison. The wind from a butterfly could trigger your sell reflex.',
    "Buying high and selling low is a strategy, just not a good one. You've turned it into performance art.",
    'Your transaction timestamps perfectly mark the worst possible moments to trade. That takes negative talent.',
    'Looking at your sell times is like watching someone fold a royal flush because they got nervous.',
    'Every time you sell, a whale somewhere sends you a thank you card for your donation to their portfolio.',

    // Frog-themed general roasts
    'Your wallet has the strategic intelligence of a tadpole, but with less growth potential.',
    'Even amphibians have better survival instincts than whatever is guiding your investment decisions.',
    'If I had to visualize your trading strategy as a frog, it would be one jumping directly into the mouth of a snake.',
    'Like a frog in slowly boiling water, you seem completely unaware your portfolio is being cooked alive.',
    'Sir Croaksworth has seen many lily pads, but none as waterlogged and sinking as your investment strategy.',

    // Small balance mockery
    'Your wallet balance is so small it needs a microscope for viewing. Even dust particles feel bad for you.',
    'The value in your wallet could barely buy a jpeg of a sandwich, let alone an actual one.',
    "Your wallet is practicing extreme minimalism. Even Marie Kondo thinks you've gone too far.",
    "Your balance is playing limbo with zero, and it's getting impressively close to winning.",
    'I would say your wallet is on a diet, but that implies there was something substantial there to begin with.',

    // DeFi mockery
    'Your DeFi strategy is what happens when you let autocorrect make your financial decisions.',
    'Your liquidity position is as shallow as your understanding of what liquidity actually means.',
    'Calling what you do "yield farming" is an insult to both yields and farming.',
    'Your impermanent loss is the only permanent feature of your portfolio.',
    'Every DEX you touch seems to immediately regret the interaction almost as much as I regret looking at your wallet.',

    // General crypto mockery
    'Your crypto strategy is the financial equivalent of bringing a spoon to a gunfight. Adorably misguided.',
    "The coins in your wallet are competing for which one can disappoint you the most. It's a tight race.",
    'Your transaction history reads like the diary of someone actively trying to lose money in creative ways.',
    'If wealth destruction was an Olympic sport, your wallet would have more gold medals than Michael Phelps.',
    "There are casino gamblers with better risk management than whatever system you're using to make decisions.",

    // Psychological mockery
    "Your buy/sell pattern suggests you've found a way to monetize panic attacks. Not effectively, but technically.",
    'FOMO and FUD seem to be the only technical indicators guiding your investment decisions.',
    'You treat red candles as buy signals and green candles as sell signals. Bold strategy, terrible results.',
    'Your wallet shows the psychological damage of believing every tweet from accounts with laser eyes.',
    'The chart of your portfolio value would make an excellent electrocardiogram for someone experiencing cardiac arrest.',

    // Poor timing mockery
    'Your timing is so bad I suspect you have a special calendar that only shows days perfect for losing money.',
    'If there was an inverse ETF tracking your decisions, it would outperform every fund in history.',
    'Your ability to buy seconds before a crash has scientific value. Researchers should study your intuition.',
    "The precise moment you buy seems to trigger market-wide sell signals. That's almost a superpower.",
    'Time travelers would study your wallet to know exactly when NOT to be in the market.',

    // Comedy-style roasts
    'Your wallet is so sad even the blockchain feels sorry for it. Every block confirmation comes with condolences.',
    'Your portfolio is like a punchline without a joke - nobody gets it, and it just makes people uncomfortable.',
    "I've seen more financial acumen in a game of Monopoly played by kindergartners.",
    'Opening your wallet should trigger a content warning for financial horror.',
    "You've turned losing money into such an art form that galleries are considering exhibitions of your transaction history.",

    // Harsh reality roasts
    "Your wallet isn't just underperforming - it's actively trying to reach negative value through sheer force of bad decisions.",
    "At this point, your seed phrase is less valuable than the paper it's written on. At least paper has practical uses.",
    'Your investment returns are so negative they make zero look like a bull market target.',
    'What you call a portfolio, experts call a masterclass in value destruction.',
    "The good news is your wallet can't get much worse. The bad news is it definitely will anyway.",

    // Financial decision mockery
    'Your portfolio is a loyalty program for bad decisions. Congrats, you’ve reached VIP status.',
    "Your crypto strategy is like a Choose Your Own Adventure book—except every page leads to 'You lost everything.'",
    'Your wallet history looks like a speedrun of bankruptcy.',
    'Even a Magic 8-Ball would make better investment choices than you.',
    'Your portfolio is a live demonstration of what NOT to do in crypto.',
    "Your 'DYOR' is just Googling random tweets and praying.",
    'Your trades are so bad, the SEC wants to investigate just to laugh.',
    'Your portfolio is giving off ‘unpaid intern at a hedge fund’ vibes.',
    'You have the risk management skills of a raccoon in a trash fire.',
    'Your net worth swings more than a toddler on a sugar high.',

    // Paper hands & terrible timing
    'You sell faster than an influencer deletes bad financial advice.',
    'Your trades are so well-timed that hedge funds track you—just to do the opposite.',
    'Your panic-selling reflex is faster than a caffeine-fueled day trader’s.',
    "You FOMO in at the top, paper-hand out at the bottom, and wonder why you're broke.",
    'Your market timing is so bad that even Fortune Tellers laugh at you.',
    'If you were any slower to buy the dip, it would be called ‘The Recovery.’',
    'Your hands are so paper-thin they could be used as rolling papers.',
    'You dumped your bags so fast NASA mistook them for an asteroid.',
    'If regret had a ledger, your transaction history would be its genesis block.',
    'Your investment strategy is speedrunning the five stages of grief.',

    // Wallet balance & portfolio woes
    'Your wallet balance is so low, even dust particles feel rich around you.',
    'Your crypto net worth couldn’t even buy a gas fee in 2021.',
    'Your entire portfolio is worth less than a Discord Nitro subscription.',
    'I’ve seen more liquidity in a spilled drink than in your wallet.',
    'Your portfolio is a living, breathing argument against self-custody.',
    'Your net worth looks like a rounding error.',
    'Your balance is lower than my expectations for memecoins.',
    'Your portfolio graph looks like a deflating balloon.',
    'Your ‘investment thesis’ seems to be ‘what if I just lost money creatively?’',
    'Your net worth is one rug pull away from being theoretical.',

    // Frog-themed roasts
    'Your trading strategy is just a frog repeatedly jumping into a bear trap.',
    'Even tadpoles have more patience than your market timing.',
    'Your portfolio is one bad trade away from croaking.',
    'Your trades leap straight into disaster—just like a frog into a blender.',
    'Your financial survival instincts are worse than a frog crossing a freeway.',
    'Your trades flop harder than a frog in a desert.',
    'Even swamp water is more stable than your portfolio.',
    'Ribbit ribbit—oh wait, that’s just the sound of your liquidity evaporating.',
    'If financial intelligence were a pond, you’d be a fish out of water.',
    'You hold assets like a frog holds a smartphone—cluelessly and about to drop them.',

    // Meme coin addiction
    'Your memecoin bags are just participation trophies for bad decisions.',
    'You treat memecoins like scratch-off tickets—except they never pay out.',
    'Your memecoin portfolio is basically a charity for early investors.',
    'You think buying dog-themed tokens makes you an investor? Adorable.',
    'Your memecoin collection is just proof that clown makeup is digital now.',
    'You bought that rug pull like it was a Supreme drop.',
    'Your portfolio is just a museum of bad memecoin ideas.',
    'You’re in so many dead projects even archaeologists are impressed.',
    'Your memecoins have more zeros than your job applications.',
    'You buy memecoins like boomers buy Beanie Babies.',

    // DeFi & NFT disasters
    "You call it 'DeFi strategy,' but it's really just a series of expensive mistakes.",
    'Your NFT bags are so heavy, they’re the reason gas fees are high.',
    "Your DeFi 'yields' are just losses rebranded as optimism.",
    'Your liquidity position has the depth of a sidewalk puddle.',
    'You’re not yield farming, you’re just speedrunning regret.',
    'Your NFTs are worth less than the air it takes to say their names.',
    'You collected NFTs like they were Pokémon cards—except you got all Magikarps.',
    'Your DeFi portfolio is a masterclass in creative ways to lose money.',
    'Your stablecoin strategy is neither stable nor a strategy.',
    'Your wallet is the graveyard for overhyped PFP projects.',

    // General crypto clownery
    'Your transaction history should be required reading at financial literacy classes— as a warning.',
    'Your net worth is just an elaborate game of ‘How Low Can You Go?’',
    'Even algorithmic stablecoins had better risk management than you.',
    'Your buy-ins are timed so badly, hedge funds might be tracking them as counter-indicators.',
    'Your ledger should come with a trigger warning.',
    'Your approach to crypto is like a toddler playing chess—clueless and constantly losing pieces.',
    'Your portfolio is living proof that diamond hands and brain cells are mutually exclusive.',
    'Your investments look like they were chosen by closing your eyes and pointing.',
    'The blockchain doesn’t forget, but it wishes it could forget your transactions.',
    'Your portfolio is a perfect example of why financial advisors exist.',

    // Harsh reality roasts
    'Your strategy isn’t ‘buy low, sell high,’ it’s ‘buy high, cry later.’',
    'Even your airdrops look disappointed to be in your wallet.',
    'Your NFT collection is the financial equivalent of hoarding Blockbuster DVDs.',
    'Your P&L chart looks like a slow-motion car crash.',
    'Your portfolio could be studied as an economic disaster simulator.',
  ]

  // Generate a truly random index based on current time + seed
  const seed = uniqueParams.seed || Date.now()
  const randomIndex = Math.floor(seed % allFallbackRoasts.length)

  // Pick a random roast from the flat array
  const roast = allFallbackRoasts[randomIndex]

  // Ensure all fallback roasts are processed through the same cleaning logic
  return betterCleanRoastText(roast.replace(/\n/g, ' ').replace(/\\/g, ''))
}
