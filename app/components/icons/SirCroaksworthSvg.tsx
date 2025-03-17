import React from 'react';

interface SirCroaksworthSvgProps {
  className?: string;
}

const SirCroaksworthSvg: React.FC<SirCroaksworthSvgProps> = ({ className = "" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 250 250"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="125" cy="125" r="120" fill="#1a472a" />
      <circle cx="125" cy="125" r="110" fill="#2a623d" />
      
      {/* Frog head */}
      <ellipse cx="125" cy="130" rx="85" ry="80" fill="#5dbb63" />
      
      {/* Eyes */}
      <circle cx="95" cy="100" r="20" fill="white" />
      <circle cx="155" cy="100" r="20" fill="white" />
      
      {/* Pupils */}
      <circle cx="95" cy="100" r="10" fill="black" />
      <circle cx="155" cy="100" r="10" fill="black" />
      
      {/* White eye shine */}
      <circle cx="90" cy="95" r="5" fill="white" />
      <circle cx="150" cy="95" r="5" fill="white" />
      
      {/* Monocle */}
      <circle cx="155" cy="100" r="25" fill="none" stroke="#ffd700" strokeWidth="3" />
      <line x1="155" y1="125" x2="155" y2="140" stroke="#ffd700" strokeWidth="3" />
      
      {/* Mouth */}
      <path
        d="M90,160 Q125,185 160,160"
        fill="none"
        stroke="#333"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Top hat */}
      <rect x="95" y="35" width="60" height="10" fill="black" />
      <rect x="105" y="15" width="40" height="30" fill="black" />
      <rect x="115" y="13" width="20" height="2" fill="#ffd700" />
      
      {/* Bow tie */}
      <path
        d="M125,165 L115,175 L105,165 L115,160 Z"
        fill="#ff0000"
      />
      <path
        d="M125,165 L135,175 L145,165 L135,160 Z"
        fill="#ff0000"
      />
      <circle cx="125" cy="165" r="3" fill="#ffd700" />
    </svg>
  );
};

export default SirCroaksworthSvg;
