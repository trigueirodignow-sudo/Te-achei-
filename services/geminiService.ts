
import {GoogleGenAI} from "@google/genai";
import { Coordinates, Language } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  userLocation?: Coordinates,
  lang: Language = 'pt'
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    
    const enhancedInstruction = SYSTEM_INSTRUCTION(lang);
    
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: enhancedInstruction, 
        tools: [{ googleMaps: {} }],
        toolConfig: userLocation
          ? {
              retrievalConfig: {
                latLng: {
                  latitude: userLocation.lat,
                  longitude: userLocation.lng,
                },
              },
            }
          : undefined,
      },
      history: history,
    });

    let finalMessage = message;
    if (userLocation) {
      finalMessage += `\n\n[Context Location - Lat: ${userLocation.lat}, Long: ${userLocation.lng}]`;
    }

    const response = await chat.sendMessage({ message: finalMessage });
    return response.text || "...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
