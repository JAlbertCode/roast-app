"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
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
  const characterVariants: Variants = {
    idle: { 
      scale: 1,
      rotate: 0
    },
    roasting: { 
      scale: [1, 1.03, 1, 1.03, 1],
      transition: { 
        repeat: Infinity,
        duration: 1.5
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
        repeatType: "mirror" as const,  // Use 'as const' to specify exact literal type
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


  return (
    <div className="relative">
      <motion.div 
        className="w-64 h-64 relative"
        variants={characterVariants}
        initial="idle"
        animate={getAnimationState()}
      >
        <BetterSirCroaksworthSvg className="w-full h-full" />
      </motion.div>
    </div>
  );
};

export default SirCroaksworth;
