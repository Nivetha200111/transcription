import React, { useCallback, useState, useEffect } from 'react';
import { AnimatedKolamMotif, AnimatedBorder } from './AnimatedKolam';
import { KolamType } from '../types';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
  kolamType: KolamType;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading, kolamType }) => {
  const [seed, setSeed] = useState(Date.now());

  useEffect(() => {
    if (!isLoading) {
        setSeed(Date.now());
    }
  }, [isLoading]);
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  }, [onImageSelected]);

  return (
    <div className="w-full max-w-xl mx-auto mb-12 relative group perspective-1000">
      
      {/* Glow Effect behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-royal-900/0 via-royal-600/20 to-royal-900/0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
      
      <AnimatedBorder seed={seed + 12345} type={kolamType}>
        <label 
            className={`
            relative flex flex-col items-center justify-center w-full h-80 
            border-[3px] border-dashed rounded-xl cursor-pointer 
            transition-all duration-500 overflow-hidden bg-heritage-900/80 backdrop-blur-sm
            group-hover:translate-y-[-4px] group-hover:shadow-2xl
            ${isLoading 
                ? 'border-royal-900/30 cursor-not-allowed opacity-80' 
                : 'border-royal-800/40 group-hover:border-royal-500/60 group-hover:bg-heritage-800'
            }
            `}
        >
            {/* Corner Motifs */}
            <div className="absolute top-3 left-3 opacity-50 group-hover:opacity-100 transition-opacity"><AnimatedKolamMotif size={28} seed={seed} color="#b45309" type={kolamType} /></div>
            <div className="absolute top-3 right-3 opacity-50 group-hover:opacity-100 transition-opacity"><AnimatedKolamMotif size={28} seed={seed + 1} color="#b45309" type={kolamType} /></div>
            <div className="absolute bottom-3 left-3 opacity-50 group-hover:opacity-100 transition-opacity"><AnimatedKolamMotif size={28} seed={seed + 2} color="#b45309" type={kolamType} /></div>
            <div className="absolute bottom-3 right-3 opacity-50 group-hover:opacity-100 transition-opacity"><AnimatedKolamMotif size={28} seed={seed + 3} color="#b45309" type={kolamType} /></div>

            <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10 text-center px-4">
            {isLoading ? (
                <>
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-royal-500/20 blur-xl rounded-full animate-pulse"></div>
                    <AnimatedKolamMotif size={72} seed={999} color="#fbbf24" type={kolamType} loading={true} />
                </div>
                <p className="text-xl font-serif text-royal-400 font-bold tracking-wide">Consulting the Archives</p>
                <p className="text-sm font-serif text-royal-700 mt-2">Deciphering ancient ink...</p>
                </>
            ) : (
                <>
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500 relative">
                     <div className="absolute inset-0 bg-royal-400/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                     <AnimatedKolamMotif size={96} seed={seed + 100} color="#d97706" type={kolamType} />
                </div>
                <p className="mb-2 text-2xl font-serif font-bold text-parchment-100 group-hover:text-royal-300 transition-colors">
                    Upload Manuscript Scan
                </p>
                <p className="text-sm text-parchment-300/60 font-serif italic mb-6">
                    Support for high-resolution JPG & PNG
                </p>
                <div className="px-6 py-2 rounded-full border border-royal-700/50 text-royal-600 text-xs font-bold uppercase tracking-widest group-hover:bg-royal-600 group-hover:text-heritage-950 transition-all">
                    Select File
                </div>
                </>
            )}
            </div>
            <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            />
        </label>
      </AnimatedBorder>
    </div>
  );
};

export default ImageUploader;