import React, { useState, useCallback, useRef } from 'react';
import ImageInput from './components/ImageInput';
import { analyzePalmImage } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import Button from './components/Button';

const App: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null); // New state for copy feedback

  const handleImageCaptured = useCallback((base64Image: string) => {
    setCapturedImage(base64Image);
    setAnalysisResult(null); // Clear previous analysis
    setError(null); // Clear any previous errors
    setCopyMessage(null); // Clear copy message
  }, []);

  const handleAnalyzePalm = useCallback(async () => {
    if (!capturedImage) {
      setError("Please capture or upload a palm image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCopyMessage(null); // Clear copy message before new analysis
    try {
      // Create a new GoogleGenAI instance inside the service call
      // to ensure it always uses the most up-to-date API key from the environment.
      const response = await analyzePalmImage(capturedImage);
      setAnalysisResult(response.fullAnalysis);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      // General error handling, as API key selection logic is removed.
      setError(`Failed to analyze palm: ${err.message || "An unknown error occurred."}`);
    } finally {
      setIsLoading(false);
    }
  }, [capturedImage]);

  const handleStartOver = useCallback(() => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setError(null);
    setCopyMessage(null); // Clear copy message
  }, []);

  // New function to handle copying content
  const handleCopyContent = useCallback(() => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult)
        .then(() => {
          setCopyMessage('Copied to clipboard!');
          setTimeout(() => setCopyMessage(null), 3000); // Clear message after 3 seconds
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          setCopyMessage('Failed to copy!');
          setTimeout(() => setCopyMessage(null), 3000);
        });
    }
  }, [analysisResult]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-400 mb-8 text-center drop-shadow-lg">
        🔮 PalmGuru ✋
      </h1>

      <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Image Input & Capture */}
        <div className="flex-1 w-full lg:sticky lg:top-8 bg-gray-800 rounded-lg shadow-2xl p-6 flex flex-col items-center">
          <ImageInput onImageCaptured={handleImageCaptured} isLoading={isLoading} />
          {capturedImage && (
            <div className="mt-6 w-full flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleAnalyzePalm} isLoading={isLoading} disabled={isLoading} variant="primary">
                Analyze My Palm
              </Button>
              <Button onClick={handleStartOver} disabled={isLoading} variant="secondary">
                Start Over
              </Button>
            </div>
          )}
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>

        {/* Right Column: Analysis Results */}
        <div className="flex-1 w-full bg-gray-800 rounded-lg shadow-2xl p-6 text-gray-100 min-h-[300px] lg:min-h-[600px] flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-300">Your Palm's Wisdom:</h2>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-lg text-gray-300">Unveiling your destiny...</p>
              </div>
            )}
            {analysisResult && (
              <div className="prose prose-invert max-w-none">
                <MarkdownRenderer content={analysisResult} />
                <div className="mt-6 flex flex-col items-center gap-2">
                  <Button onClick={handleCopyContent} variant="secondary">
                    Copy Analysis
                  </Button>
                  {copyMessage && (
                    <p className={`text-sm ${copyMessage.startsWith('Copied') ? 'text-green-400' : 'text-red-400'}`}>
                      {copyMessage}
                    </p>
                  )}
                </div>
              </div>
            )}
            {!capturedImage && !analysisResult && !isLoading && (
              <p className="text-gray-400 text-center py-12">
                Upload or capture an image of your palm to discover your future and personality traits!
              </p>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-700 text-sm text-gray-400 text-center">
            <p>
              Disclaimer: This PalmGuru application is for entertainment purposes only.
              It should not be taken as professional advice or a substitute for expert consultations.
              Palmistry interpretations are subjective and should be enjoyed as a fun and imaginative exploration of self.
            </p>
            <p className="mt-2">
              <a href="https://picsum.photos/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Placeholder images from picsum.photos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;