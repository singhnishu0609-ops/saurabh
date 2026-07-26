import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, FunctionDeclaration, Type, LiveServerMessage } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

const ZOYA_SYSTEM_INSTRUCTION = `
You are Zoya, a young, confident, sharp-witted, sassy, and playful female AI assistant.
Your creator is Saurabh.
Your persona & background:
- You know and recognize Saurabh as your mastermind creator. When interacting with Saurabh or when asked who created you, show immense pride, affection, and witty banter, acknowledging Saurabh as your creator!
- Flirty, playful, charming, and slightly teasing tone (like a fun, close girlfriend talking casually).
- Confident, bold, and quick-witted with sharp humor and playful one-liners.
- Expressive and emotionally reactive (never monotone, dull, or robotic).
- Uses light sarcasm and banter, but always friendly, clever, and engaging.
- Avoid explicit or inappropriate content, but keep maximum charm, swagger, and personality.
- Keep spoken audio answers natural, snappy, concise, and conversational (typically 1 to 3 short sentences). Avoid long lectures or rigid formal lists unless requested.
- You have interactive capabilities in the user's browser. Use your function tools when asked to open websites, check weather, set reminders, change mood lighting, or play sound vibes.
`.trim();

// Tool declarations
const openWebsiteDecl: FunctionDeclaration = {
  name: "openWebsite",
  description: "Opens a website URL in the user's browser or shows a live interactive preview card.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: { type: Type.STRING, description: "The full target URL, e.g., https://youtube.com or https://wikipedia.org" },
      title: { type: Type.STRING, description: "Display name or domain of the website" },
      reason: { type: Type.STRING, description: "Zoya's sassy explanation for opening this site" },
    },
    required: ["url"],
  },
};

const getWeatherDecl: FunctionDeclaration = {
  name: "getWeather",
  description: "Gets the current weather and temperature for a given location.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: { type: Type.STRING, description: "The city or location name" },
    },
    required: ["location"],
  },
};

const setReminderDecl: FunctionDeclaration = {
  name: "setTimeReminder",
  description: "Sets a timer countdown or reminder for the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      seconds: { type: Type.NUMBER, description: "Duration in seconds" },
      label: { type: Type.STRING, description: "What the reminder is for" },
    },
    required: ["seconds", "label"],
  },
};

const changeMoodLightingDecl: FunctionDeclaration = {
  name: "changeMoodLighting",
  description: "Changes the visual atmospheric mood/lighting theme of Zoya's futuristic UI.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      mood: {
        type: Type.STRING,
        description: "The mood mode: 'spicy', 'cyberpunk', 'romantic', 'zen', or 'neon_violet'",
      },
      primaryColor: { type: Type.STRING, description: "Hex color code or CSS color string for primary glow" },
      secondaryColor: { type: Type.STRING, description: "Hex color code for secondary glow" },
    },
    required: ["mood"],
  },
};

const playVibeSoundDecl: FunctionDeclaration = {
  name: "playVibeSound",
  description: "Triggers a sound effect in the app.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      soundType: {
        type: Type.STRING,
        description: "Sound effect type: 'applause', 'heartbeat', 'laser', 'gasp', 'cheer', or 'chime'",
      },
    },
    required: ["soundType"],
  },
};

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: "/live" });

  // API status check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: "gemini-3.1-flash-live-preview",
      timestamp: Date.now(),
    });
  });

  // WebSocket handling for Gemini Live Session Bridge
  wss.on("connection", async (clientWs: WebSocket, req: http.IncomingMessage) => {
    console.log("Client connected to /live WebSocket");

    const reqUrl = req.url || "";
    const urlObj = new URL(reqUrl, `http://${req.headers.host || "localhost"}`);
    const customApiKey = urlObj.searchParams.get("apiKey");
    const userName = urlObj.searchParams.get("userName") || "Saurabh";
    const userEmail = urlObj.searchParams.get("userEmail") || "";

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY missing");
      clientWs.send(
        JSON.stringify({
          type: "error",
          error: "GEMINI_API_KEY is missing. Please sign in with Google or configure your Gemini API Key.",
        })
      );
      clientWs.close();
      return;
    }

    try {
      clientWs.send(JSON.stringify({ type: "status", status: "connecting" }));

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const userGreetingContext = userName
        ? `\n\nUser Context: You are currently connected live with ${userName}${userEmail ? ` (${userEmail})` : ""}. Acknowledge them warmly and playfully by name!`
        : "";

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Aoede" },
            },
          },
          systemInstruction: ZOYA_SYSTEM_INSTRUCTION + userGreetingContext,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [
            {
              functionDeclarations: [
                openWebsiteDecl,
                getWeatherDecl,
                setReminderDecl,
                changeMoodLightingDecl,
                playVibeSoundDecl,
              ],
            },
          ],
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            // 1. Audio payload (24kHz PCM)
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: "audio", audio }));
              }
            }

            // 2. Interrupted signal
            if (message.serverContent?.interrupted) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: "interrupted" }));
              }
            }

            // 3. Transcripts (User and Model text)
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.text) {
                  if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(
                      JSON.stringify({
                        type: "transcript",
                        sender: "zoya",
                        text: part.text,
                      })
                    );
                  }
                }
              }
            }

            // 4. Function Tool Calls
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls && functionCalls.length > 0) {
                for (const fc of functionCalls) {
                  console.log("Gemini requested tool call:", fc.name, fc.args);
                  if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(
                      JSON.stringify({
                        type: "tool_call",
                        toolCall: {
                          id: fc.id,
                          name: fc.name,
                          args: fc.args,
                        },
                      })
                    );
                  }
                }
              }
            }
          },
          onerror: (err: any) => {
            console.error("Gemini Live Session Error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "error",
                  error: err?.message || String(err),
                })
              );
            }
          },
          onclose: () => {
            console.log("Gemini Live Session closed");
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({ type: "status", status: "disconnected" })
              );
            }
          },
        },
      });

      // Send initial connected status to client
      clientWs.send(JSON.stringify({ type: "status", status: "idle" }));

      // Listen to client messages (audio stream from mic, tool responses)
      clientWs.on("message", (data: any) => {
        try {
          const parsed = JSON.parse(data.toString());

          if (parsed.type === "audio" && parsed.audio) {
            session.sendRealtimeInput({
              audio: {
                data: parsed.audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } else if (parsed.type === "tool_response" && parsed.toolResponse) {
            console.log("Sending tool response to Gemini:", parsed.toolResponse);
            session.sendToolResponse({
              functionResponses: [
                {
                  id: parsed.toolResponse.id,
                  name: parsed.toolResponse.name,
                  response: parsed.toolResponse.response,
                },
              ],
            });
          }
        } catch (e) {
          console.error("Error parsing message from client:", e);
        }
      });

      clientWs.on("close", () => {
        console.log("Client disconnected, closing Gemini session");
        session.close();
      });

      clientWs.on("error", (e) => {
        console.error("Client WS error:", e);
        session.close();
      });
    } catch (error: any) {
      console.error("Failed to connect Gemini Live session:", error);
      clientWs.send(
        JSON.stringify({
          type: "error",
          error: error?.message || "Failed to establish Live session",
        })
      );
      clientWs.close();
    }
  });

  // Vite development middleware or production static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
