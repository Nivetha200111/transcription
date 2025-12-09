import React from 'react';
import { ManuscriptRecord, KolamType } from '../types';
import { AnimatedKolamMotif, AnimatedBorder } from './AnimatedKolam';

interface HistoryGalleryProps {
  history: ManuscriptRecord[];
  onSelect: (record: ManuscriptRecord) => void;
  onDelete: (id: number) => void;
  kolamType: KolamType;
}

const HistoryGallery: React.FC<HistoryGalleryProps> = ({ history, onSelect, onDelete, kolamType }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-16 sm:mt-20 mb-10 animate-fade-in relative">
      
      <div className="flex flex-col sm:flex-row items-center justify-center mb-8 sm:mb-10 relative gap-3 sm:gap-0">
        <div className="hidden sm:block h-px bg-amber-900/40 w-full absolute"></div>
        <div className="bg-[#2a1006] px-6 relative z-10 flex items-center gap-3">
          <AnimatedKolamMotif size={24} seed={1122} color="#b45309" type={kolamType} />
          <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-500/80 tracking-widest uppercase">Archive Library</h3>
          <span className="bg-amber-950 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-900/50">
            {history.length}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {history.map((record) => (
          <div key={record.id} className="h-full">
            <AnimatedBorder seed={record.timestamp || record.id || Math.random()} type={kolamType}>
                <div 
                    className="group relative bg-[#1a0b05] rounded-sm shadow-lg border border-amber-900/30 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                    {/* Thumbnail */}
                    <div 
                    className="aspect-[4/3] bg-[#0c0502] cursor-pointer relative overflow-hidden"
                    onClick={() => onSelect(record)}
                    >
                    <img 
                        src={record.originalImage} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a1006]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Overlay Indicators */}
                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        {record.restoredImage && (
                            <span className="bg-amber-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-[8px] shadow-sm border border-amber-900">R</span>
                        )}
                        {record.analysis && (
                            <span className="bg-[#4a2c1d] text-white w-5 h-5 flex items-center justify-center rounded-full text-[8px] shadow-sm border border-amber-900">A</span>
                        )}
                    </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-3 bg-[#1a0b05] flex justify-between items-center border-t border-amber-900/50 group-hover:bg-amber-950/40 transition-colors mt-auto">
                    <div className="flex flex-col">
                        <span className="text-xs font-serif font-bold text-amber-700 group-hover:text-amber-500 transition-colors">
                            {new Date(record.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-amber-900/60 font-mono">
                            {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (record.id) onDelete(record.id);
                        }}
                        className="text-amber-900/60 hover:text-red-400 hover:bg-red-950/20 p-1.5 rounded-full transition-colors font-bold text-xs"
                        title="Remove from archive"
                        >
                        ✕
                    </button>
                    </div>

                </div>
            </AnimatedBorder>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryGallery;