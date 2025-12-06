import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Player, MatchRound, PredictionScenario, PREDICTION_ROUNDS } from "../types";

export const generatePrediction = async (
  players: Player[],
  history: MatchRound[]
): Promise<PredictionScenario[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const opponentPlayers = players.filter(p => !p.isUser);
  
  // Get the ordered list of opponents fought in the current cycle
  const historyNames = history
    .filter(h => h.opponentId !== null)
    .map(h => {
      const p = players.find(player => player.id === h.opponentId);
      return p ? p.name : null;
    })
    .filter((name): name is string => name !== null);

  const foughtOpponentIds = new Set(history.filter(h => h.opponentId !== null).map(h => h.opponentId));
  
  // Calculate who hasn't been fought yet in the current cycle
  const remainingInPool = opponentPlayers.filter(p => !foughtOpponentIds.has(p.id));
  const remainingNames = remainingInPool.map(p => p.name);
  
  const roundsToPredict = PREDICTION_ROUNDS.join(", ");

  // We explicitly construct the prompt to force the "Cycle Repeat" algorithm
  // Algorithm: 
  // 1. Current Cycle Completion = [Remaining Opponents]
  // 2. Next Cycle = [History Order] + [Remaining Opponents Order] (Repeated)
  const prompt = `
    You are a logic engine for "Magic Chess: Go Go". 
    Execute the "Cycle Repeat Algorithm" to predict the next opponents.

    ### INPUT DATA
    1. **Ordered History (Current Cycle)**: [${historyNames.join(", ")}]
    2. **Remaining Opponents (To complete Cycle)**: [${remainingNames.join(", ")}]
    3. **Rounds to Predict**: ${roundsToPredict}

    ### ALGORITHM INSTRUCTIONS
    You must generate exactly 2 Scenarios based on the order of the remaining opponents.

    **SCENARIO 1**
    *   **Set scenarioName**: "POSSIBILITY A: STANDARD ORDER"
    1.  **Immediate Rounds**: Assign the **Remaining Opponents** in the order: [${remainingNames.join(", ")}].
    2.  **Define Cycle Sequence**: The full cycle order is defined as: [Ordered History] + [Remaining Opponents].
        *   Full Sequence = [${historyNames.join(", ")}] + [${remainingNames.join(", ")}]
    3.  **Subsequent Rounds**: Once the Immediate Rounds are finished, the next rounds MUST follow the **Full Sequence** from the beginning, looping indefinitely.

    **SCENARIO 2**
    *   **Set scenarioName**: "POSSIBILITY B: REVERSE ORDER"
    1.  **Immediate Rounds**: Assign the **Remaining Opponents** in **REVERSE** order: [${[...remainingNames].reverse().join(", ")}].
    2.  **Define Cycle Sequence**: The full cycle order is defined as: [Ordered History] + [Reverse Remaining Opponents].
        *   Full Sequence = [${historyNames.join(", ")}] + [${[...remainingNames].reverse().join(", ")}]
    3.  **Subsequent Rounds**: Once the Immediate Rounds are finished, the next rounds MUST follow the **Full Sequence** from the beginning, looping indefinitely.

    ### OUTPUT
    Return the result strictly as JSON.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        scenarioName: { type: Type.STRING },
        matches: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              round: { type: Type.STRING },
              opponentName: { type: Type.STRING },
            },
            required: ["round", "opponentName"],
          },
        },
      },
      required: ["scenarioName", "matches"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1, // Low temp for logic strictness
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as PredictionScenario[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate prediction.");
  }
};
