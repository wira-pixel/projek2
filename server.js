const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

// Ganti dengan URL Apps Script kamu
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx1kD07f-_BVkxViuHSN5As_qOqCDdBMcUpoPd53MvgFSyuZxwgdUFMBLHwDacofSm9/exec";

// Proxy endpoint
app.post("/send", async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.text();

    // CORS header
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle OPTIONS request (preflight)
app.options("/send", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.send();
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Proxy server berjalan");
});
