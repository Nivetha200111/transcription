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
    const variationPrompt = variation ? ` Generate variation #${variation} with slightly different enhancement parameters.` : '';
    
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
            text: `You are a Master Digital Archivist and Restoration Artist specializing in ancient Tamil palm-leaf manuscripts (Olai Chuvadi).

Your objective is to produce a **publication-quality restoration** of this manuscript. The output must be significantly clearer, cleaner, and more legible than the original.

**Execution Guidelines:**

1.  **Aggressive Text Enhancement (High Contrast)**: 
    -   Treat the ink strokes as the primary signal and the leaf texture as background noise. 
    -   Significantly darken and sharpen the Tamil characters to make them stand out boldly.
    -   Connect broken strokes where ink has flaked off using the correct ductus of the script.

2.  **Context-Aware Inpainting (Deep Reconstruction)**:
    -   **CRITICAL**: Locate all holes, tears, and eroded margins.
    -   **ACTION**: Fill these voids with matching palm-leaf texture. 
    -   **PREDICTION**: If text is missing in a damaged area, you MUST reconstruct the missing Tamil characters based on the surrounding linguistic context. Do not leave gaps. Write the missing letters in the exact style of the original scribe.

3.  **Noise & Damage Removal**:
    -   Remove black mold spots, insect holes, water stains, and random discoloration.
    -   Smooth out cracks so they don't look like character strokes.
    -   Ensure the background is a uniform, clean, aged palm-leaf color, free of distracting artifacts.

4.  **Authenticity Check**:
    -   The result should look like the manuscript was preserved in pristine condition.
    -   Do NOT introduce modern digital fonts. Use strictly hand-written stylus-etched aesthetics.

Produce a result that allows a scholar to read the text effortlessly without guessing.
            ${variationPrompt}`,
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
 * Edits the manuscript image based on a user text prompt using Gemini 2.5 Flash Image.
 */
export const editManuscriptImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("Failed to edit image.");
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
            text: `You are an expert Tamil Epigraphist and Paleographer specializing in ancient palm-leaf manuscripts (Olai Chuvadi).
            
            Your task is to accurately decipher, transcribe, and translate the text on this manuscript.

            **Analysis Steps:**
            1. **Paleographic Examination**: Identify the script style (e.g., Archaic Tamil, Grantha, or Vatteluttu). Distinguish between the natural grain of the leaf and the etched stylus strokes.
            2. **Raw Extraction**: Extract the characters exactly as they appear. If a character is archaic or abbreviated (common in manuscripts), denote it as closely as possible.
            3. **Modern Transcription**: Transcribe the text into standard Modern Tamil script. 
               - **Important**: Add missing 'pulli' (dots) for consonants if the original style omits them.
               - Correct obvious scribal errors based on the context of the sentence.
               - Resolve sandhi rules where necessary for readability.
            4. **Source Identification (STRICT & DETERMINISTIC)**: 
               - Cross-reference unique words, proper nouns, and poetic meters with classical Tamil literature.
               - **REQUIRE EXACT MATCHES**: Do not guess based on "style". Only identify the source if you can cite a specific known verse or unique phrase present in the text.
               - If the text is fragmentary, generic, or not found in major corpora, strictly return "Unidentified".
               - Your analysis must be deterministic: given the same text, always return the same source conclusion.
            5. **Region of Origin Estimation**:
               - Analyze dialect markers, specific deity references, or scribal variations to estimate the geographical origin (e.g., "Pandya Nadu", "Thanjavur", "Kongu Nadu").
               - Provide a confidence level.
            6. **Scholarly Translation**: Translate the text into clear, academic English. 
               - Preserve the poetic meter and tone if it is verse.
               - Explain metaphors or cultural references in the source info context.

            Output the result strictly in JSON format matching the schema provided.`,
          },
        ],
      },
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, 
        temperature: 0.0, // Force deterministic output
        seed: 42, // Fixed seed to ensure consistent source identification for identical inputs
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
                  description: "The name of the identified literary work. If unknown, strictly return 'Unidentified'.",
                },
                section: {
                  type: Type.STRING,
                  description: "The specific chapter, canto, or verse number. If unknown, return empty string.",
                },
                briefExplanation: {
                  type: Type.STRING,
                  description: "Cite the specific words or verse fragment that led to this identification. If unidentified, explain why (e.g., 'Fragmentary text').",
                }
              },
              required: ["detectedSource", "section", "briefExplanation"],
            },
            regionInfo: {
              type: Type.OBJECT,
              properties: {
                region: {
                   type: Type.STRING,
                   description: "The estimated geographical region of origin (e.g., 'Thanjavur Maratha Court', 'Madurai/Pandya Nadu', 'Jaffna'). Return 'Uncertain' if clues are insufficient."
                },
                confidence: {
                    type: Type.STRING,
                    description: "High, Medium, or Low"
                },
                reasoning: {
                    type: Type.STRING,
                    description: "Brief reason for the regional attribution (e.g., 'Use of specific dialect word', 'Mention of local deity')."
                }
              },
              required: ["region", "confidence", "reasoning"],
            }
          },
          required: ["rawOCR", "transcription", "translation", "sourceInfo", "regionInfo"],
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