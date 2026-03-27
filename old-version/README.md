# AI Financial Mentor

An AI-powered Financial Mentor web application designed to help users track their money health score, plan for life events, and get a mutual fund portfolio x-ray. This project is built using vanilla HTML, CSS, and JavaScript.

## 🚀 Features

*   **User Authentication (Mock):** Simple login interface that registers a user session and personalizes the dashboard.
*   **Personalized Dashboard:** Displays user details and status upon successful login.
*   **Financial Mentor Chat:** An interactive chat interface simulating an AI financial advisor.
*   **Mock Backend Capabilities:** The "AI" is powered by a mock backend (`mock-backend.js`) demonstrating different financial models:
    *   **Money Health Score:** Evaluates savings rate, emergency funds, debt load, etc. (*Try asking: "What is my money health score?"*)
    *   **Life Event Advisor:** Calculates affordability for major purchases like a car or long-term goals. (*Try asking: "Can I afford a 10L car?" or "Plan for 20 Lakh in 10 years"*)
    *   **MF Portfolio X-Ray:** Analyzes mutual fund portfolios for overlap and risk. (*Try asking: "Portfolio x-ray"*)

## 📂 Project Structure

*   `index.html`: The main entry point containing the UI structure for the login screen and dashboard.
*   `styles.css`: All the CSS styling for the application.
*   `main.js`: Frontend logic handling DOM manipulation, event listeners, UI state transitions, and chat UI updates.
*   `mock-backend.js`: Simulates a backend API. It contains the core logic and artificial delays to mimic network latency.

## 🛠️ Installation & Setup

While this application uses vanilla JavaScript, serving it via a local web server is recommended for the best experience and to avoid local file viewing issues.

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your machine (to use npm).

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd "et gen hackathon"
   ```

2. **Install project dependencies:**
   This will install the local development server (serve).
   ```bash
   npm install
   ```

### Running the Application

1. **Start the application:**
   Inside your project directory, run this command to start the server:
   ```bash
   npm start
   ```

2. **Access it in your browser:**
   The terminal will provide a local URL (typically `http://localhost:3000`). Open that link to view the AI Financial Mentor app.

> **Note:** Alternatively, you can install the **Live Server** extension in VS Code. Simply right-click `index.html` and select **"Open with Live Server"**.

## 💡 Usage Example

1.  Launch the app by opening `index.html`.
2.  Enter any name and email on the login screen.
3.  Click **Connect to Mentor**.
4.  Once in the dashboard, interact with the AI Mentor by pasting or typing one of the example queries mentioned in the Features section.

## ⚠️ Disclaimer

*Note: This is an AI mentor simulation created for a hackathon. The financial advice provided is mocked and should not be considered as advice from a SEBI-registered financial advisor.*
