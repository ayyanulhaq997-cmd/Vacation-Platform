
import { GoogleGenAI } from "@google/genai";

// Fix: Instantiate GoogleGenAI inside functions to ensure process.env.API_KEY is accessed correctly and follows best practices for tool/state management
export const getPropertyAiAdvice = async (propertyTitle: string, userNeeds: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is interested in "${propertyTitle}". They said: "${userNeeds}". 
      As a virtual travel concierge, explain why this property is a good fit for them or what they should know. 
      Keep it brief and encouraging (under 100 words).`,
    });
    // Fix: Access response.text property directly as per Gemini API rules
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my AI brain right now, but this property looks lovely!";
  }
};

export const generateSmartDescription = async (details: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on these details: "${details}", write a catchy, vibrant property description for a vacation rental website. Include a few highlights.`,
    });
    // Fix: Access response.text property directly as per Gemini API rules
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return details;
  }
};
