import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Initialize dark mode based on user's preference or system setting
  useEffect(() => {
    // Check for saved preference
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else {
      // Check for system preference
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);
  
  // Update class on the document element when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <motion.button
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center focus:outline-none"
      onClick={() => setDarkMode(!darkMode)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        // Sun icon for light mode
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-yellow-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
          />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-gray-700" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
          />
        </svg>
      )}
    </motion.button>
  );
};

export default DarkModeToggle;
