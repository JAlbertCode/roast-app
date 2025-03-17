import React from 'react';
import { motion } from 'framer-motion';
import SirCroaksworthSvg from './icons/SirCroaksworthSvg';

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
      scale: [1, 1.05, 1, 1.05, 1],
      transition: { 
        repeat: Infinity,
        duration: 1,
      }
    },
    wealthy: {
      scale: 1.05,
      transition: { 
        yoyo: Infinity,
        duration: 1.5 
      }
    },
    poor: {
      rotate: [-2, 2],
      transition: { 
        repeat: Infinity,
        repeatType: "reverse",
        duration: 0.8
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
      scale: [1, 1.1, 1],
      transition: {
        repeat: Infinity,
        duration: 1
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
      y: [0, -5, 0],
      rotate: [-5, 5, -5],
      transition: {
        repeat: Infinity,
        duration: 2
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
        <SirCroaksworthSvg className="w-full h-full" />
        
        {/* Money bags for wealthy users */}
        {walletSize === 'wealthy' && (
          <motion.div 
            className="absolute bottom-2 right-2 bg-yellow-400 p-2 rounded-full"
            variants={moneyBagVariants}
            initial="initial"
            animate={["animate", "pulse"]}
          >
            💰
          </motion.div>
        )}
        
        {/* Broke symbol for poor users */}
        {walletSize === 'poor' && (
          <motion.div 
            className="absolute bottom-2 right-2 bg-red-400 p-2 rounded-full"
            variants={brokeVariants}
            initial="initial"
            animate={["animate", "float"]}
          >
            💸
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SirCroaksworth;
