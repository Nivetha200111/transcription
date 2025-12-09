import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryGallery from './components/HistoryGallery';
import { restoreManuscriptImage, analyzeManuscriptText, fileToBase64 } from './services/geminiService';
import { saveManuscript, getAllManuscripts, deleteManuscript } from './services/dbService';
import { ManuscriptAnalysis, ProcessingState, ManuscriptRecord, KolamType } from './types';
import { AnimatedKolamMotif } from './components/AnimatedKolam';
import { FlickeringDiya } from './components/FlickeringDiya';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ManuscriptAnalysis | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isRestoring: false,
    isAnalyzing: false,
    error: null,
  });
  
  const [history, setHistory] = useState<ManuscriptRecord[]>([]);
  // Hardcoded to 'pulli' as requested by user ("it should be pulli only")
  const [kolamType] = useState<KolamType>('pulli');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const records = await getAllManuscripts();
      setHistory(records);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (window.confirm("Remove this manuscript from the archives?")) {
      await deleteManuscript(id);
      loadHistory();
    }
  };

  const handleSelectHistory = (record: ManuscriptRecord) => {
    setOriginalImage(record.originalImage);
    setRestoredImage(record.restoredImage);
    setAnalysis(record.analysis);
    setProcessingState({ isRestoring: false, isAnalyzing: false, error: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryRestoration = async () => {
    if (!originalImage) return;

    setProcessingState(prev => ({ ...prev, isRestoring: true }));
    try {
        const matches = originalImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
           throw new Error("Invalid image data");
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];

        const variation = Math.floor(Math.random() * 1000);
        const restored = await restoreManuscriptImage(base64Data, mimeType, variation);
        
        if (restored) {
          setRestoredImage(restored);
        } else {
           console.warn("Retry returned null, keeping previous image");
        }
        
    } catch (e) {
        console.error("Retry failed", e);
    } finally {
        setProcessingState(prev => ({ ...prev, isRestoring: false }));
    }
  };

  const handleImageSelected = async (file: File) => {
    setOriginalImage(null);
    setRestoredImage(null);
    setAnalysis(null);
    setProcessingState({ isRestoring: true, isAnalyzing: true, error: null });

    try {
      const base64Data = await fileToBase64(file);
      const fullBase64 = `data:${file.type};base64,${base64Data}`;
      setOriginalImage(fullBase64);

      const restorationTask = restoreManuscriptImage(base64Data, file.type)
        .then((restored) => {
          setRestoredImage(restored);
          setProcessingState(prev => ({ ...prev, isRestoring: false }));
          return restored;
        })
        .catch((err) => {
          console.error("Restoration failed", err);
          setProcessingState(prev => ({ ...prev, isRestoring: false }));
          return null;
        });

      const analysisTask = analyzeManuscriptText(base64Data, file.type)
        .then((result) => {
          setAnalysis(result);
          setProcessingState(prev => ({ ...prev, isAnalyzing: false }));
          return result;
        })
        .catch((err) => {
          console.error("Analysis failed", err);
          setProcessingState(prev => ({ ...prev, isAnalyzing: false, error: "Failed to analyze text." }));
          return null;
        });

      Promise.allSettled([restorationTask, analysisTask]).then(async (results) => {
        const restoredResult = results[0].status === 'fulfilled' ? results[0].value : null;
        const analysisResult = results[1].status === 'fulfilled' ? results[1].value : null;

        const record: Omit<ManuscriptRecord, 'id'> = {
          timestamp: Date.now(),
          originalImage: fullBase64,
          restoredImage: restoredResult,
          analysis: analysisResult
        };

        await saveManuscript(record);
        loadHistory();
      });

    } catch (error) {
      console.error("File processing error", error);
      setProcessingState({ isRestoring: false, isAnalyzing: false, error: "Error reading file." });
    }
  };

  const isLoading = processingState.isRestoring || processingState.isAnalyzing;

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header kolamType={kolamType} />
      
      <main className="flex-grow flex flex-col items-center py-6 px-3 sm:px-6 w-full relative z-10">
        <div className="w-full max-w-7xl">
          
          <div className="min-h-[40vh]">
            
            {!originalImage && !isLoading ? (
              <div className="w-full max-w-2xl mx-auto text-center space-y-10 animate-fade-in mt-4 sm:mt-8">
                
                {/* Intro Card */}
                <div className="bg-[#1a0b05]/60 backdrop-blur-sm border-2 border-amber-900/50 p-6 sm:p-8 rounded-sm shadow-xl relative overflow-hidden mx-2 sm:mx-0">
                  <div className="absolute top-0 left-0 w-2 h-full bg-amber-800"></div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-500 mb-3 tracking-wide">Enter the Archives</h2>
                  <p className="text-amber-200/70 text-base sm:text-lg leading-relaxed font-serif">
                    Digitally restore, transcribe, and translate ancient Tamil manuscripts using advanced AI.
                  </p>
                </div>

                <div className="px-2 sm:px-0">
                  <ImageUploader 
                    onImageSelected={handleImageSelected} 
                    isLoading={false} 
                    kolamType={kolamType}
                  />
                </div>
              </div>
            ) : null}

            {!originalImage && isLoading && (
              <div className="flex flex-col items-center justify-center h-80 animate-fade-in px-4 text-center">
                <div className="relative">
                   {/* Use loading=true to trigger Diya animation */}
                   <AnimatedKolamMotif size={80} seed={999} color="#f59e0b" type={kolamType} loading={true} className="mb-8" />
                   <div className="absolute -bottom-2 w-full h-4 bg-amber-500/10 rounded-full blur-md animate-pulse"></div>
                </div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-500 mb-2 tracking-wide">Analyzing Script...</p>
                <p className="text-amber-900/60 font-serif italic text-sm sm:text-base">Deciphering centuries of history</p>
              </div>
            )}

            {originalImage && (
              <div className="space-y-6 sm:space-y-8 animate-fade-in">
                {/* Status Bar */}
                <div className="flex justify-between items-center bg-[#1a0b05]/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg border border-amber-900/50 mx-auto max-w-4xl sticky top-2 z-30 transition-all">
                  <div className="flex items-center gap-2 sm:gap-3">
                     <div className="relative flex items-center justify-center pt-1">
                       {/* Animated Flickering Diya Indicator */}
                       <FlickeringDiya size={32} />
                     </div>
                     <h3 className="font-serif font-bold text-amber-500 text-xs sm:text-sm tracking-widest uppercase">Active Session</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setOriginalImage(null);
                      setRestoredImage(null);
                      setAnalysis(null);
                      setProcessingState({ isRestoring: false, isAnalyzing: false, error: null });
                    }}
                    className="text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-[#2a1006] hover:bg-amber-950 text-amber-700 hover:text-amber-500 px-4 py-2 rounded-full transition-colors flex items-center gap-2 border border-amber-900/40 hover:border-amber-700"
                  >
                    <span>New Upload</span>
                  </button>
                </div>

                {processingState.error && (
                  <div className="bg-red-950/30 border-l-4 border-red-900 text-red-300 p-4 rounded-r shadow-sm flex items-center gap-3 max-w-4xl mx-auto backdrop-blur-sm">
                    <span className="text-2xl">⚠️</span>
                    <span className="font-serif font-medium text-sm sm:text-base">{processingState.error}</span>
                  </div>
                )}

                <ResultsDisplay 
                  originalImageUrl={originalImage}
                  restoredImageUrl={restoredImage}
                  analysis={analysis}
                  onRetryRestoration={handleRetryRestoration}
                  isRestoring={processingState.isRestoring}
                  kolamType={kolamType}
                />
              </div>
            )}
          </div>

          <HistoryGallery 
            history={history} 
            onSelect={handleSelectHistory} 
            onDelete={handleDeleteHistory}
            kolamType={kolamType}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
