import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import { restoreManuscriptImage, analyzeManuscriptText, fileToBase64 } from './services/geminiService';
import { ManuscriptAnalysis, ProcessingState } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ManuscriptAnalysis | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isRestoring: false,
    isAnalyzing: false,
    error: null,
  });

  const handleImageSelected = async (file: File) => {
    // Reset state
    setOriginalImage(null);
    setRestoredImage(null);
    setAnalysis(null);
    setProcessingState({ isRestoring: true, isAnalyzing: true, error: null });

    try {
      const base64Data = await fileToBase64(file);
      const fullBase64 = `data:${file.type};base64,${base64Data}`;
      setOriginalImage(fullBase64);

      // We trigger both processes in parallel but handle them independently so UI updates progressively
      
      // 1. Image Restoration
      restoreManuscriptImage(base64Data, file.type)
        .then((restored) => {
          setRestoredImage(restored);
          setProcessingState(prev => ({ ...prev, isRestoring: false }));
        })
        .catch((err) => {
          console.error("Restoration failed", err);
          // Don't fail the whole app, just this part
          setProcessingState(prev => ({ ...prev, isRestoring: false }));
        });

      // 2. Text Analysis (Transcription + Translation)
      analyzeManuscriptText(base64Data, file.type)
        .then((result) => {
          setAnalysis(result);
          setProcessingState(prev => ({ ...prev, isAnalyzing: false }));
        })
        .catch((err) => {
          console.error("Analysis failed", err);
          setProcessingState(prev => ({ ...prev, isAnalyzing: false, error: "Failed to analyze text." }));
        });

    } catch (error) {
      console.error("File processing error", error);
      setProcessingState({ isRestoring: false, isAnalyzing: false, error: "Error reading file." });
    }
  };

  const isLoading = processingState.isRestoring || processingState.isAnalyzing;

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />
      
      <main className="flex-grow flex flex-col items-center py-10 px-4">
        
        {/* Intro / Uploader */}
        {!originalImage && !isLoading ? (
          <div className="w-full max-w-4xl text-center space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8">
              <h2 className="text-xl font-bold text-amber-900 mb-2">Welcome to the Archives 🏛️</h2>
              <p className="text-amber-800">
                Upload a photo of a damaged palm-leaf manuscript. We will attempt to digitally repair cracks, enhance the ink, and provide a modern Tamil transcription along with an English translation.
              </p>
            </div>
            <ImageUploader onImageSelected={handleImageSelected} isLoading={false} />
          </div>
        ) : null}

        {/* Loading State for Uploading/Initial Processing */}
        {!originalImage && isLoading && (
           <div className="flex flex-col items-center justify-center h-64">
             <div className="text-5xl animate-bounce mb-4">📜</div>
             <p className="text-xl text-stone-600">Reading manuscript...</p>
           </div>
        )}

        {/* Results View */}
        {originalImage && (
          <div className="w-full max-w-6xl space-y-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-stone-200">
               <h3 className="font-bold text-stone-700">Current Session</h3>
               <button 
                onClick={() => {
                  setOriginalImage(null);
                  setRestoredImage(null);
                  setAnalysis(null);
                  setProcessingState({ isRestoring: false, isAnalyzing: false, error: null });
                }}
                className="text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg transition-colors"
               >
                 🔄 Start New Upload
               </button>
            </div>

            {processingState.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                <span>⚠️</span>
                <span>{processingState.error}</span>
              </div>
            )}

            <ResultsDisplay 
              originalImageUrl={originalImage}
              restoredImageUrl={restoredImage}
              analysis={analysis}
            />
          </div>
        )}

      </main>

      <footer className="bg-stone-800 text-stone-400 py-6 text-center text-sm">
        <p>Built with Gemini 2.5 Flash & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default App;
