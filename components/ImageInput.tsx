import React, { useRef, useState, useEffect, useCallback } from 'react';
import Button from './Button';

interface ImageInputProps {
  onImageCaptured: (base64Image: string) => void;
  isLoading: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageCaptured, isLoading }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setCapturedImage(null); // Clear previous image when starting camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure camera permissions are granted. You can still upload an image.");
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    // Only start camera initially if no image is captured and not loading
    if (!capturedImage && !isLoading) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        const image = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(image);
        onImageCaptured(image);
        stopCamera(); // Stop camera after capture
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    stopCamera();
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        onImageCaptured(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(); // Restart camera for retake
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-xl w-full max-w-xl">
      <h2 className="text-2xl font-bold mb-6 text-pink-400">Capture Your Palm</h2>
      {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

      {!capturedImage && (
        <div className="w-full h-80 bg-gray-900 rounded-lg overflow-hidden relative flex items-center justify-center mb-6">
          {isCameraActive ? (
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"></video>
          ) : (
            <p className="text-gray-400">Camera not active or not permitted.</p>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      )}

      {capturedImage && (
        <div className="w-full h-80 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center mb-6">
          <img src={capturedImage} alt="Captured Palm" className="object-contain max-h-full max-w-full" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        {!capturedImage && isCameraActive && (
          <Button onClick={handleCapture} disabled={isLoading} variant="primary">
            Take Photo
          </Button>
        )}
        {capturedImage && (
          <Button onClick={handleRetake} disabled={isLoading} variant="secondary">
            Retake
          </Button>
        )}
        <label className={`cursor-pointer ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
          <span // Use a span with button styling for the upload trigger
            className="px-6 py-3 rounded-full text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500"
            aria-disabled={isLoading} // For accessibility
          >
            Upload Image
          </span>
        </label>
      </div>
    </div>
  );
};

export default ImageInput;