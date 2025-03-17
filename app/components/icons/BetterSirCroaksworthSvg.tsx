import React from 'react';

interface SirCroaksworthSvgProps {
  className?: string;
}

const BetterSirCroaksworthSvg: React.FC<SirCroaksworthSvgProps> = ({ className = "" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="200" cy="200" r="190" fill="#1E583B" />
      
      {/* Body */}
      <ellipse cx="200" cy="220" rx="150" ry="140" fill="#4CAF50" />
      
      {/* Belly */}
      <ellipse cx="200" cy="240" rx="100" ry="90" fill="#8BC34A" />
      
      {/* Head & Face */}
      <g id="face">
        {/* Head */}
        <ellipse cx="200" cy="170" rx="130" ry="120" fill="#4CAF50" />
        
        {/* Eyes */}
        <g id="eyes">
          {/* Eye Whites */}
          <ellipse cx="155" cy="140" rx="30" ry="40" fill="white" />
          <ellipse cx="245" cy="140" rx="30" ry="40" fill="white" />
          
          {/* Eye Lids */}
          <path d="M125 130 Q155 110 185 130" fill="none" stroke="#2E7D32" strokeWidth="4" />
          <path d="M215 130 Q245 110 275 130" fill="none" stroke="#2E7D32" strokeWidth="4" />
          
          {/* Pupils */}
          <g id="pupils">
            <ellipse cx="155" cy="145" rx="12" ry="22" fill="#111" />
            <ellipse cx="245" cy="145" rx="12" ry="22" fill="#111" />
            
            {/* Eye Gleam */}
            <circle cx="160" cy="138" r="5" fill="white" />
            <circle cx="250" cy="138" r="5" fill="white" />
          </g>
        </g>
        
        {/* Monocle */}
        <g id="monocle">
          <circle cx="245" cy="145" r="35" fill="none" stroke="#DAA520" strokeWidth="4" />
          <line x1="245" y1="180" x2="245" y2="200" stroke="#DAA520" strokeWidth="3" />
          <circle cx="245" cy="200" r="5" fill="#DAA520" />
        </g>
        
        {/* Mouth */}
        <path d="M140 200 Q200 240 260 200" fill="#388E3C" />
        <path d="M140 200 Q200 220 260 200" fill="none" stroke="#2E7D32" strokeWidth="4" />
        
        {/* Nose/Nostrils */}
        <ellipse cx="175" cy="180" rx="10" ry="5" fill="#2E7D32" />
        <ellipse cx="225" cy="180" rx="10" ry="5" fill="#2E7D32" />
      </g>
      
      {/* Top Hat */}
      <g id="hat">
        <rect x="140" y="60" width="120" height="20" fill="#111" />
        <rect x="160" y="20" width="80" height="40" fill="#111" />
        <rect x="160" y="15" width="80" height="5" fill="#DAA520" />
      </g>
      
      {/* Bowtie */}
      <g id="bowtie">
        <path d="M170 260 L160 270 L150 260 L160 250 Z" fill="#f44336" />
        <path d="M230 260 L240 270 L250 260 L240 250 Z" fill="#f44336" />
        <circle cx="200" cy="260" r="10" fill="#DAA520" />
      </g>
      
      {/* Suit Jacket Outline */}
      <path d="M120 260 Q130 300 170 330 Q200 340 230 330 Q270 300 280 260" 
            fill="none" stroke="#111" strokeWidth="5" />
            
      {/* Banker Accessories */}
      <g id="accessories">
        {/* Money Bag */}
        <path d="M300 320 Q320 300 315 280 Q310 260 290 255 Q270 250 260 270 Q250 290 270 310 Q290 330 300 320 Z" 
              fill="#DAA520" stroke="#111" strokeWidth="2" />
        <text x="275" y="290" fontSize="20" fontWeight="bold" fill="#111" textAnchor="middle">$</text>
      </g>
    </svg>
  );
};

export default BetterSirCroaksworthSvg;
