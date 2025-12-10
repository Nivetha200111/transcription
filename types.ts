export type KolamType = 'lissajous' | 'pulli' | 'kambi';

export interface LocationData {
  title: string;
  uri: string;
  description: string;
}

export interface ManuscriptAnalysis {
  transcription: string;
  translation: string;
  rawOCR: string;
  sourceInfo: {
    detectedSource: string;
    section: string;
    briefExplanation: string;
  };
  regionInfo?: {
    region: string;
    confidence: string;
    reasoning: string;
  };
  locationData?: LocationData;
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
  rawOCR: string;
  sourceInfo: {
    detectedSource: string;
    section: string;
    briefExplanation: string;
  };
  regionInfo?: {
    region: string;
    confidence: string;
    reasoning: string;
  };
}

export interface ManuscriptRecord {
  id?: number;
  timestamp: number;
  originalImage: string;
  restoredImage: string | null;
  analysis: ManuscriptAnalysis | null;
}