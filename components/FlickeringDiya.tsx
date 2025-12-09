import React from 'react';

interface FlickeringDiyaProps {
  size?: number;
  className?: string;
}

export const FlickeringDiya: React.FC<FlickeringDiyaProps> = ({ size = 24, className = "" }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
       <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
          {/* Flame Glow (Halo) */}
          <circle cx="50" cy="25" r="20" fill="#fbbf24" className="animate-pulse opacity-30 blur-md" />
          
          {/* Main Flame */}
          <path 
            d="M 50,10 Q 70,45 50,55 Q 30,45 50,10 Z" 
            fill="#f59e0b" 
            className="animate-flicker"
          />
          {/* Inner Flame Core */}
          <path 
            d="M 50,20 Q 60,45 50,50 Q 40,45 50,20 Z" 
            fill="#fcd34d" 
            className="animate-flicker"
            style={{ animationDelay: '0.05s', transformOrigin: 'bottom center' }}
          />
          
          {/* Lamp Base (Clay Agal Vilakku shape) */}
          {/* Top rim */}
          <ellipse cx="50" cy="55" rx="35" ry="12" fill="#78350f" />
          <ellipse cx="50" cy="55" rx="30" ry="10" fill="#451a03" />
          
          {/* Wick */}
          <path d="M 48,55 L 52,55 L 50,48 Z" fill="#1c1917" />
          
          {/* Bottom body */}
          <path 
            d="M 15,55 Q 15,90 50,95 Q 85,90 85,55" 
            fill="#78350f" 
            stroke="#451a03" 
            strokeWidth="1"
          />
          
          {/* Decorative shine */}
          <path d="M 25,65 Q 35,75 25,85" stroke="#92400e" strokeWidth="2" fill="none" opacity="0.5" />
       </svg>
    </div>
  );
};
