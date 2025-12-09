import React from 'react';
import { AnimatedKolamMotif } from './AnimatedKolam';
import { FlickeringDiya } from './FlickeringDiya';
import { KolamType } from '../types';

interface HeaderProps {
    kolamType: KolamType;
}

const Header: React.FC<HeaderProps> = ({ kolamType }) => {
  return (
    <header className="w-full pt-8 pb-6 px-4 text-center relative z-10 bg-gradient-to-b from-heritage-950 to-transparent">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        <div className="inline-block mb-2 relative cursor-default">
           <div className="absolute inset-0 bg-royal-500/20 blur-[40px] rounded-full opacity-60"></div>
           <FlickeringDiya 
             size={80} 
             className="relative z-10 drop-shadow-2xl text-[#d97706]"
           />
        </div>
        
        {/* 
            Tamil Typography Fixes:
            1. leading-[1.5]: Explicitly tall line-height to accommodate ascenders.
            2. pt-6 pb-4: Significant vertical padding ensures the gradient box covers the full glyph height.
            3. tracking-normal: Prevents ligature collision.
        */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-extrabold tracking-normal text-transparent bg-clip-text bg-gradient-to-br from-royal-300 via-royal-500 to-royal-700 mb-1 pt-6 pb-4 drop-shadow-sm leading-[1.5] px-2">
          தொல்நோக்கு
        </h1>
        
        <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-royal-800"></span>
            <p className="text-royal-200/60 font-serif italic text-lg sm:text-xl tracking-wide">
            Unveiling Ancient Wisdom, Preserving Tamil Heritage
            </p>
            <span className="h-px w-8 bg-royal-800"></span>
        </div>
      </div>
    </header>
  );
};

export default Header;