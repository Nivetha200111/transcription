import { GoogleGenAI, Type } from "@google/genai";
import { ManuscriptAnalysis } from "../types";

// Initialize Gemini Client
// API_KEY is guaranteed to be available via process.env.API_KEY per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Restores the manuscript image using Gemini's image editing capabilities.
 * It asks the model to repair cracks, enhance ink, and improve contrast.
 */
export const restoreManuscriptImage = async (base64Image: string, mimeType: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: 'Restore this ancient Tamil palm-leaf manuscript. Repair cracks, enhance faded ink to make it black and legible, increase contrast against the leaf background, and remove visual noise. Return only the restored image.',
          },
        ],
      },
    });

    // Iterate through parts to find the image output
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error restoring image:", error);
    throw new Error("Failed to restore image. Please try again.");
  }
};

/**
 * Transcribes and translates the manuscript text.
 */
export const analyzeManuscriptText = async (base64Image: string, mimeType: string): Promise<ManuscriptAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: 'Analyze this ancient Tamil palm-leaf manuscript. 1. Transcribe the visible ancient Tamil script into clear, modern Tamil text. 2. Translate that Tamil text into English. Provide the output in JSON format.',
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: {
              type: Type.STRING,
              description: "The transcribed text in modern Tamil script.",
            },
            translation: {
              type: Type.STRING,
              description: "The English translation of the transcribed text.",
            },
          },
          required: ["transcription", "translation"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response from model.");
    }

    return JSON.parse(text) as ManuscriptAnalysis;

  } catch (error) {
    console.error("Error analyzing text:", error);
    throw new Error("Failed to analyze text. Please try again.");
  }
};
