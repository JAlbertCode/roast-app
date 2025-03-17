"use client";

import React from 'react';
import { motion } from 'framer-motion';
import BetterSirCroaksworthSvg from './icons/BetterSirCroaksworthSvg';

interface SirCroaksworthProps {
  isRoasting: boolean;
  walletSize?: 'poor' | 'average' | 'wealthy';
}

const SirCroaksworth: React.FC<SirCroaksworthProps> = ({ 
  isRoasting = false,
  walletSize = 'average'
}) => {
  // Animation variants for different states
  const characterVariants = {
    idle: { 
      scale: 1,
      rotate: 0
    },
    roasting: { 
      scale: [1, 1.03, 1, 1.03, 1],
      transition: { 
        repeat: Infinity,
        duration: 1.5,
      }
    },
    wealthy: {
      scale: 1.05,
      y: [0, -5, 0],
      transition: { 
        repeat: Infinity,
        duration: 2 
      }
    },
    poor: {
      rotate: [-2, 2],
      x: [0, -2, 0, 2, 0],
      transition: { 
        repeat: Infinity,
        repeatType: "mirror",
        duration: 1.2
      }
    }
  };

  // Determine which animation to use
  const getAnimationState = () => {
    if (isRoasting) return 'roasting';
    if (walletSize === 'wealthy') return 'wealthy';
    if (walletSize === 'poor') return 'poor';
    return 'idle';
  };

  // Money bag animation for wealthy users
  const moneyBagVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { delay: 0.5 }
    },
    pulse: {
      scale: [1, 1.15, 1],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        repeat: Infinity,
        duration: 1.5
      }
    }
  };

  // Broke symbol animation for poor users
  const brokeVariants = {
    initial: { scale: 0, opacity: 0, rotate: -10 },
    animate: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: { delay: 0.5 }
    },
    float: {
      y: [0, -8, 0],
      rotate: [-5, 5, -5],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative">
      <motion.div 
        className="w-64 h-64 relative"
        variants={characterVariants}
        initial="idle"
        animate={getAnimationState()}
      >
        <BetterSirCroaksworthSvg className="w-full h-full" />
        
        {/* Money bags for wealthy users */}
        {walletSize === 'wealthy' && (
          <motion.div 
            className="absolute bottom-5 right-0 bg-yellow-400 p-3 rounded-full shadow-lg"
            variants={moneyBagVariants}
            initial="initial"
            animate={["animate", "pulse"]}
            aria-label="Money bag indicating wealthy wallet"
          >
            <span className="text-2xl">💰</span>
          </motion.div>
        )}
        
        {/* Broke symbol for poor users */}
        {walletSize === 'poor' && (
          <motion.div 
            className="absolute bottom-5 right-0 bg-red-400 p-3 rounded-full shadow-lg"
            variants={brokeVariants}
            initial="initial"
            animate={["animate", "float"]}
            aria-label="Empty wallet indicating poor wallet"
          >
            <span className="text-2xl">💸</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SirCroaksworth;
