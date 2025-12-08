import React, { useCallback } from 'react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  }, [onImageSelected]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <label 
        className={`
          flex flex-col items-center justify-center w-full h-64 
          border-4 border-dashed rounded-xl cursor-pointer 
          transition-colors duration-200
          ${isLoading 
            ? 'bg-stone-100 border-stone-300 cursor-not-allowed opacity-50' 
            : 'bg-white border-stone-300 hover:bg-stone-50 hover:border-amber-500'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-stone-600">
          {isLoading ? (
            <>
              <span className="text-5xl mb-4 animate-spin">⏳</span>
              <p className="text-lg font-medium">Processing manuscript...</p>
            </>
          ) : (
            <>
              <span className="text-5xl mb-4">📤</span>
              <p className="mb-2 text-xl font-medium">Click to upload manuscript scan</p>
              <p className="text-sm text-stone-400">JPG, PNG supported</p>
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
    </div>
  );
};

export default ImageUploader;
