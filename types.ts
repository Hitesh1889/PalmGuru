export interface PalmAnalysis {
  heartLine: string;
  mindLine: string;
  fateLine: string;
  personality: string;
  futurePrediction: string;
  disclaimer: string;
}

export interface ApiResponse {
  fullAnalysis: string; // Gemini will return a single markdown string
}
