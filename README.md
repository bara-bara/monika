# 🧘‍♀️ Monika AI Life Coach

A personal AI assistant for a life coach built with the Gemini API, Node.js/Express Serverless Functions, and a React (Vite) frontend.

## Features

- **Personalized Persona:** Monika is a warm, empathetic, and practical life coach with a custom system prompt.
- **Vercel-Optimized Backend:** Uses a Node.js/Express Serverless Function (`backend/api/chat.js`) for seamless deployment on Vercel.
- **Function Calling:** Supports two tools: `schedule_session` and `create_action_plan`.
- **Frontend UI:** A simple React application for a clean chat experience.

## 🚀 Deployment Guide (Vercel)

This project is a monorepo optimized for Vercel, where the frontend is served as static files and the backend runs as a Serverless Function.

### Step 1: Project Setup

1.  **Clone/Download:** Clone this repository to your local machine.
2.  **Install Dependencies:**
    * **Frontend:** Navigate to the `frontend` directory and run `npm install`.
    * **Backend:** Navigate to the `backend` directory and run `npm install`.
3.  **Local Testing (Optional):**
    * In one terminal, run the backend: `cd backend && npm start` (The endpoint will be /api/chat).
    * In another terminal, run the frontend: `cd frontend && npm run dev`.

### Step 2: Vercel Configuration

1.  **Commit and Push:** Commit all files (except `.env`) to a new Git repository and push it to GitHub.
2.  **Import to Vercel:** Go to Vercel and import your new GitHub repository.
3.  **Configure Project Settings:**
    * **Root Directory:** Set this to **`frontend`**. This tells Vercel where the main web application is located.
4.  **Set Environment Variables:**
    * Go to **Settings -> Environment Variables** in your Vercel project dashboard.
    * Add a new variable:
        * **Name:** `GEMINI_API_KEY`
        * **Value:** `[Your Google Gemini API Key]`
        * **Scope:** Production, Preview, Development

### Step 3: Deploy

Click **Deploy**. Vercel will automatically:
1.  Build the React app in the `frontend` directory.
2.  Detect the `/api` directory within the `backend` folder and create a Serverless Function at the path `/api/chat`.
3.  The frontend will communicate with the backend using the relative path `/api/chat`.

## How to Test Function Calling

Monika will suggest using a tool based on your request. Try the following prompts in the chat:

1.  **Test `schedule_session`:**
    > "I need to book a coaching session next Friday at 2 PM to talk about getting a raise."
2.  **Test `create_action_plan`:**
    > "I want you to help me make a 30-day plan for starting a healthy new workout routine."
