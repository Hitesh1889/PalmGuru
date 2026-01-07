import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ApiResponse } from '../types';

export const analyzePalmImage = async (base64Image: string): Promise<ApiResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash-image"; // Using a vision-capable model

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg', // Assuming JPEG, but could be dynamic if needed
      data: base64Image.split(',')[1], // Remove the "data:image/jpeg;base64," prefix
    },
  };

  const prompt = `Analyze this palm image for palmistry. Identify and describe the Heart Line, Mind Line, and Fate Line. Based on these lines and other visible features, describe the person's personality and traits. Provide a general, entertaining future prediction. Conclude with a clear statement: "Disclaimer: This analysis is for entertainment purposes only and should not be taken as professional advice." Ensure the response is detailed and engaging.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        maxOutputTokens: 1024,
      },
    });

    const fullAnalysis = response.text || "Could not generate a response. Please try again.";
    
    return { fullAnalysis };

  } catch (error) {
    console.error("Error analyzing palm image with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze palm: ${error.message}`);
    }
    throw new Error('An unknown error occurred during palm analysis.');
  }
};
