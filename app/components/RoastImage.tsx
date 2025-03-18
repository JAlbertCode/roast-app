'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetterSirCroaksworthSvg from './icons/BetterSirCroaksworthSvg';
import Image from 'next/image';

interface RoastImageProps {
  roast: string;
  walletCategory: 'poor' | 'average' | 'wealthy';
  transactionSummary: Record<string, unknown>;
  isVisible: boolean;
}

const RoastImage: React.FC<RoastImageProps> = ({ 
  roast,
  walletCategory,
  transactionSummary,
  isVisible
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Define generateImage as a useCallback to prevent dependency warnings
  const generateImage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roast,
          walletCategory,
          summary: transactionSummary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      if (data.image) {
        setImage(data.image);
      } else if (data.fallbackImage) {
        setImage(data.fallbackImage);
      } else {
        throw new Error('No image data received');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  }, [roast, walletCategory, transactionSummary]);

  useEffect(() => {
    // Only attempt to generate image if there's a roast and the component is visible
    if (roast && isVisible && !image && !isLoading) {
      generateImage();
    }
  }, [roast, isVisible, image, isLoading, generateImage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="w-full max-w-xs mx-auto mt-4 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="relative aspect-square rounded-md overflow-hidden border-4 border-green-600 shadow-xl">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
            </div>
          ) : image ? (
            // Using a regular img tag here instead of next/image for simplicity
            // This is acceptable for dynamically generated content
            <img 
              src={image} 
              alt="Sir Croaksworth's roast" 
              className="w-full h-full object-cover"
            />
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-32 h-32">
                <BetterSirCroaksworthSvg className="w-full h-full" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-32 h-32">
                <BetterSirCroaksworthSvg className="w-full h-full" />
              </div>
            </div>
          )}
          
          {/* Watermark for sharing */}
          <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            SirCroaksworth.xyz
          </div>
        </div>
        
        <p className="text-center text-xs mt-2 text-gray-500">
          {isLoading ? 'Generating image...' : 'Share this roast image with your tweet!'}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoastImage;