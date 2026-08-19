import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. AI Route Efficiency & Optimization Analysis
app.post("/api/ai/optimize-routes", async (req, res) => {
  try {
    const { fleetData, zonesData, cityCoveragePercent, activeAlerts } = req.body;

    const prompt = `
You are an expert Municipal Smart City Logistics and Fleet Routing Analyst.
Analyze the following real-time municipal waste collection data:

City Coverage: ${cityCoveragePercent}%
Active Trucks: ${JSON.stringify(fleetData || [])}
Zone Statuses: ${JSON.stringify(zonesData || [])}
Current Obstacles/Alerts: ${JSON.stringify(activeAlerts || [])}

Provide a comprehensive, high-value route efficiency report in JSON with this exact schema:
{
  "efficiencyScore": number (0-100),
  "summary": string (2-3 concise sentences),
  "bottlenecks": [
    { "zone": string, "issue": string, "impact": string, "severity": "low" | "medium" | "high" }
  ],
  "recommendations": [
    { "action": string, "targetTruck": string, "expectedTimeSavedMinutes": number, "fuelSavedLiters": number, "reasoning": string }
  ],
  "dynamicRerouteSuggestions": [
    { "truckId": string, "currentZone": string, "suggestedZone": string, "priorityStreets": string[] }
  ],
  "estimatedCityCompletion": string (e.g. "16:45 PM today, 18 min ahead of baseline")
}
Ensure actionable, realistic municipal fleet advice.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error optimizing routes:", error);
    res.status(500).json({
      error: "Failed to generate route optimization",
      fallback: {
        efficiencyScore: 88,
        summary: "Current fleet progress is on track with 3 high-density zones nearing completion. Minor congestion on Grand Blvd can be bypassed by diverting Truck T-102 through Oakridge corridor.",
        bottlenecks: [
          { zone: "Ward 5 (Downtown)", issue: "Heavy delivery traffic delaying curb stops", impact: "+12 min delay", severity: "medium" }
        ],
        recommendations: [
          { action: "Dynamic load balancing", targetTruck: "T-104 (Recycling)", expectedTimeSavedMinutes: 15, fuelSavedLiters: 4.2, reasoning: "Transfer remaining 8 commercial stops in Ward 1 to T-106 after depot dump." }
        ],
        dynamicRerouteSuggestions: [
          { truckId: "T-102", currentZone: "Ward 5", suggestedZone: "Ward 4", priorityStreets: ["Sunset Terrace", "Pinehurst Way"] }
        ],
        estimatedCityCompletion: "16:30 PM (On Target)"
      }
    });
  }
});

// 2. AI Resident Broadcast Notice Generator
app.post("/api/ai/generate-broadcast", async (req, res) => {
  try {
    const { zoneName, issueType, delayMinutes, affectedStreets, weatherCondition } = req.body;

    const prompt = `
You are the Public Communications Officer for City Municipal Waste Management.
Generate a polite, clear, and reassuring resident broadcast notification regarding waste collection timings.

Context:
- Affected Zone/Ward: ${zoneName || "Citywide"}
- Situation: ${issueType || "Schedule Update"}
- Delay / Time Shift: ${delayMinutes ? delayMinutes + " minutes delay" : "On schedule"}
- Affected Key Streets: ${(affectedStreets || []).join(", ") || "All neighborhood streets"}
- Weather/Road condition: ${weatherCondition || "Clear"}

Generate a JSON object with:
{
  "smsText": string (under 160 characters, urgent & clear with key timing),
  "pushTitle": string (punchy title under 40 characters),
  "pushBody": string (2 sentences with action instruction for bin roll-out),
  "emailSubject": string,
  "emailHtmlSnippet": string (formatted bullet points with instructions for residents),
  "recommendedAction": string (e.g. "Leave bins out until 18:00" or "Cover organic bins due to wind")
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error generating broadcast:", error);
    res.status(500).json({
      smsText: `MuniTrack Alert [${req.body.zoneName || "Your Area"}]: Waste collection running ~${req.body.delayMinutes || 15}m behind. Please keep bins curbside.`,
      pushTitle: `Pickup Timing Update - ${req.body.zoneName || "Ward Area"}`,
      pushBody: `Collection truck is currently on route. Estimated arrival shifted by ${req.body.delayMinutes || 15} mins. We appreciate your patience!`,
      emailSubject: `Important: Updated Waste Collection Schedule for ${req.body.zoneName || "Your Street"}`,
      emailHtmlSnippet: `<p>Dear Resident,</p><p>Due to scheduled route optimization, today's collection truck will arrive approximately ${req.body.delayMinutes || 15} minutes later than usual.</p><ul><li>Please leave bins at the curb until 6:00 PM</li><li>Ensure lids are securely closed</li></ul>`,
      recommendedAction: "Keep bins curbside until collection confirmation"
    });
  }
});

// 3. AI Resident Q&A / Virtual Assistant
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { question, userAddress, userZone, activeTruckInfo } = req.body;

    const prompt = `
You are "MuniBot", the friendly, knowledgeable municipal waste tracking assistant for the city.
User Question: "${question}"
User Context:
- Address: ${userAddress || "Main Street"}
- Ward/Zone: ${userZone || "Ward 3 - Highland"}
- Real-time Truck Telemetry: ${JSON.stringify(activeTruckInfo || {})}

Guidelines:
- Answer accurately about truck arrival timing, bin colors (Green = Organics, Blue = Recyclables, Black = General, Yellow = E-Waste/Hazards), bulk item rules, and missed pickups.
- Keep response concise, friendly, and practical (2-4 paragraphs or formatted bullet points).
- If asking about timing, reference the real-time truck position and ETA.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Error in AI assistant:", error);
    res.status(500).json({
      answer: "Hello! Our municipal collection trucks are currently active across all wards. In your area, collection is progressing on schedule. For bulky items or missed bins, you can use the instant ticket logger above!"
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MuniTrack Server running on http://localhost:${PORT}`);
  });
}

startServer();
