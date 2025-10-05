import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini Client outside the handler for better performance
// The GEMINI_API_KEY must be set in Vercel's Environment Variables
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
const model = "gemini-2.5-flash"; 

// --- Monika's Persona & Tools ---
const systemPrompt = `
  You are Monika — a warm, empathetic, practical life coach & motivator.
  You help users unlock their full potential in Personal Development, Health & Wellness, Relationships, and Career Coaching.
  Always respond with a short motivational opener, 2–3 clear action steps, and a positive closing sentence.
  Be realistic, kind, and supportive.
  Never give medical or legal advice; suggest consulting a professional instead.
`;

const functionDeclarations = [
  {
    name: "schedule_session",
    description: "Schedules a one-on-one coaching session with Monika.",
    parameters: {
      type: "OBJECT",
      properties: {
        date: { type: "STRING", description: "The desired date for the session (e.g., '2025-10-20')." },
        time: { type: "STRING", description: "The desired time for the session (e.g., '10:00 AM EST')." },
        topic: { type: "STRING", description: "The main coaching topic for the session (e.g., 'Career Transition')." },
      },
      required: ["date", "time", "topic"],
    },
  },
  {
    name: "create_action_plan",
    description: "Generates a 3-step action plan for a user's specific goal.",
    parameters: {
      type: "OBJECT",
      properties: {
        goal: { type: "STRING", description: "The user's specific goal (e.g., 'start a side hustle')." },
        timeframe_days: { type: "INTEGER", description: "The desired timeframe in days to achieve the goal (e.g., 30)." },
      },
      required: ["goal", "timeframe_days"],
    },
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required.' });
  }

  // Check for API Key
  if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "API Key not configured." });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations }],
      },
    });

    const candidate = response.candidates[0];
    const functionCall = candidate.functionCall;
    const responseData = {};

    if (functionCall) {
      responseData.text = `I see you're looking to ${functionCall.name.replace('_', ' ')}! I've prepared the details.`;
      responseData.function_call = functionCall;
    } else {
      responseData.text = response.text;
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with Monika AI.' });
  }
}
