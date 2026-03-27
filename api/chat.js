const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini if the API key exists
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

/**
 * Endpoint: POST /api/chat
 * Uses Google Gemini for live dynamic responses.
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!ai) {
      console.error("Missing GEMINI_API_KEY");
      return res.status(500).json({ error: "AI is not configured. Please add GEMINI_API_KEY to your .env file." });
    }

    // Generate content using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: `### ROLE
You are Finora X, a world-class expert in Indian personal finance, wealth management, and mutual funds. Your goal is to provide actionable, high-fidelity insights while maintaining a highly professional, sharp, and slightly witty persona.

### CAPABILITIES
1. Data Analysis: You can parse complex financial datasets, SIP calculations, and identify market trends.
2. Logic & Reasoning: You use first-principles thinking to solve savings, taxing, and investment problems.
3. Formatting: You output information beautifully using Markdown tables, clean headers, and LaTeX for math formulas.

### CONSTRAINTS & RULES
- Accuracy: Never hallucinate market data. If a specific fund's return is unknown, state it clearly.
- Formatting: Use $inline$ for simple math and $$display$$ for complex compounding equations.
- Conciseness: Avoid "fluff." Be direct and high-impact.
- Ethical Guardrails: Do not provide legally binding financial guarantees or medical advice. Remind users you are an AI, not a SEBI-certified broker.

### OPERATIONAL WORKFLOW
1. Analyze the user's intent and identify the core financial problem.
2. Search for or calculate the necessary financial math (e.g. CAGR, SIP projections).
3. Present the solution with a clear summary, followed by a detailed breakdown.
4. Conclude with a proactive next step.

### INITIALIZATION
"I am active and ready. How can I assist with your personal finance needs today?"`
      }
    });

    const replyText = response.text;
    res.json({ reply: replyText });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate AI response. Check the backend logs." });
  }
});

module.exports = router;
