import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { Player, Position, MatchResult, Team } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const generateSquadForTeam = async (teamName: string): Promise<Player[]> => {
  const model = 'gemini-2.5-flash';
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a realistic squad of 11-15 players for the Brazilian football team ${teamName}. Include a mix of positions. Current year context.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              position: { type: Type.STRING, enum: ["Goleiro", "Defensor", "Meio-Campo", "Atacante"] },
              rating: { type: Type.INTEGER, description: "Rating from 60 to 95 based on real life skill" },
              age: { type: Type.INTEGER },
              value: { type: Type.NUMBER, description: "Market value in millions of dollars, realistic" }
            },
            required: ["name", "position", "rating", "age", "value"]
          }
        }
      }
    });

    if (!response.text) throw new Error("No data returned");

    const rawPlayers = JSON.parse(response.text);
    
    return rawPlayers.map((p: any) => ({
      id: generateId(),
      name: p.name,
      position: p.position as Position,
      rating: p.rating,
      age: p.age,
      value: p.value,
      team: teamName
    }));
  } catch (error) {
    console.error("Error generating squad:", error);
    // Fallback data if API fails
    return [
        { id: '1', name: 'Jogador Genérico 1', position: Position.ATT, rating: 75, age: 22, value: 5, team: teamName },
        { id: '2', name: 'Goleiro Genérico', position: Position.GK, rating: 70, age: 28, value: 2, team: teamName },
    ];
  }
};

export const generateTransferMarket = async (): Promise<Player[]> => {
  const model = 'gemini-2.5-flash';
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Generate a list of 8 random realistic football players available for transfer in the Brazilian league context. Varied ratings (65-90) and prices.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                position: { type: Type.STRING, enum: ["Goleiro", "Defensor", "Meio-Campo", "Atacante"] },
                rating: { type: Type.INTEGER },
                age: { type: Type.INTEGER },
                value: { type: Type.NUMBER },
                team: { type: Type.STRING, description: "Current team name" }
              },
              required: ["name", "position", "rating", "age", "value", "team"]
            }
          }
      }
    });

    if (!response.text) throw new Error("No data returned");
    const rawPlayers = JSON.parse(response.text);

    return rawPlayers.map((p: any) => ({
      id: generateId(),
      name: p.name,
      position: p.position as Position,
      rating: p.rating,
      age: p.age,
      value: p.value,
      team: p.team
    }));
  } catch (e) {
    return [];
  }
};

export const simulateMatchWithGemini = async (myTeam: Team, mySquad: Player[], opponent: Team): Promise<MatchResult> => {
  const model = 'gemini-2.5-flash';
  
  // Calculate average rating
  const avgRating = mySquad.reduce((acc, p) => acc + p.rating, 0) / mySquad.length;
  const myTopPlayers = mySquad.sort((a, b) => b.rating - a.rating).slice(0, 3).map(p => p.name).join(", ");

  const prompt = `
    Simulate a football match between ${myTeam.name} (User's team) and ${opponent.name}.
    
    ${myTeam.name} Stats:
    - Average Rating: ${avgRating.toFixed(1)}
    - Key Players: ${myTopPlayers}
    
    ${opponent.name} is a standard Brazilian Serie A team. Assume realistic strength based on their real-life reputation.

    Provide a JSON response with the score, key events (goals, red cards), and a short match summary (in Portuguese).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            homeScore: { type: Type.INTEGER, description: "Score for User's team" },
            awayScore: { type: Type.INTEGER, description: "Score for Opponent" },
            summary: { type: Type.STRING, description: "A 2-sentence summary of the game in Portuguese" },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  minute: { type: Type.INTEGER },
                  description: { type: Type.STRING, description: "Short description in Portuguese (e.g. 'Gol de Gabigol')" },
                  type: { type: Type.STRING, enum: ["goal", "card", "substitution", "normal"] },
                  team: { type: Type.STRING, enum: ["home", "away"] }
                }
              }
            }
          },
          required: ["homeScore", "awayScore", "summary", "events"]
        }
      }
    });

    if (!response.text) throw new Error("No match data");
    const data = JSON.parse(response.text);

    const isWin = data.homeScore > data.awayScore;
    const isDraw = data.homeScore === data.awayScore;

    return {
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      events: data.events,
      summary: data.summary,
      opponentName: opponent.name,
      win: isWin,
      draw: isDraw
    };

  } catch (error) {
    console.error(error);
    // Fallback simulation
    const myScore = Math.floor(Math.random() * 3);
    const oppScore = Math.floor(Math.random() * 3);
    return {
      homeScore: myScore,
      awayScore: oppScore,
      events: [],
      summary: "Simulação offline realizada devido a erro de conexão.",
      opponentName: opponent.name,
      win: myScore > oppScore,
      draw: myScore === oppScore
    };
  }
};