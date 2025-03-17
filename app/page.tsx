'use client';

import { useState } from 'react';
import SirCroaksworth from './components/SirCroaksworth';
import SpeechBubble from './components/SpeechBubble';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isRoasting, setIsRoasting] = useState<boolean>(false);
  const [roastText, setRoastText] = useState<string>("Ribbit! Paste your wallet address and I'll roast your financial decisions like they're flies on a lily pad!");
  const [walletSize, setWalletSize] = useState<'poor' | 'average' | 'wealthy'>('average');

  const handleRoastClick = async () => {
    // Validate wallet address
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setRoastText("That doesn't look like a valid wallet address! Are you trying to hide your poor financial decisions from me?");
      return;
    }

    // Simulate roasting process
    setIsRoasting(true);
    setRoastText("Hmm, let me check your transactions... *ribbit*");

    // In a real implementation, we would:
    // 1. Fetch transactions from Etherscan API
    // 2. Process the data
    // 3. Send to Anura API
    // 4. Display the result

    // For now, just simulate a delay and random response
    setTimeout(() => {
      // Example roast texts
      const roasts = [
        `Oh my! Your wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} is sadder than a tadpole in a dried-up pond! You bought high and sold low so many times, I'm considering offering you a job as my financial advisor... for my enemies!`,
        `The only thing more pathetic than your NFT purchases is your attempt to hide them. Those JPEGs aren't "investments," they're digital confessions of poor judgment!`,
        `You've been holding onto those altcoins longer than I've been a frog! At least lily pads serve a purpose... what's your excuse?`
      ];
      
      const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
      setRoastText(randomRoast);
      
      // Randomly set wallet size for demonstration
      const sizes: Array<'poor' | 'average' | 'wealthy'> = ['poor', 'average', 'wealthy'];
      setWalletSize(sizes[Math.floor(Math.random() * sizes.length)]);
      
      setIsRoasting(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <header className="w-full max-w-4xl text-center mb-8 mt-10">
        <h1 className="text-4xl font-bold text-green-800 dark:text-green-400">Sir Croaksworth&apos;s Roast DApp</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
          Get your wallet transactions roasted by the most savage frog banker on the blockchain
        </p>
      </header>
      
      <main className="flex flex-col items-center w-full max-w-3xl">
        <div className="mb-6">
          <SirCroaksworth isRoasting={isRoasting} walletSize={walletSize} />
        </div>
        
        <div className="w-full max-w-xl mb-8">
          <SpeechBubble 
            text={roastText} 
            isTyping={isRoasting}
            position="top"
          />
        </div>
        
        <div className="w-full max-w-xl mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Paste your wallet address (0x...)" 
              className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <button 
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md transition duration-200 sm:flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRoastClick}
              disabled={isRoasting}
            >
              {isRoasting ? 'Roasting...' : 'Roast Me!'}
            </button>
          </div>
        </div>
        
        {/* Twitter share button (hidden until a roast is generated) */}
        {roastText && !isRoasting && roastText !== "Ribbit! Paste your wallet address and I'll roast your financial decisions like they're flies on a lily pad!" && (
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200 flex items-center gap-2"
            onClick={() => {
              const tweetText = `I just got my wallet roasted by Sir Croaksworth: "${roastText.slice(0, 180)}..." ${window.location.origin}\n\n#Lilypad #Roasted`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.002 10.002 0 01-3.127 1.195c-.897-.957-2.178-1.555-3.594-1.555-2.719 0-4.925 2.206-4.925 4.926 0 .386.044.762.127 1.122-4.092-.207-7.72-2.165-10.148-5.145a4.93 4.93 0 00-.667 2.475c0 1.71.87 3.213 2.188 4.096a4.936 4.936 0 01-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827a4.964 4.964 0 01-2.223.085c.627 1.956 2.445 3.38 4.6 3.42-1.685 1.32-3.808 2.108-6.115 2.108-.398 0-.79-.023-1.175-.068a14.011 14.011 0 007.548 2.212c9.057 0 14.009-7.503 14.009-14.01 0-.213-.005-.425-.014-.636a10.003 10.003 0 002.455-2.55z" />
            </svg>
            Tweet this roast
          </button>
        )}
      </main>
      
      <footer className="mt-auto py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Powered by Lilypad Network and Anura API</p>
      </footer>
    </div>
  );
}
