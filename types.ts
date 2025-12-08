export interface ManuscriptAnalysis {
  transcription: string;
  translation: string;
}

export interface ProcessingState {
  isRestoring: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

export interface RestoredImageResult {
  imageUrl: string | null;
}

// Define specific structure for JSON schema output
export interface AnalysisResponseSchema {
  transcription: string;
  translation: string;
}
