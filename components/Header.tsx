import React from 'react';
import { AnimatedKolamMotif } from './AnimatedKolam';
import { KolamType } from '../types';

interface HeaderProps {
    kolamType: KolamType;
}

const Header: React.FC<HeaderProps> = ({ kolamType }) => {
  return (
    <header className="w-full pt-6 pb-2 px-4 text-center relative z-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        <div className="inline-block mb-4 relative cursor-default">
           {/* Generative Animated Icon */}
           <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
           <AnimatedKolamMotif 
             size={80} 
             seed={12345} 
             color="#f59e0b" 
             type={kolamType}
             className="relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
           />
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-amber-500 mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          PalmLeaf Restorer
        </h1>
        
        <p className="text-amber-200/70 font-serif italic text-sm sm:text-lg tracking-wide px-4 mb-4">
          Unveiling Ancient Wisdom, Preserving Tamil Heritage
        </p>

        {/* Decorative Separator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-2 opacity-80">
          <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-amber-600"></div>
          <AnimatedKolamMotif size={24} seed={55} color="#d97706" type={kolamType} />
          <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-amber-600"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
