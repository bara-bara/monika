import express from 'express';
import 'dotenv/config'; 
import { GoogleGenAI } from '@google/genai';

// --- Configuration ---
const app = express();
app.use(express.json());

// Initialize the Gemini Client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  // Vercel handles this via environment variables
  throw new Error("GEMINI_API_KEY is not set.");
}
const ai = new GoogleGenAI(GEMINI_API_KEY);
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

// --- REST Endpoint Logic (Handles POST request to /api/chat) ---
app.post('/api/chat', async (req, res) => {
  const { userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required.' });
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
      // It's a function call request
      responseData.text = `I see you're looking to ${functionCall.name.replace('_', ' ')}! I've prepared the details.`;
      responseData.function_call = functionCall;
    } else {
      // It's a standard text response
      responseData.text = response.text;
    }

    res.json(responseData);

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with Monika AI.' });
  }
});

// Vercel requires the app (router) to be exported.
export default app;
