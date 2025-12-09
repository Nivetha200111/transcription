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

  // Generate a new unique pattern whenever the uploader resets
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
      
      {/* Decorative backing for the frame */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-900/40 via-yellow-900/40 to-amber-900/40 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
      
      <AnimatedBorder seed={seed + 12345} type={kolamType}>
        <label 
            className={`
            relative flex flex-col items-center justify-center w-full h-72 
            border-[3px] border-dashed rounded-lg cursor-pointer 
            transition-all duration-300 overflow-hidden bg-amber-950/40 backdrop-blur-sm
            ${isLoading 
                ? 'border-amber-900/50 cursor-not-allowed opacity-80' 
                : 'border-amber-800/60 hover:border-amber-500/60 hover:bg-amber-950/60 hover:shadow-2xl hover:shadow-amber-900/30'
            }
            `}
        >
            {/* Animated Corner Decorations */}
            <div className="absolute top-2 left-2"><AnimatedKolamMotif size={32} seed={seed} color="#92400e" type={kolamType} /></div>
            <div className="absolute top-2 right-2"><AnimatedKolamMotif size={32} seed={seed + 1} color="#92400e" type={kolamType} /></div>
            <div className="absolute bottom-2 left-2"><AnimatedKolamMotif size={32} seed={seed + 2} color="#92400e" type={kolamType} /></div>
            <div className="absolute bottom-2 right-2"><AnimatedKolamMotif size={32} seed={seed + 3} color="#92400e" type={kolamType} /></div>

            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-amber-200/60 z-10">
            {isLoading ? (
                <>
                <div className="mb-4 relative flex items-center justify-center">
                    {/* Replaced spinner with loading animation */}
                    <AnimatedKolamMotif size={64} seed={999} color="#f59e0b" type={kolamType} loading={true} />
                </div>
                <p className="text-lg font-serif text-amber-500">Consulting the archives...</p>
                </>
            ) : (
                <>
                <div className="mb-6 opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {/* Large Generative Motif */}
                    <AnimatedKolamMotif size={90} seed={seed + 100} color="#fcd34d" type={kolamType} />
                </div>
                <p className="mb-2 text-xl font-serif font-bold text-amber-100/90 tracking-wide group-hover:text-amber-400 transition-colors">Upload Manuscript Scan</p>
                <p className="text-sm text-amber-200/50 font-serif italic">Supported formats: JPG, PNG</p>
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