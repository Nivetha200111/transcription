import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryGallery from './components/HistoryGallery';
import { restoreManuscriptImage, analyzeManuscriptText, fileToBase64 } from './services/geminiService';
import { saveManuscript, getAllManuscripts, deleteManuscript } from './services/dbService';
import { ManuscriptAnalysis, ProcessingState, ManuscriptRecord } from './types';

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

  // Load history on mount
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
    if (window.confirm("Are you sure you want to delete this manuscript from your library?")) {
      await deleteManuscript(id);
      loadHistory();
    }
  };

  const handleSelectHistory = (record: ManuscriptRecord) => {
    setOriginalImage(record.originalImage);
    setRestoredImage(record.restoredImage);
    setAnalysis(record.analysis);
    setProcessingState({ isRestoring: false, isAnalyzing: false, error: null });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryRestoration = async () => {
    if (!originalImage) return;

    setProcessingState(prev => ({ ...prev, isRestoring: true }));
    try {
        // extract base64 from originalImage data url
        // Data URL format: data:[<mediatype>][;base64],<data>
        const matches = originalImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
           throw new Error("Invalid image data");
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];

        // Pass a random variation number to encourage different results
        const variation = Math.floor(Math.random() * 1000);
        const restored = await restoreManuscriptImage(base64Data, mimeType, variation);
        
        if (restored) {
          setRestoredImage(restored);
        } else {
           // Keep old image if restoration fails or returns null
           console.warn("Retry returned null, keeping previous image");
        }
        
    } catch (e) {
        console.error("Retry failed", e);
        // Optionally show a toast error
    } finally {
        setProcessingState(prev => ({ ...prev, isRestoring: false }));
    }
  };

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

      // Create promises that return their results so we can aggregate them later for saving
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

      // Wait for both to complete (success or fail) then save to DB
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
    <div className="flex flex-col min-h-screen font-sans bg-stone-50">
      <Header />
      
      <main className="flex-grow flex flex-col items-center py-8 px-4 sm:px-6 w-full">
        <div className="w-full max-w-7xl">
          
          {/* Main Processing Area */}
          <div className="min-h-[50vh]">
            
            {/* Intro / Uploader */}
            {!originalImage && !isLoading ? (
              <div className="w-full max-w-3xl mx-auto text-center space-y-8 animate-fade-in mt-10">
                <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-2xl shadow-sm">
                  <h2 className="text-2xl font-bold text-amber-900 mb-3">Welcome to the Archives 🏛️</h2>
                  <p className="text-amber-800 text-lg leading-relaxed">
                    Upload a photo of a damaged palm-leaf manuscript.<br/> 
                    Our AI will digitally repair cracks, enhance faded ink, and transcribe ancient scripts into modern text.
                  </p>
                </div>
                <ImageUploader onImageSelected={handleImageSelected} isLoading={false} />
              </div>
            ) : null}

            {/* Loading State */}
            {!originalImage && isLoading && (
              <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
                <div className="text-6xl animate-bounce mb-6">📜</div>
                <p className="text-2xl font-light text-stone-600">Reading manuscript...</p>
                <p className="text-sm text-stone-400 mt-2">This may take up to 30 seconds</p>
              </div>
            )}

            {/* Results View */}
            {originalImage && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white px-6 py-4 rounded-xl shadow-sm border border-stone-200">
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     <h3 className="font-bold text-stone-700">Active Session</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setOriginalImage(null);
                      setRestoredImage(null);
                      setAnalysis(null);
                      setProcessingState({ isRestoring: false, isAnalyzing: false, error: null });
                    }}
                    className="text-sm font-medium bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>🔄</span> Start New Upload
                  </button>
                </div>

                {processingState.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">{processingState.error}</span>
                  </div>
                )}

                <ResultsDisplay 
                  originalImageUrl={originalImage}
                  restoredImageUrl={restoredImage}
                  analysis={analysis}
                  onRetryRestoration={handleRetryRestoration}
                  isRestoring={processingState.isRestoring}
                />
              </div>
            )}
          </div>

          {/* History Gallery */}
          <HistoryGallery 
            history={history} 
            onSelect={handleSelectHistory} 
            onDelete={handleDeleteHistory} 
          />
        </div>
      </main>
    </div>
  );
};

export default App;