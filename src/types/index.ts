export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'unknown';

export interface VocabWord {
  word: string;
  reading: string;
  pos: string;
  frequency: number;
  jlpt?: JLPTLevel;
  known: boolean;
  meaning?: string;
}

export interface AnalysisResult {
  comprehensionScore: number;
  totalUniqueWords: number;
  knownWords: number;
  unknownWords: VocabWord[];
  userLevel: JLPTLevel;
  charCount?: number; // length of the parsed text, for analytics
}

export interface PlacementWord {
  word: string;
  reading: string;
  meaning: string;
  level: JLPTLevel;
}

export interface AnalyzeRequest {
  text: string;
  userLevel: JLPTLevel;
  mode: 'anime' | 'lyrics';
}
