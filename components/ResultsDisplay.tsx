import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ManuscriptAnalysis, KolamType } from '../types';
import { AnimatedBorder, AnimatedKolamMotif } from './AnimatedKolam';

interface ResultsDisplayProps {
  originalImageUrl: string;
  restoredImageUrl: string | null;
  analysis: ManuscriptAnalysis | null;
  onRetryRestoration: () => void;
  onEditImage: (prompt: string) => void;
  isRestoring: boolean;
  kolamType: KolamType;
}

// --- HELPER COMPONENTS ---

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-royal-600 hover:text-royal-400 px-3 py-1 rounded text-xs transition-all flex items-center gap-2 hover:bg-royal-900/20"
      title="Copy to clipboard"
    >
      {copied ? <span className="text-green-500 font-bold">✓ Copied</span> : 
         <span className="font-serif text-xs uppercase tracking-widest font-bold">Copy</span>
      }
    </button>
  );
};

const SafeImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-heritage-800 text-royal-700/50 p-8 ${className}`}>
        <span className="text-3xl mb-2 opacity-50">⚠️</span>
        <span className="text-xs text-center font-serif">Image Unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} bg-heritage-900`} 
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

const ImageComparison: React.FC<{ original: string; restored: string }> = ({ original, restored }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full h-full min-h-[300px] select-none group overflow-hidden bg-heritage-900 rounded-lg">
      <SafeImage 
        src={restored} 
        alt="Restored" 
        className="w-full h-full object-contain absolute inset-0" 
      />
      
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
         <SafeImage 
           src={original} 
           alt="Original" 
           className="w-full h-full object-contain absolute inset-0" 
         />
      </div>
      
      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-0.5 bg-royal-500/80 cursor-ew-resize z-20 flex items-center justify-center group-hover:bg-royal-400 transition-colors" 
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-8 h-8 bg-heritage-900 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-royal-500 text-royal-500 font-bold text-xs relative transform transition-transform group-hover:scale-110">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
           </svg>
        </div>
      </div>
      
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        aria-label="Comparison Slider"
      />
      
      <div className="absolute top-4 left-4 bg-black/70 text-parchment-100 px-3 py-1 text-[10px] rounded-full font-serif backdrop-blur-sm pointer-events-none border border-white/10 z-20">
        ORIGINAL
      </div>
      <div className="absolute top-4 right-4 bg-royal-900/80 text-royal-100 px-3 py-1 text-[10px] rounded-full font-serif backdrop-blur-sm pointer-events-none border border-royal-500/30 z-20">
        RESTORED
      </div>
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  originalImageUrl, 
  restoredImageUrl, 
  analysis,
  onRetryRestoration,
  onEditImage,
  isRestoring,
  kolamType
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<'transcription' | 'translation'>('transcription');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    if (originalImageUrl) {
      const originalData = originalImageUrl.split(',')[1];
      zip.file("original_manuscript.png", originalData, { base64: true });
    }
    if (restoredImageUrl) {
      const restoredData = restoredImageUrl.split(',')[1];
      zip.file("restored_manuscript.png", restoredData, { base64: true });
    }
    if (analysis) {
      zip.file("raw_ocr.txt", analysis.rawOCR);
      zip.file("transcription_tamil.txt", analysis.transcription);
      zip.file("translation_english.txt", analysis.translation);
      let sourceReport = "";
      if (analysis.sourceInfo) {
        sourceReport = `\n-----------------------------\n[SOURCE IDENTIFICATION]\nWork: ${analysis.sourceInfo.detectedSource}\nSection: ${analysis.sourceInfo.section}\nContext: ${analysis.sourceInfo.briefExplanation}\n`;
      }
      const combinedReport = `PALM-LEAF MANUSCRIPT ANALYSIS\n=============================\n\n[RAW OCR EXTRACTION]\n${analysis.rawOCR}\n\n-----------------------------\n\n[TRANSCRIPTION - MODERN TAMIL]\n${analysis.transcription}\n\n-----------------------------\n\n[TRANSLATION - ENGLISH]\n${analysis.translation}\n${sourceReport}\n=============================\nGenerated by தொல்நோக்கு (Tholnokku)\n`;
      zip.file("full_report.txt", combinedReport);
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = "Tholnokku_Archive.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate zip", error);
      alert("Could not generate download bundle.");
    }
  };

  const handleEditSubmit = () => {
    if (editPrompt.trim()) {
        onEditImage(editPrompt);
        setEditPrompt("");
        setIsEditing(false);
    }
  };

  const isDataReady = originalImageUrl || restoredImageUrl || analysis;
  const isSourceIdentified = analysis?.sourceInfo && 
    !analysis.sourceInfo.detectedSource.toLowerCase().includes('unidentified');

  return (
    <div className="w-full mx-auto animate-fade-in space-y-8">
      
      {/* --- Fullscreen Modal --- */}
      {isFullscreen && restoredImageUrl && (
        <div className="fixed inset-0 z-[100] bg-heritage-950/95 backdrop-blur-lg flex flex-col animate-fade-in">
            <div className="absolute top-4 right-4 z-50">
               <button 
                  onClick={() => setIsFullscreen(false)}
                  className="p-3 bg-heritage-900 rounded-full text-royal-400 hover:text-royal-300 border border-royal-900/50 hover:bg-heritage-800 transition-all shadow-xl"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>
            
            <div className="flex-grow flex items-center justify-center p-4 sm:p-8">
                {showComparison ? (
                    <div className="w-full h-full max-w-6xl shadow-2xl border border-royal-900/30 rounded-lg overflow-hidden">
                        <ImageComparison original={originalImageUrl} restored={restoredImageUrl} />
                    </div>
                ) : (
                    <SafeImage 
                        src={restoredImageUrl} 
                        alt="Restored Manuscript Fullscreen" 
                        className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                    />
                )}
            </div>
            
            <div className="h-20 flex items-center justify-center gap-6 bg-heritage-900 border-t border-royal-900/30">
                 <span className="text-royal-500/50 text-xs font-serif uppercase tracking-[0.2em] hidden sm:block">
                    {showComparison ? "Comparison Mode" : "Restored View"}
                 </span>
                 <button 
                   onClick={() => setShowComparison(!showComparison)}
                   className="px-6 py-2 bg-royal-600 hover:bg-royal-500 text-heritage-950 font-bold rounded-full transition-colors flex items-center gap-2 text-sm shadow-lg"
                 >
                    <AnimatedKolamMotif size={16} seed={99} color="#0f0502" type={kolamType} />
                    {showComparison ? "Exit Comparison" : "Start Comparison"}
                 </button>
            </div>
        </div>
      )}

      {/* --- Action Toolbar --- */}
      {isDataReady && (
        <div className="flex justify-end relative z-10 mb-4">
            <button
              onClick={handleDownloadAll}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-3 bg-royal-600 hover:bg-royal-500 text-heritage-950 font-serif font-bold rounded-sm shadow-lg border border-royal-500 transition-all hover:-translate-y-0.5 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              <AnimatedKolamMotif size={20} seed={88} color="#0f0502" type={kolamType} />
              <span className="tracking-widest uppercase text-sm">Download Archive</span>
            </button>
        </div>
      )}

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT COLUMN: VISUALS (5/12) --- */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Restored Image Card (Primary) */}
          <AnimatedBorder seed={303} type={kolamType}>
             <div className="bg-heritage-900 p-1 shadow-2xl rounded-xl">
                <div className="bg-heritage-800 border border-royal-900/40 p-1 rounded-lg">
                     {/* Header */}
                     <div className="flex items-center justify-between px-4 py-3 bg-heritage-900/50 rounded-t-lg border-b border-royal-900/20">
                         <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-royal-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"></div>
                             <h2 className="font-serif font-bold uppercase tracking-[0.15em] text-sm text-royal-400">Restoration</h2>
                         </div>
                         <div className="flex gap-2">
                             {restoredImageUrl && !isRestoring && (
                                <>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`p-2 rounded-lg text-xs transition-colors border ${isEditing ? 'bg-royal-600 text-heritage-950 border-royal-500' : 'text-royal-500 border-royal-900/50 hover:bg-heritage-700'}`}
                                    title="AI Edit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button 
                                    onClick={() => setShowComparison(!showComparison)}
                                    className={`p-2 rounded-lg text-xs transition-colors border ${showComparison ? 'bg-royal-600 text-heritage-950 border-royal-500' : 'text-royal-500 border-royal-900/50 hover:bg-heritage-700'}`}
                                    title="Compare"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                </button>
                                <button 
                                    onClick={onRetryRestoration}
                                    className="p-2 rounded-lg text-royal-500 border border-royal-900/50 hover:bg-heritage-700 transition-colors"
                                    title="Regenerate"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>
                                <button 
                                    onClick={() => setIsFullscreen(true)}
                                    className="p-2 rounded-lg text-royal-500 border border-royal-900/50 hover:bg-heritage-700 transition-colors"
                                    title="Fullscreen"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                </button>
                                </>
                            )}
                         </div>
                     </div>

                     {/* AI Edit Panel */}
                     {isEditing && (
                        <div className="bg-heritage-900/80 p-3 border-b border-royal-900/30 animate-fade-in backdrop-blur-sm">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    placeholder="Instruction (e.g. 'Sharpen text')"
                                    className="flex-grow bg-heritage-950 border border-royal-900/60 rounded px-3 py-2 text-sm text-parchment-100 placeholder-royal-900/50 focus:outline-none focus:border-royal-500 font-serif"
                                    onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                                />
                                <button
                                    onClick={handleEditSubmit}
                                    disabled={!editPrompt.trim()}
                                    className="bg-royal-600 hover:bg-royal-500 disabled:opacity-50 text-heritage-950 px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
                                >
                                    Go
                                </button>
                            </div>
                        </div>
                     )}
                     
                     <div className="relative w-full bg-heritage-950 overflow-hidden flex items-center justify-center min-h-[300px] bg-palm-grain">
                        {isRestoring ? (
                           <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-heritage-950/80 backdrop-blur-[2px]">
                            <AnimatedKolamMotif size={80} seed={Date.now()} color="#d97706" className="mb-6 opacity-80" type={kolamType} loading={true} />
                            <span className="text-sm font-serif italic text-royal-400/80 animate-pulse">Restoring artifacts...</span>
                          </div>
                        ) : null}
                        
                        {restoredImageUrl ? (
                          showComparison ? (
                             <ImageComparison original={originalImageUrl} restored={restoredImageUrl} />
                          ) : (
                             <SafeImage 
                               src={restoredImageUrl} 
                               alt="Restored Manuscript" 
                               className={`w-full h-auto object-contain block transition-all duration-700 ${isRestoring ? 'scale-105 blur-sm' : 'scale-100 blur-0'}`}
                             />
                          )
                        ) : (
                          <div className="text-royal-900/40 flex flex-col items-center">
                             <span className="text-4xl mb-4">❖</span>
                             <span className="font-serif italic text-sm">Waiting for input</span>
                          </div>
                        )}
                      </div>
                </div>
             </div>
          </AnimatedBorder>

          {/* Original Image (Secondary) */}
          <AnimatedBorder seed={101} type={kolamType}>
             <div className="bg-heritage-900 p-1 shadow-xl rounded-xl opacity-90 hover:opacity-100 transition-opacity">
                 <div className="bg-heritage-800 border border-royal-900/30 p-1 rounded-lg">
                     <div className="px-4 py-2 border-b border-royal-900/20">
                        <h2 className="font-serif font-bold uppercase tracking-widest text-xs text-royal-600/70">Original Scan</h2>
                     </div>
                     <div className="relative w-full bg-heritage-950 overflow-hidden flex items-center justify-center min-h-[150px]">
                        <SafeImage 
                            src={originalImageUrl} 
                            alt="Original Manuscript" 
                            className="w-full h-auto max-h-[200px] object-contain block opacity-80 hover:opacity-100 transition-opacity"
                        />
                     </div>
                     {/* OCR Toggle */}
                     <details className="group">
                        <summary className="bg-heritage-900 p-2 cursor-pointer text-[10px] font-bold text-royal-700 uppercase tracking-widest hover:text-royal-500 transition-colors flex justify-between items-center">
                            <span>View Raw OCR</span>
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-3 bg-heritage-950 border-t border-royal-900/20 max-h-32 overflow-y-auto custom-scrollbar">
                             <p className="text-xs text-parchment-300 font-mono whitespace-pre-wrap">{analysis?.rawOCR || "OCR pending..."}</p>
                        </div>
                     </details>
                 </div>
             </div>
          </AnimatedBorder>

        </div>

        {/* --- RIGHT COLUMN: ANALYSIS (7/12) --- */}
        <div className="lg:col-span-7 space-y-8">

           {/* Source Identification */}
           {analysis?.sourceInfo && (
            <AnimatedBorder seed={505} type={kolamType}>
              <div className="bg-heritage-900 p-1 shadow-2xl rounded-xl transform transition-transform hover:scale-[1.01]">
                <div 
                    className={`rounded-lg overflow-hidden relative transition-all duration-500 bg-heritage-800 border ${isSourceIdentified ? 'border-royal-500/40 shadow-[0_0_20px_rgba(251,191,36,0.1)]' : 'border-royal-900/30'}`}
                >
                    <div className="px-6 py-4 border-b border-royal-900/20 flex items-center gap-3 bg-heritage-900/30">
                        <AnimatedKolamMotif size={24} seed={600} color={isSourceIdentified ? "#fbbf24" : "#b45309"} type={kolamType} />
                        <h2 className={`text-sm font-serif font-bold uppercase tracking-[0.2em] ${isSourceIdentified ? 'text-royal-400' : 'text-royal-700'}`}>Source Detected</h2>
                    </div>
                    
                    <div className="p-6 md:p-8">
                        <h3 className={`text-2xl md:text-3xl font-serif font-bold leading-tight mb-2 ${isSourceIdentified ? 'text-royal-300' : 'text-royal-600'}`}>
                        {analysis.sourceInfo.detectedSource}
                        </h3>
                        {analysis.sourceInfo.section && (
                            <div className="flex items-center gap-3 mb-6">
                                <span className="h-px w-8 bg-royal-600/50"></span>
                                <span className="text-sm font-bold uppercase tracking-wider text-royal-500/80">{analysis.sourceInfo.section}</span>
                            </div>
                        )}
                        <p className="font-serif italic text-parchment-200/80 leading-relaxed border-l-2 border-royal-700/30 pl-4">
                            {analysis.sourceInfo.briefExplanation}
                        </p>
                    </div>
                </div>
              </div>
            </AnimatedBorder>
           )}

           {/* Tabs for Transcription/Translation (Mobile Optimization) */}
           <div className="bg-heritage-900 rounded-t-xl border border-royal-900/30 p-1 flex sm:hidden">
              <button 
                onClick={() => setActiveTab('transcription')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${activeTab === 'transcription' ? 'bg-royal-600 text-heritage-950' : 'text-royal-600 hover:bg-heritage-800'}`}
              >
                Tamil Script
              </button>
              <button 
                onClick={() => setActiveTab('translation')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${activeTab === 'translation' ? 'bg-royal-600 text-heritage-950' : 'text-royal-600 hover:bg-heritage-800'}`}
              >
                English
              </button>
           </div>

           {/* Transcription & Translation Cards */}
           <div className={`space-y-6 ${activeTab === 'translation' ? 'hidden sm:block' : 'block'}`}>
            <AnimatedBorder seed={707} type={kolamType}>
                <div className="bg-heritage-900 p-1 shadow-xl rounded-xl">
                    <div className="bg-heritage-800 border border-royal-900/30 p-6 sm:p-8 min-h-[250px] relative rounded-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <span className="text-9xl font-serif text-royal-900">அ</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 border-b border-royal-900/20 pb-2">
                            <h2 className="font-serif font-bold text-royal-500 tracking-[0.2em] text-sm uppercase">Modern Tamil Transcription</h2>
                            {analysis?.transcription && <CopyButton text={analysis.transcription} />}
                        </div>
                        {analysis ? (
                            <p className="text-xl sm:text-2xl text-parchment-100 leading-loose font-serif whitespace-pre-wrap">
                                {analysis.transcription}
                            </p>
                        ) : (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-royal-900/20 rounded w-3/4"></div>
                                <div className="h-4 bg-royal-900/20 rounded w-full"></div>
                                <div className="h-4 bg-royal-900/20 rounded w-5/6"></div>
                            </div>
                        )}
                    </div>
                </div>
            </AnimatedBorder>
           </div>

           <div className={`space-y-6 ${activeTab === 'transcription' ? 'hidden sm:block' : 'block'}`}>
            <AnimatedBorder seed={1001} type={kolamType}>
                <div className="bg-heritage-900 p-1 shadow-xl rounded-xl">
                    <div className="bg-heritage-800 border border-royal-900/30 p-6 sm:p-8 min-h-[250px] relative rounded-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <span className="text-9xl font-serif text-royal-900">A</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 border-b border-royal-900/20 pb-2">
                            <h2 className="font-serif font-bold text-royal-500 tracking-[0.2em] text-sm uppercase">English Translation</h2>
                            {analysis?.translation && <CopyButton text={analysis.translation} />}
                        </div>
                        {analysis ? (
                            <p className="text-lg text-parchment-200/90 leading-relaxed font-serif italic">
                                {analysis.translation}
                            </p>
                        ) : (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-royal-900/20 rounded w-full"></div>
                                <div className="h-4 bg-royal-900/20 rounded w-4/5"></div>
                                <div className="h-4 bg-royal-900/20 rounded w-5/6"></div>
                            </div>
                        )}
                    </div>
                </div>
            </AnimatedBorder>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;