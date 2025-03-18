"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
  text: string;
  isTyping?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  onTypingComplete?: () => void;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  isTyping = false,
  position = 'top',
  onTypingComplete
}) => {
  const [displayText, setDisplayText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Position styles for the speech bubble pointer
  const pointerStyles = {
    top: 'absolute h-4 w-4 bg-white transform rotate-45 -top-2 left-1/2 -ml-2',
    bottom: 'absolute h-4 w-4 bg-white transform rotate-45 -bottom-2 left-1/2 -ml-2',
    left: 'absolute h-4 w-4 bg-white transform rotate-45 top-1/2 -left-2 -mt-2',
    right: 'absolute h-4 w-4 bg-white transform rotate-45 top-1/2 -right-2 -mt-2',
  };

  // Animation variants for speech bubble
  const bubbleVariants = {
    hidden: { 
      opacity: 0, 
      y: position === 'top' ? -20 : position === 'bottom' ? 20 : 0,
      x: position === 'left' ? -20 : position === 'right' ? 20 : 0,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    typing: {
      scale: [1, 1.01, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  // Cursor animation variants
  const cursorVariants = {
    blink: {
      opacity: [0, 1, 0],
      transition: {
        repeat: Infinity,
        duration: 0.8
      }
    }
  };

  // Typing animation effect
  useEffect(() => {
    if (!isTyping) {
      setDisplayText(text);
      return;
    }

    // Reset when text changes
    if (currentIndex === 0) {
      setDisplayText('');
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 30); // Adjust speed of typing here

      return () => clearTimeout(timer);
    } else if (onTypingComplete) {
      onTypingComplete();
    }
  }, [text, currentIndex, isTyping, onTypingComplete]);

  // Reset index when text changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [text]);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="relative"
        key={text}
        initial="hidden"
        animate={isTyping ? ["visible", "typing"] : "visible"}
        exit="exit"
        variants={bubbleVariants}
      >
        <div className="p-4 bg-white rounded-xl shadow-md">
          <div className={pointerStyles[position]}></div>
          <p className="text-gray-800 whitespace-pre-line">
            {isTyping ? displayText : text}
            {isTyping && currentIndex < text.length && (
              <motion.span 
                variants={cursorVariants}
                animate="blink"
                className="inline-block ml-1"
              >
                |
              </motion.span>
            )}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpeechBubble;
