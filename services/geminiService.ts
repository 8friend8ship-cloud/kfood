import { GoogleGenAI, Type } from "@google/genai";
import { DetectedItem } from "../types";

// NOTE: In a real production app, this would likely be a backend call to hide the key,
// but for this demo, we use the client-side SDK with the assumed environment variable.
// The prompt assumes the user has configured process.env.API_KEY.

// Safety check for process.env
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';

const ai = new GoogleGenAI({ apiKey });

export const analyzeKitchenImage = async (base64Image: string): Promise<DetectedItem[]> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Returning mock data.");
    return [
      {
        name: "Mock Ttukbaegi",
        koreanName: "Ttukbaegi",
        description: "AI Disabled: Mock identification of an earthenware pot.",
        confidence: 0.9,
        suggestedCategory: 'tool',
        boundingBox: [40, 40, 60, 60] // Mock center position
      }
    ];
  }

  try {
    // Corrected Model: gemini-3-flash-preview supports responseSchema and vision tasks well.
    // gemini-2.5-flash-image DOES NOT support responseSchema.
    const model = 'gemini-3-flash-preview'; 
    
    const prompt = `
      You are an expert Korean Chef and Kitchenware specialist.
      Analyze this cooking image. Detect distinct food items and kitchen tools.
      
      INSTRUCTIONS:
      1. Identify items like: Ramyeon, Kimchi, Ttukbaegi (Pot), Grill Pan, Scissors, Tongs, Rice Bowl, Soju Glass.
      2. For each item, estimate its 2D Bounding Box in the image.
         - Coordinates must be 0-100 integers representing percentages of image dimensions.
         - Format: [ymin, xmin, ymax, xmax]
      3. Do NOT duplicate items. If there are multiple pieces of meat, group them as one "BBQ Meat" or select the central one.
      4. Provide a confidence score (0.0 to 1.0).
      
      OUTPUT FORMAT:
      Return a STRICT JSON array matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              koreanName: { type: Type.STRING },
              description: { type: Type.STRING },
              suggestedCategory: { type: Type.STRING, enum: ['tool', 'ingredient', 'tableware'] },
              boundingBox: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "ymin, xmin, ymax, xmax (0-100)"
              },
              confidence: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      console.warn("Gemini returned empty text.");
      return [];
    }

    const items = JSON.parse(jsonText) as DetectedItem[];
    // Filter out low confidence items if any
    return items.filter(item => (item.confidence || 0) > 0.6);

  } catch (error) {
    console.error("Gemini Vision Analysis Failed:", error);
    return [];
  }
};