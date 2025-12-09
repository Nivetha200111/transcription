import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryGallery from './components/HistoryGallery';
import { restoreManuscriptImage, analyzeManuscriptText, fileToBase64, editManuscriptImage } from './services/geminiService';
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
        }
    } catch (e) {
        console.error("Retry failed", e);
    } finally {
        setProcessingState(prev => ({ ...prev, isRestoring: false }));
    }
  };

  const handleEditImage = async (prompt: string) => {
    const imageToEdit = restoredImage || originalImage;
    if (!imageToEdit) return;

    setProcessingState(prev => ({ ...prev, isRestoring: true }));
    try {
        const matches = imageToEdit.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
           throw new Error("Invalid image data");
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];

        const edited = await editManuscriptImage(base64Data, mimeType, prompt);
        
        if (edited) {
          setRestoredImage(edited);
        }
    } catch (e) {
        console.error("Edit failed", e);
        setProcessingState(prev => ({ ...prev, error: "Failed to edit image" }));
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
    <div className="flex flex-col min-h-screen font-sans bg-heritage-950 text-parchment-100">
      <Header kolamType={kolamType} />
      
      <main className="flex-grow flex flex-col items-center py-6 px-4 sm:px-6 w-full relative z-10">
        <div className="w-full max-w-[1400px]">
          
          <div className="min-h-[40vh]">
            
            {!originalImage && !isLoading ? (
              <div className="w-full max-w-3xl mx-auto text-center space-y-12 animate-fade-in mt-8">
                
                {/* Intro Card */}
                <div className="bg-heritage-900/60 backdrop-blur-md border border-royal-900/30 p-8 rounded-xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-royal-600 to-royal-900"></div>
                  <h2 className="text-3xl font-serif font-bold text-royal-400 mb-4 tracking-tight">Enter the Archives</h2>
                  <p className="text-parchment-200/80 text-lg leading-relaxed font-serif max-w-xl mx-auto">
                    Digitally restore, transcribe, and translate ancient Tamil manuscripts using advanced AI.
                  </p>
                </div>

                <div className="px-4">
                  <ImageUploader 
                    onImageSelected={handleImageSelected} 
                    isLoading={false} 
                    kolamType={kolamType}
                  />
                </div>
              </div>
            ) : null}

            {!originalImage && isLoading && (
              <div className="flex flex-col items-center justify-center h-[50vh] animate-fade-in px-4 text-center">
                <div className="relative mb-10">
                   <AnimatedKolamMotif size={100} seed={999} color="#d97706" type={kolamType} loading={true} />
                   <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-royal-500/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                <h3 className="text-3xl font-serif font-bold text-royal-400 mb-2 tracking-wide">Analyzing Script</h3>
                <p className="text-royal-800/60 font-serif italic text-lg">Deciphering centuries of history...</p>
              </div>
            )}

            {originalImage && (
              <div className="space-y-10 animate-fade-in">
                {/* Status Bar */}
                <div className="flex justify-between items-center bg-heritage-900/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-royal-900/30 mx-auto max-w-5xl sticky top-4 z-40 transition-all hover:border-royal-500/30">
                  <div className="flex items-center gap-4">
                     <div className="relative flex items-center justify-center pt-1">
                       <FlickeringDiya size={28} />
                     </div>
                     <div className="flex flex-col">
                        <h3 className="font-serif font-bold text-royal-400 text-xs tracking-[0.2em] uppercase">Active Session</h3>
                        <span className="text-[10px] text-royal-700 font-mono">ID: {Date.now().toString().slice(-6)}</span>
                     </div>
                  </div>
                  <button 
                    onClick={() => {
                      setOriginalImage(null);
                      setRestoredImage(null);
                      setAnalysis(null);
                      setProcessingState({ isRestoring: false, isAnalyzing: false, error: null });
                    }}
                    className="text-xs font-bold uppercase tracking-widest bg-heritage-800 hover:bg-royal-900 text-royal-500 hover:text-royal-300 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 border border-royal-900/50"
                  >
                    <span>New Upload</span>
                  </button>
                </div>

                {processingState.error && (
                  <div className="bg-red-950/20 border border-red-900/50 text-red-300 p-4 rounded-lg shadow-lg flex items-center gap-4 max-w-4xl mx-auto backdrop-blur-sm">
                    <span className="text-2xl">⚠️</span>
                    <span className="font-serif font-medium">{processingState.error}</span>
                  </div>
                )}

                <ResultsDisplay 
                  originalImageUrl={originalImage}
                  restoredImageUrl={restoredImage}
                  analysis={analysis}
                  onRetryRestoration={handleRetryRestoration}
                  onEditImage={handleEditImage}
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