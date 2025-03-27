'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SirCroaksworth from './components/SirCroaksworth'
import SpeechBubble from './components/SpeechBubble'
import SocialLinks from './components/SocialLinks'
// import { TransactionSummary } from './utils/etherscanService';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isRoasting, setIsRoasting] = useState<boolean>(false)
  const [roastText, setRoastText] = useState<string>(
    "I'm Sir Croaksworth, a financial analyst with impeccable taste. Show me your wallet, and I'll show you just how bad your decisions are."
  )
  const [roasts, setRoasts] = useState<string[]>([])
  const [selectedRoastIndex, setSelectedRoastIndex] = useState<number>(0)
  const [walletSize, setWalletSize] = useState<'poor' | 'average' | 'wealthy'>(
    'average'
  )
  // const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null);
  const [error, setError] = useState<string | null>(null)
  const [progressCounter, setProgressCounter] = useState<number>(0)
  const [loadingStage, setLoadingStage] = useState<number>(0)
  const [useOptimizeMode, setUseOptimizeMode] = useState<boolean>(false)

  // Remove development tools
  useEffect(() => {
    // Function to remove development tools
    const removeDevTools = () => {
      const devTools = document.querySelectorAll(
        '#__next-build-watcher, .__next-build-watcher, #nextjs-portal, #__next-portal-root, ' +
          '#__turbopack-root, #react-refresh-proxy-container, .Toastify, .__react-dev-overlay, ' +
          '.__web-inspector-hide-longpress-gesture, .__turbopack-error-overlay, [data-nextjs-portal], ' +
          '[data-nextjs-toast]'
      )

      devTools.forEach((el) => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
    }

    // Run immediately
    removeDevTools()

    // Set up interval to periodically check and remove
    const interval = setInterval(removeDevTools, 1000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])
  
  // Update loading message based on how long we've been waiting
  useEffect(() => {
    if (isRoasting) {
      if (progressCounter > 25) {
        setLoadingStage(3)
      } else if (progressCounter > 15) {
        setLoadingStage(2)
      } else if (progressCounter > 5) {
        setLoadingStage(1)
      }
    } else {
      setLoadingStage(0)
    }
  }, [progressCounter, isRoasting])

  // Update the loading message based on stage
  useEffect(() => {
    if (isRoasting) {
      if (loadingStage === 1) {
        setRoastText('Still analyzing your transactions. Your investment choices are... interesting.')
      } else if (loadingStage === 2) {
        setRoastText('Processing the full extent of your financial missteps. Almost ready with your evaluation.')
      } else if (loadingStage === 3) {
        setRoastText("Your wallet is taking longer to assess than most. That's rarely a good sign.")
      }
    }
  }, [loadingStage, isRoasting])

  const handleRoastClick = async () => {
    // Reset any previous errors
    setError(null)

    // Validate wallet address
    if (
      !walletAddress ||
      !walletAddress.startsWith('0x') ||
      walletAddress.length !== 42
    ) {
      setRoastText(
        "That's not a valid wallet address! Are you trying to hide your financial incompetence from me?"
      )
      return
    }

    // Start the roasting process
    setIsRoasting(true)
    setRoastText(
      'Let me check your transaction history. This should be... amusing.'
    )
    
    // Reset progress counter and start incrementing it
    setProgressCounter(0)
    setLoadingStage(0)
    const progressInterval = setInterval(() => {
      setProgressCounter(prev => prev + 1)
    }, 1000)

    try {
      // Call our enhanced API endpoint that uses the 60-second timeout
      console.log('Calling roast-pro endpoint with extended timeout...')
      
      // Set up an AbortController with a timeout slightly longer than Vercel's limit
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 65000) // 65 seconds
      
      try {
        const response = await fetch('/api/roast', {  // Using standard endpoint instead of roast-pro
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            walletAddress,
            fastMode: useOptimizeMode // Pass the fast mode parameter
          }),
          signal: controller.signal
        })

        // Clear the timeout since we got a response
        clearTimeout(timeoutId)

        if (!response.ok) {
          // If we get a 504 specifically, it's a timeout
          if (response.status === 504) {
            throw new Error('The request timed out. Vercel has a 60-second limit for API responses.')
          }
          
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error generating roast')
        }

        const data = await response.json()
        console.log('Roast generated successfully in', data.processingTime, 'seconds')

        // Reset selected roast index
        setSelectedRoastIndex(0)

        // Update state with the roasts and wallet category
        setRoasts(data.roasts || [])
        if (data.roasts && data.roasts.length > 0) {
          setRoastText(data.roasts[0])
        }
        setWalletSize(data.walletCategory || 'average')
      } catch (fetchErr) {
        // Check if this was an abort error (timeout)
        const fetchError = fetchErr as Error;
        if ((fetchError instanceof DOMException && fetchError.name === 'AbortError') ||
            (fetchError.name === 'AbortError')) {
          throw new Error('The request timed out after 65 seconds. Try a different wallet with fewer transactions.')
        }
        throw fetchError
      }
    } catch (err) {
      const error = err as Error
      console.error('Error:', error)
      
      // If the request failed due to timeout or complexity and we're not already in Fast Mode,
      // automatically retry with Fast Mode
      if ((error.message.includes('timed out') || error.message.includes('too long to process')) && !useOptimizeMode) {
        console.log('Automatically retrying with Fast Mode...')
        setError(null) // Clear the error
        setUseOptimizeMode(true) // Enable Fast Mode
        setRoastText('That wallet has a lot of activity. Let me try with a faster approach...') // Update UI
        
        // Wait a moment before retrying to let the user see the message
        setTimeout(() => {
          handleRoastClick() // Retry the roast with Fast Mode enabled
        }, 1500)
        return // Exit early to prevent showing error message
      }
      
      // Handle errors that occur even with Fast Mode
      if (error.message.includes('timed out')) {
        setError('The request took too long to process. This can happen with complex wallets. Try a wallet with fewer transactions.')
        setRoastText(
          "This wallet has too many transactions for me to process. Try a simpler wallet or one with fewer transactions."
        )
      } else {
        // Set a user-friendly error message for other errors
        setError(
          error.message && error.message.includes('JSON')
            ? 'Network error communicating with Anura API. Please try again later.'
            : error.message || 'Failed to generate roast. Try again later.'
        )
        setRoastText(
          "My connections to the blockchain appear to be offline. Even your wallet isn't worth this much trouble."
        )
      }
    } finally {
      setIsRoasting(false)
      clearInterval(progressInterval)
    }
  }

  const handleRoastSelection = (index: number) => {
    if (index >= 0 && index < roasts.length) {
      setSelectedRoastIndex(index)
      setRoastText(roasts[index])
    }
  }

  const handleTweetClick = () => {
    // Make sure we have a roast to share
    if (
      !roastText ||
      roastText ===
        "I'm Sir Croaksworth, a financial analyst with impeccable taste. Show me your wallet, and I'll show you just how bad your decisions are."
    ) {
      return
    }

    // Prepare the tweet text
    const tweetText = `I just got my wallet roasted by Sir Croaksworth: "${roastText}" ${window.location.origin}\n\n@Lilypad_Tech #Roasted`

    // Open Twitter intent URL
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank'
    )
  }

  // Animation variants
  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 sm:p-8 bg-gradient-to-b from-green-50 to-blue-50">
      <header className="w-full max-w-4xl mb-6 sm:mb-8 mt-6 sm:mt-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-800">
            Sir Croaksworth&apos;s Roast DApp
          </h1>
        </div>
        <p className="text-base sm:text-lg text-gray-600 text-center sm:text-left">
          Get your wallet transactions roasted by the most pretentious banker on
          the blockchain
        </p>
      </header>

      <main className="flex flex-col items-center w-full max-w-3xl">
        <div className="mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-72 h-72 sm:w-80 sm:h-80"
          >
            <SirCroaksworth isRoasting={isRoasting} walletSize={walletSize} />
          </motion.div>
        </div>

        <div className="w-full max-w-xl mb-6 sm:mb-8">
          <SpeechBubble text={roastText} isTyping={isRoasting} position="top" />

          {/* Progress bar when roasting */}
          {isRoasting && (
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(progressCounter * 2, 95)}%` }}
              ></div>
            </div>
          )}

          {/* Roast selector - only show if multiple roasts are generated */}
          {roasts.length > 0 && !isRoasting && (
            <div className="mt-4 flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-2">
                Choose your favorite roast:
              </p>
              <div className="flex space-x-2">
                {roasts.map((_, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                      selectedRoastIndex === index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => handleRoastSelection(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Twitter share button and roast image (only show if a roast has been generated) */}
          {roastText &&
            !isRoasting &&
            roastText !==
              "I'm Sir Croaksworth, a financial analyst with impeccable taste. Show me your wallet, and I'll show you just how bad your decisions are." && (
              <div className="flex justify-center mt-4">
                <motion.button
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md transition duration-200 flex items-center gap-2 shadow-md"
                  onClick={handleTweetClick}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <span className="mr-1">🐸</span> Share my Roast
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </motion.button>
              </div>
            )}
        </div>

        {error && (
          <div className="w-full max-w-xl mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="w-full max-w-xl mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Paste your wallet address (0x...) - We'll check all chains"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              disabled={isRoasting}
              suppressHydrationWarning
            />
            <motion.button
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md transition duration-200 sm:flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRoastClick}
              disabled={isRoasting}
              variants={buttonVariants}
              whileHover={!isRoasting ? 'hover' : undefined}
              whileTap={!isRoasting ? 'tap' : undefined}
              suppressHydrationWarning
            >
              {isRoasting ? 'Analyzing all chains...' : 'Roast Me!'}
            </motion.button>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-6 text-center text-gray-500 text-sm border-t border-gray-200 w-full max-w-4xl mx-auto">
        <p className="mb-3">Powered by Lilypad Network and Anura API</p>
        <SocialLinks />
      </footer>
    </div>
  )
}
