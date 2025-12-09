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
      // Check if it has a prefix
      if (result.includes(',')) {
          const base64Data = result.split(',')[1];
          resolve(base64Data);
      } else {
          // Should not happen with readAsDataURL but safe fallback
          resolve(result);
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Restores the manuscript image using Gemini's image editing capabilities.
 * It asks the model to repair cracks, enhance ink, and improve contrast.
 * Accepts an optional variation seed to encourage different results on retry.
 */
export const restoreManuscriptImage = async (base64Image: string, mimeType: string, variation?: number): Promise<string | null> => {
  try {
    const variationPrompt = variation ? ` Generate variation #${variation} of the restoration.` : '';
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType || 'image/jpeg', // Fallback mimetype
            },
          },
          {
            text: `Restore this ancient Tamil palm-leaf manuscript. Repair cracks and physical damage. Significantly enhance the faded ink to make it sharp, black, and highly legible against the leaf texture. Reduce image noise and artifacts to ensure a clean, high-contrast, and historically accurate appearance. The goal is to make the script as readable as possible while preserving the authentic look of the palm leaf. Return only the restored image.${variationPrompt}`,
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
 * Transcribes and translates the manuscript text using Gemini 3 Pro with Thinking Mode.
 */
export const analyzeManuscriptText = async (base64Image: string, mimeType: string): Promise<ManuscriptAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: `Analyze this ancient Tamil palm-leaf manuscript. 
            1. Extract the raw text characters exactly as they appear on the leaf (Raw OCR). 
            2. Transcribe the visible ancient Tamil script into clear, modern Tamil text. 
            3. Translate the Tamil text into English with high accuracy. Ensure the translation preserves the cultural, historical, and contextual meaning. If the text is poetic or philosophical, maintain the tone. Avoid overly literal translations that obscure the meaning; prioritize clarity and faithfulness to the source.
            4. Identify the literary source of the text. If it is from a known Tamil literary work (e.g., Kamba Ramayanam, Thirukkural, Silappathikaram, Thevaram), specify the Work's Name, the specific Section/Verse location, and a brief explanation of the context. If the source is unknown or generic, state 'Unidentified' or 'General text'.
            Provide the output in JSON format.`,
          },
        ],
      },
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Enable thinking mode for complex analysis
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rawOCR: {
              type: Type.STRING,
              description: "The raw text characters extracted from the image extracted exactly as they appear.",
            },
            transcription: {
              type: Type.STRING,
              description: "The transcribed text in modern Tamil script.",
            },
            translation: {
              type: Type.STRING,
              description: "The English translation of the transcribed text.",
            },
            sourceInfo: {
              type: Type.OBJECT,
              properties: {
                detectedSource: {
                  type: Type.STRING,
                  description: "The name of the identified literary work (e.g., Kamba Ramayanam) or 'Unidentified'.",
                },
                section: {
                  type: Type.STRING,
                  description: "The specific chapter, canto, or verse number (e.g., Bala Kandam, Verse 12).",
                },
                briefExplanation: {
                  type: Type.STRING,
                  description: "A short context about this specific passage or why it was identified as such.",
                }
              },
              required: ["detectedSource", "section", "briefExplanation"],
            }
          },
          required: ["rawOCR", "transcription", "translation", "sourceInfo"],
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