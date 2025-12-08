import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-stone-800 text-stone-100 py-6 px-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-label="scroll">📜</span>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">PalmLeaf Restorer</h1>
            <p className="text-stone-400 text-sm">Ancient Wisdom, Modern Clarity</p>
          </div>
        </div>
        <div className="hidden sm:block text-stone-400 text-sm">
          <span>Preserving History with AI ✨</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
