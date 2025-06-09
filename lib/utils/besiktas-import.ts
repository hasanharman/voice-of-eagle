import { Player } from "@/lib/store/player.store";

const POSITION_MAPPING: Record<string, string> = {
  "Goalkeeper": "GK",
  "Centre-Back": "CB", 
  "Left-Back": "LB",
  "Right-Back": "RB",
  "Defensive Midfield": "CDM",
  "Central Midfield": "CM",
  "Left Winger": "LW",
  "Right Winger": "RW", 
  "Second Striker": "CAM",
  "Centre-Forward": "ST",
  "Left Wing": "LW",
  "Right Wing": "RW"
};

interface BesiktasPlayer {
  id: string;
  name: string;
  imageUrl: string;
  position: string;
  dateOfBirth: string;
  age: number;
  nationality: string[];
  height: number;
  foot: string;
  joinedOn: string;
  signedFrom: string;
  contract: string;
  marketValue: number;
  status?: string;
}

export interface BesiktasData {
  updatedAt: string;
  id: string;
  players: BesiktasPlayer[];
}

function calculateRating(marketValue: number, age: number): number {
  let rating = Math.min(95, Math.max(50, 50 + Math.log10(marketValue / 100000) * 10));
  
  if (age <= 23) rating += 2;
  else if (age >= 32) rating -= 3;
  
  return Math.round(rating);
}

export function transformBesiktasPlayer(besiktasPlayer: BesiktasPlayer): Player {
  const mappedPosition = POSITION_MAPPING[besiktasPlayer.position] || "CM";
  const rating = calculateRating(besiktasPlayer.marketValue, besiktasPlayer.age);
  
  return {
    id: besiktasPlayer.id,
    name: besiktasPlayer.name,
    position: mappedPosition,
    rating: rating,
    image: besiktasPlayer.imageUrl,
    nationality: besiktasPlayer.nationality[0] || "Unknown",
    club: "Beşiktaş"
  };
}

export function importBesiktasPlayers(besiktasData: BesiktasData): Player[] {
  return besiktasData.players.map(transformBesiktasPlayer);
}

export function isPositionCompatible(playerPosition: string, targetPosition: string): boolean {
  if (playerPosition === targetPosition) return true;
  
  const compatibilityMap: Record<string, string[]> = {
    "CB": ["CB"],
    "LB": ["LB", "LWB"],
    "RB": ["RB", "RWB"],
    "CDM": ["CDM", "CM"],
    "CM": ["CM", "CDM", "CAM"],
    "CAM": ["CAM", "CM"],
    "LW": ["LW", "LM"],
    "RW": ["RW", "RM"],
    "ST": ["ST", "CF", "CAM"],
    "GK": ["GK"]
  };
  
  return compatibilityMap[targetPosition]?.includes(playerPosition) || false;
}

export function getAreaBasedPosition(fieldPosition: { x: number; y: number }): string {
  const { x, y } = fieldPosition;
  
  if (y > 80) return "GK";
  if (y > 55 && y <= 75) {
    if (x < 30) return "LB";
    if (x > 70) return "RB";
    return "CB";
  }
  if (y > 35 && y <= 55) {
    if (x < 25) return "LM";
    if (x > 75) return "RM";
    return "CM";
  }
  if (y <= 35) {
    if (x < 25) return "LW";
    if (x > 75) return "RW";
    return "ST";
  }
  
  return "CM";
}
