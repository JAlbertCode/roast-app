          {/* Roast selector - only show if multiple roasts are generated */}
          {roasts.length > 0 && !isRoasting && (
            <div className="mt-4 flex flex-col items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Choose your favorite roast:</p>
              <div className="flex space-x-2">
                {roasts.map((_, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${selectedRoastIndex === index ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => handleRoastSelection(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SirCroaksworth from './components/SirCroaksworth';
import SpeechBubble from './components/SpeechBubble';
import DarkModeToggle from './components/DarkModeToggle';
import { TransactionSummary } from './utils/etherscanService';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isRoasting, setIsRoasting] = useState<boolean>(false);
  const [roastText, setRoastText] = useState<string>("Ribbit! Paste your wallet address and I'll roast your financial decisions like they're flies on a lily pad!");
  const [roasts, setRoasts] = useState<string[]>([]);
  const [selectedRoastIndex, setSelectedRoastIndex] = useState<number>(0);
  const [walletSize, setWalletSize] = useState<'poor' | 'average' | 'wealthy'>('average');
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoastClick = async () => {
    // Reset any previous errors
    setError(null);
    
    // Validate wallet address
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setRoastText("That doesn't look like a valid wallet address! Are you trying to hide your poor financial decisions from me?");
      return;
    }

    // Start the roasting process
    setIsRoasting(true);
    setRoastText("Hmm, let me check your transactions across all blockchains... *ribbit*");

    try {
      // Call our multi-chain API endpoint
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generating roast');
      }

      const data = await response.json();
      
      // Reset selected roast index
      setSelectedRoastIndex(0);
      
      // Update state with the roasts and wallet category
      setRoasts(data.roasts);
      setRoastText(data.roasts[0]); // Display the first roast initially
      setWalletSize(data.walletCategory);
      setTransactionSummary(data.summary);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate roast. Try again later.');
      setRoastText("Ribbit! Something went wrong while analyzing your wallet. My lily pad connection seems to be unstable.");
    } finally {
      setIsRoasting(false);
    }
  };

  const handleRoastSelection = (index: number) => {
    if (index >= 0 && index < roasts.length) {
      setSelectedRoastIndex(index);
      setRoastText(roasts[index]);
    }
  };

  const handleTweetClick = () => {
    // Make sure we have a roast to share
    if (!roastText || roastText === "Ribbit! Paste your wallet address and I'll roast your financial decisions like they're flies on a lily pad!") {
      return;
    }
    
    // Prepare the tweet text
    const tweetText = `I just got my wallet roasted by Sir Croaksworth: "${roastText}" ${window.location.origin}\n\n#Lilypad #Roasted`;
    
    // Open Twitter intent URL
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };

  // Animation variants
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 sm:p-8 bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <header className="w-full max-w-4xl mb-6 sm:mb-8 mt-6 sm:mt-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-800 dark:text-green-400">Sir Croaksworth&apos;s Roast DApp</h1>
          <DarkModeToggle />
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 text-center sm:text-left">
          Get your wallet transactions roasted by the most savage frog banker on the blockchain
        </p>
      </header>
      
      <main className="flex flex-col items-center w-full max-w-3xl">
        <div className="mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-72 h-72 sm:w-80 sm:h-80"
          >
            <SirCroaksworth isRoasting={isRoasting} walletSize={walletSize} />
          </motion.div>
        </div>
        
        <div className="w-full max-w-xl mb-6 sm:mb-8">
          <SpeechBubble 
            text={roastText} 
            isTyping={isRoasting}
            position="top"
          />
          
          {/* Roast selector - only show if multiple roasts are generated */}
          {roasts.length > 0 && !isRoasting && (
            <div className="mt-4 flex flex-col items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Choose your favorite roast:</p>
              <div className="flex space-x-2">
                {roasts.map((_, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${selectedRoastIndex === index ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => handleRoastSelection(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Twitter share button (only show if a roast has been generated) */}
          {roastText && !isRoasting && roastText !== "Ribbit! Paste your wallet address and I'll roast your financial decisions like they're flies on a lily pad!" && (
            <div className="flex justify-center mt-4">
              <motion.button 
                className="bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-md transition duration-200 flex items-center gap-2 shadow-md"
                onClick={handleTweetClick}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
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
              className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
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
              whileHover={!isRoasting ? "hover" : undefined}
              whileTap={!isRoasting ? "tap" : undefined}
              suppressHydrationWarning
            >
              {isRoasting ? 'Analyzing all chains...' : 'Roast Me!'}
            </motion.button>
          </div>
        </div>
      </main>
      
      <footer className="mt-auto py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Powered by Lilypad Network and Anura API</p>
      </footer>
    </div>
  );
}
