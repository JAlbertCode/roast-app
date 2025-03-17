import React from 'react';
import Image from 'next/image';

interface SirCroaksworthProps {
  isRoasting: boolean;
  walletSize?: 'poor' | 'average' | 'wealthy';
}

const SirCroaksworth: React.FC<SirCroaksworthProps> = ({ 
  isRoasting = false,
  walletSize = 'average'
}) => {
  // Different states for Sir Croaksworth based on his activity and the wallet size
  const getStateClass = () => {
    if (isRoasting) {
      return 'animate-bounce';
    }
    if (walletSize === 'wealthy') {
      return 'animate-pulse';
    }
    if (walletSize === 'poor') {
      return 'animate-spin-slow';
    }
    return '';
  };

  return (
    <div className={`relative ${getStateClass()}`}>
      {/* This is a placeholder - we'll need to create/acquire the actual image */}
      <div className="w-64 h-64 bg-green-200 dark:bg-green-900 rounded-full flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-green-800 dark:text-green-300 font-bold">Sir Croaksworth</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Image Coming Soon</p>
          </div>
        </div>
        
        {/* Money bags for wealthy users */}
        {walletSize === 'wealthy' && (
          <div className="absolute bottom-2 right-2 bg-yellow-400 p-2 rounded-full animate-pulse">
            💰
          </div>
        )}
        
        {/* Broke symbol for poor users */}
        {walletSize === 'poor' && (
          <div className="absolute bottom-2 right-2 bg-red-400 p-2 rounded-full">
            💸
          </div>
        )}
      </div>
    </div>
  );
};

export default SirCroaksworth;
