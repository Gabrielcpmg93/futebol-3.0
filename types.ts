export enum Position {
  GK = 'Goleiro',
  DEF = 'Defensor',
  MID = 'Meio-Campo',
  ATT = 'Atacante'
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  rating: number; // 1-100
  age: number;
  value: number; // In millions
  team?: string;
}

export interface Team {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export interface TeamStats {
  id: string;
  name: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // Goals For
  ga: number; // Goals Against
}

export interface MatchEvent {
  minute: number;
  description: string;
  type: 'goal' | 'card' | 'substitution' | 'normal';
  team: 'home' | 'away' | 'neutral';
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  summary: string;
  opponentName: string;
  win: boolean;
  draw: boolean;
}

export type ViewState = 'select-team' | 'dashboard' | 'squad' | 'market' | 'match' | 'career-mode' | 'standings';

export const BRAZILIAN_TEAMS: Team[] = [
  { id: 'fla', name: 'Flamengo', primaryColor: 'bg-red-600', secondaryColor: 'text-black' },
  { id: 'pal', name: 'Palmeiras', primaryColor: 'bg-green-600', secondaryColor: 'text-white' },
  { id: 'bot', name: 'Botafogo', primaryColor: 'bg-black', secondaryColor: 'text-white' },
  { id: 'cam', name: 'Atlético-MG', primaryColor: 'bg-black', secondaryColor: 'text-white' },
  { id: 'saopaulo', name: 'São Paulo', primaryColor: 'bg-red-600', secondaryColor: 'text-white' },
  { id: 'flu', name: 'Fluminense', primaryColor: 'bg-green-700', secondaryColor: 'text-red-700' },
  { id: 'gre', name: 'Grêmio', primaryColor: 'bg-blue-500', secondaryColor: 'text-black' },
  { id: 'int', name: 'Internacional', primaryColor: 'bg-red-600', secondaryColor: 'text-white' },
  { id: 'cru', name: 'Cruzeiro', primaryColor: 'bg-blue-600', secondaryColor: 'text-white' },
  { id: 'vas', name: 'Vasco', primaryColor: 'bg-black', secondaryColor: 'text-white' },
  { id: 'cor', name: 'Corinthians', primaryColor: 'bg-black', secondaryColor: 'text-white' },
  { id: 'bah', name: 'Bahia', primaryColor: 'bg-blue-500', secondaryColor: 'text-red-500' },
];