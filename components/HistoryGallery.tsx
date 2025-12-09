import React from 'react';
import { ManuscriptRecord } from '../types';

interface HistoryGalleryProps {
  history: ManuscriptRecord[];
  onSelect: (record: ManuscriptRecord) => void;
  onDelete: (id: number) => void;
}

const HistoryGallery: React.FC<HistoryGalleryProps> = ({ history, onSelect, onDelete }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-16 mb-8 animate-fade-in border-t border-stone-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <h3 className="text-xl font-bold text-stone-800">Library History</h3>
        </div>
        <span className="bg-stone-100 text-stone-500 px-3 py-1 rounded-full text-xs font-medium">
          {history.length} items
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {history.map((record) => (
          <div 
            key={record.id} 
            className="group relative bg-white rounded-xl shadow-sm border border-stone-200 hover:shadow-lg hover:border-amber-300 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Thumbnail */}
            <div 
              className="aspect-[4/3] bg-stone-100 cursor-pointer relative overflow-hidden"
              onClick={() => onSelect(record)}
            >
              <img 
                src={record.originalImage} 
                alt="Thumbnail" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              
              {/* Overlay Indicators on Hover */}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                 {record.restoredImage && (
                    <span className="bg-white/90 text-stone-800 p-1 rounded-md text-[10px] shadow-sm" title="Has restored image">✨</span>
                 )}
                 {record.analysis && (
                    <span className="bg-white/90 text-stone-800 p-1 rounded-md text-[10px] shadow-sm" title="Has transcription">✍️</span>
                 )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-3 bg-white flex justify-between items-center border-t border-stone-100">
               <div className="flex flex-col">
                  <span className="text-xs font-semibold text-stone-700">
                    {new Date(record.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
               </div>
               
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (record.id) onDelete(record.id);
                  }}
                  className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
               </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryGallery;