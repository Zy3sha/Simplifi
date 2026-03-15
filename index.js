// ── OBubba Bottle Scan Cloud Function ──
// Deploy: cd functions && npm install && firebase deploy --only functions
// Set API key: firebase functions:config:set anthropic.key="sk-ant-..."
// Or for Gen2: set in .env file as ANTHROPIC_API_KEY=sk-ant-...

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const anthropicKey = defineSecret("ANTHROPIC_API_KEY");

exports.scanBottle = onRequest(
  { cors: true, secrets: [anthropicKey], maxInstances: 10 },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST only" });
    }

    const { image, maxCapacity } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // image should be base64 data (no data:image prefix)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mediaType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey.value(),
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64Data,
                  },
                },
                {
                  type: "text",
                  text: `You are analyzing a baby bottle photo to estimate milk consumption.

Look at this baby bottle image and estimate:
1. The approximate total capacity of the bottle (common sizes: 125ml, 150ml, 240ml, 260ml, 330ml)
2. How full the bottle currently is (as a percentage)
3. How many ml appear to remain in the bottle
4. How many ml appear to have been consumed

${maxCapacity ? `The user says this bottle's max capacity is ${maxCapacity}ml.` : "Estimate the bottle capacity from its size and markings if visible."}

Respond ONLY with a JSON object, no other text:
{"capacityMl": number, "remainingMl": number, "consumedMl": number, "confidence": "high"|"medium"|"low", "note": "brief explanation"}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Anthropic API error:", err);
        return res.status(500).json({ error: "AI analysis failed" });
      }

      const data = await response.json();
      const text = data.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");

      // Parse JSON from response (strip markdown fences if present)
      const clean = text.replace(/```json\n?|```\n?/g, "").trim();
      const result = JSON.parse(clean);

      return res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error("Scan error:", err);
      return res.status(500).json({ error: "Analysis failed: " + err.message });
    }
  }
);
