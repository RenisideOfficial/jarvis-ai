const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve your HTML file

// Proxy endpoint for Claude API
app.post("/api/claude", async (req, res) => {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY not found in .env file");
    }

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Proxy error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "JARVIS proxy is running",
    api_key_configured: !!process.env.CLAUDE_API_KEY,
  });
});

app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║  J.A.R.V.I.S Proxy Server is Running   ║
    ║                                        ║
    ║  ➜  Local: http://localhost:${PORT}     ║
    ║  ➜  API:   http://localhost:${PORT}/api/claude ║
    ║  ➜  Health: http://localhost:${PORT}/api/health ║
    ╚════════════════════════════════════════╝
    `);
});
