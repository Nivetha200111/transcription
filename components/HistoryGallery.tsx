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
    <div className="w-full mt-24 mb-16 animate-fade-in relative border-t border-royal-900/20 pt-10">
      
      <div className="flex items-center gap-4 mb-8 px-2">
         <AnimatedKolamMotif size={28} seed={1122} color="#b45309" type={kolamType} />
         <h3 className="text-2xl font-serif font-bold text-royal-500 tracking-tight">Archive Library</h3>
         <span className="bg-heritage-800 text-royal-600 px-3 py-1 rounded-full text-xs font-bold border border-royal-900/30">
            {history.length}
         </span>
      </div>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {history.map((record) => (
          <div key={record.id} className="h-full">
            <AnimatedBorder seed={record.timestamp || record.id || Math.random()} type={kolamType}>
                <div 
                    className="group relative bg-heritage-900 rounded-lg shadow-lg border border-royal-900/30 hover:border-royal-500/50 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
                    onClick={() => onSelect(record)}
                >
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] bg-heritage-950 relative overflow-hidden">
                        <img 
                            src={record.originalImage} 
                            alt="Thumbnail" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" 
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-heritage-900 via-transparent to-transparent opacity-60" />
                        
                        {/* Overlay Badges */}
                        <div className="absolute bottom-2 right-2 flex gap-1 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            {record.restoredImage && (
                                <span className="bg-royal-600 text-heritage-950 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm">RESTORED</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-3 bg-heritage-900 flex justify-between items-center border-t border-royal-900/20 group-hover:bg-heritage-800 transition-colors mt-auto">
                        <div className="flex flex-col">
                            <span className="text-xs font-serif font-bold text-parchment-200 group-hover:text-royal-400 transition-colors">
                                {new Date(record.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-royal-800 font-mono">
                                {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (record.id) onDelete(record.id);
                            }}
                            className="text-royal-800 hover:text-red-400 p-2 hover:bg-red-900/10 rounded-full transition-colors"
                            title="Delete"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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