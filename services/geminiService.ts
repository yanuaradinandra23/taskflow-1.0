
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization to prevent app crash on load if API key is missing
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will not work.");
    throw new Error("API Key missing. Please configure process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSubtasks = async (taskText: string): Promise<string[]> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down the following task into 3-5 smaller, actionable subtasks. Keep them concise. Task: "${taskText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    const parsed = JSON.parse(jsonText);
    return parsed.subtasks || [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const generateDailyPlan = async (tasks: string[]): Promise<string> => {
  try {
    const ai = getAiClient();
    const tasksList = tasks.join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I have these tasks to do: [${tasksList}]. Create a concise, motivated 1-paragraph summary plan on how I should tackle my day. Suggest which one to do first ("Eat the Frog"). Do not use markdown formatting, just plain text.`
    });
    return response.text || "Focus on your highest priority task first.";
  } catch (error) {
    console.warn("Gemini API Error (Daily Plan):", error);
    return "Could not generate plan at this time.";
  }
};
