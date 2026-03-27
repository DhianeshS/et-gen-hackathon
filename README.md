# FinMentor AI

A modern, full-stack personal finance web application built with **React** (Vite), **Tailwind CSS**, and a **Node.js/Express** backend.

## 🌟 Tech Stack
*   **Frontend**: React.js structured with Vite, styling powered by Tailwind CSS. UI inspired by sleek fintech platforms featuring dark headliners and purple gradient aesthetics (`#7C3AED` to `#A855F7`).
*   **Backend**: Node.js & Express API routing to handle AI responses. Structured natively for Serverless deployment.
*   **Deployment**: Fully configured for **Vercel** (`vercel.json` included).
*   **AI Readiness**: Chat endpoint (`/api/chat`) is pre-structured to accept OpenAI API calls.

## 🚀 Features
1.  **Centered Authentication Flow:** Features secure Google Login UI architecture, with upcoming Email/OTP & UPI tabs. 
2.  **Dashboard Chat Interface:** A robust ChatGPT-style interface acting as your FinMentor AI.
3.  **Core AI Logic (Mocked & Extensible):**
    *   *Money Health Score*: Evaluates standard financial health metrics.
    *   *FIRE Capability*: Projects multi-decade math for Financial Independence Retire Early.
    *   *Mutual Fund Assessor*: Built to flag overlap and high-expense ratios.

## 🛠️ Installation & Local Setup

**Prerequisites:** You must have [Node.js / npm](https://nodejs.org/en) installed.

1.  **Dependencies:** Running this command at the root will install dependencies for both the React client and Express server:
    ```bash
    npm install
    ```
2.  **Local Development:**
    Currently, you can run the Express server and Vite frontend separately:
    ```bash
    # Run the frontend (Vite)
    npm run dev

    # Run the backend (Express API)
    npm start
    ```

## 🌍 Vercel Deployment

This repository is **Vercel-ready**.
A `vercel.json` configuration file exists at the root. When pushing to a Vercel-linked GitHub repository, Vercel will automatically:
1.  Build the React app into static files.
2.  Serve the `api/index.js` Express file as a backend serverless function for any `/api/*` endpoints.

## 🧠 Core Architecture (The "Working Body")

To understand or extend the core functional body of the application, follow these steps and reference the corresponding files:

### Step 1: Environment Definition (`.env`)
The entire AI engine is powered by external LLMs. You must provide a Google Gemini API Key.
*   **File:** `.env`
*   **Action:** Add `GEMINI_API_KEY="your-key-here"`. This is required for the backend to instantiate the AI model.

### Step 2: The Backend API Engine (`api/`)
The working body of the data processing happens securely on the server side (or Vercel Serverless Function).
*   **File:** `api/index.js` - This serves as the Express.js entry point. It handles CORS, parses JSON requests, and routes traffic. It listens on port 3001 during local development.
*   **File:** `api/chat.js` - This is the "brain" route. It receives the user's prompt via POST request, formats the strict system instructions (e.g., "Act as a FIRE financial advisor..."), queries the `@google/genai` model, and returns a stripped markdown response to the client.

### Step 3: Frontend Layout & Auth (`src/`)
*   **File:** `src/main.jsx` & `src/index.css` - Mounts the React tree and defines global Tailwind animations (like the infinite `bg-revolve` background loop).
*   **File:** `src/App.jsx` - Acts as the core App controller. It holds the `user` authentication state and renders the `LoginCard.jsx` gate. Once logged in, it passes the session down to the `Dashboard`.
*   **File:** `src/components/LoginCard.jsx` - The Glassmorphism gatekeeper. It holds the Age-Gate logic (checking if Date of Birth implies > 18 years old) and the Mock UPI integration flow.

### Step 4: The Interactive AI Dashboard (`src/components/Dashboard.jsx`)
*   **File:** `src/components/Dashboard.jsx` - The primary working body for the user view. It tracks the `messages` array in state. If the array is empty, it renders the rich "Zero-State" UI (the glass card with feature grids and expertise toggles). When a user types a prompt or clicks a toggle, it calls `handleSend()`, which triggers an async `fetch('/api/chat')` securely to step 2, pushing the AI's response straight into the UI queue.
