/**
 * MOCK BACKEND SERVICE
 * Simulates a full backend server (Node.js/Express) interaction for hackathon demonstration.
 * In a real application, these functions would be API endpoints (`fetch('/api/login')`).
 */

const BackendAPI = {
  // DB Mock
  activeUsers: {},

  /**
   * Endpoint: /api/login
   * Simulates user authentication and registers login on the backend.
   */
  async login(name, email) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userId = 'u_' + Date.now();
        const user = { id: userId, name, email, loggedInAt: new Date().toISOString() };
        
        // Register in backend memory
        this.activeUsers[userId] = user;
        
        // Log in backend console
        console.log(`[BACKEND SERVER] User logged in: ${name} (${email})`);

        resolve({
          status: 'success',
          user: user,
          backendMessage: `Server logged your login at ${user.loggedInAt}`
        });
      }, 600); // simulate network latency
    });
  },

  /**
   * Endpoint: /api/chat
   * Core AI Financial Mentor logic engine.
   * Applies the specific logic models based on the prompt.
   */
  async chat(message, userContext) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let responseText = "";
        let msgLower = message.toLowerCase();

        // 1. MODULE: Money Health Score
        if (msgLower.includes("health score") || msgLower.includes("money health")) {
          // Mocking logic based on conservative rules
          responseText = `
**Direct Answer:** Your Money Health Score is currently **72/100**.
**Financial Logic:** Based on conservative Indian estimates: 
- Savings Rate: 20% (18 pts)
- Emergency Fund: 3 months (12 pts)
- Debt Load: EMI at 15% income (20 pts)
- Investments: Irregular (10 pts)
- Insurance: Health + Term (12 pts)
*Strengths*: Excellent debt-to-income ratio.
*Weakness*: Emergency fund below ideal 6 months.
**Action Step:** Increase emergency fund to ₹3L (6 months expenses) before starting new SIPs.`;
        }
        
        // 2. MODULE: Life Event Advisor (e.g. Car, Home)
        else if (msgLower.includes("car") && msgLower.includes("afford")) {
          responseText = `
**Direct Answer:** Yes, if your income supports the EMI comfortably.
**Financial Logic:** A ₹10L car ≈ ₹22,000/month EMI for 5 years. Safe EMI limits dictate this should be ≤15-20% of your net income, meaning you strictly need an income of ~₹1.1L - ₹1.5L/month.
**Action Step:** If your income is below ₹1.1L, reduce the car budget to avoid cash flow stress and damaging your savings rate.`;
        }
        else if (msgLower.includes("plan for") || (msgLower.includes("lakh") && msgLower.includes("years"))) {
          responseText = `
**Direct Answer:** You will need approximately **₹36 Lakhs**.
**Financial Logic:** A ₹20L goal today, growing at a 6% Indian inflation rate, becomes ~₹36L in 10 years. To achieve this, a monthly SIP of ₹15,000–₹18,000 is needed at an assumed 12% equity return.
**Action Step:** Start a SIP of ₹15K today in a Flexi-Cap or Nifty 50 Index Equity mutual fund since this is a long-term goal (>7 years).`;
        }

        // 3. MODULE: MF Portfolio X-Ray
        else if (msgLower.includes("mf") || msgLower.includes("portfolio") || msgLower.includes("x-ray")) {
          responseText = `
**Direct Answer:** Your portfolio risk level is currently **Moderate to High**.
**Financial Logic:** Analyzing standard beginner portfolios: Having >4 funds creates 'portfolio overlap' (you own the same stocks multiple times). Heavy weights in small-cap funds increase volatility.
*Key Issue:* Too many funds spanning identical categories.
**Action Step:** Consolidate your portfolio to a simple 3-fund setup: 1 Nifty 50 Index Fund, 1 Flexi-Cap, and 1 Debt/Liquid Fund for safety.`;
        }

        // 4. Default / Fallback AI routing
        else {
          responseText = `
**Direct Answer:** That's an interesting financial question, but I need a bit more context.
**Financial Logic:** As your AI Mentor, I always use a conservative 6% inflation, 10-12% equity return, and advocate for 3-6 months emergency savings. 
**Action Step:** Could you specify your monthly income or the timeline of your goal so I can give you an exact mathematical calculation?`;
        }

        resolve({
          status: 'success',
          reply: responseText
        });
      }, 1200); // simulate generation time
    });
  }
};
