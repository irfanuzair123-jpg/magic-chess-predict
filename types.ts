export interface Player {
  id: number;
  name: string;
  isUser: boolean;
}

export interface MatchRound {
  id: string;
  label: string;
  opponentId: number | null; // The ID of the player fought
}

export interface PredictionMatch {
  round: string;
  opponentName: string;
}

export interface PredictionScenario {
  scenarioName: string;
  matches: PredictionMatch[];
}

// Input rounds as per your screenshot/setup
export const INPUT_ROUNDS = [
  { id: '1-2', label: 'I-2' },
  { id: '1-3', label: 'I-3' },
  { id: '1-4', label: 'I-4' },
  { id: '2-1', label: 'II-1' },
  { id: '2-2', label: 'II-2' },
];

// Fixed prediction sequence based on the screenshot provided
// Skips x-3 (Fate Box/Carousel) and includes up to x-6
export const PREDICTION_ROUNDS = [
  'II-4', 'II-5', 'II-6',
  'III-1', 'III-2', 'III-4', 'III-5', 'III-6',
  'IV-1', 'IV-2', 'IV-4', 'IV-5'
];
