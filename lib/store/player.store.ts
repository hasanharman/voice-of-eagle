// lib/store/player.store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { importBesiktasPlayers, type BesiktasData } from "@/lib/utils/besiktas-import";
import besiktasData from "../../public/besiktas-data.json";

export interface Player {
  id: string;
  name: string;
  position: string;
  rating: number;
  image: string;
  nationality: string;
  club: string;
}

export interface LineupPlayer extends Player {
  fieldPosition: { x: number; y: number };
  positionId: string;
}

export interface SubstitutePlayer extends Player {
  benchPosition: number; // Position on the bench (0-6 for 7 subs)
}

export interface FormationPosition {
  id: string;
  position: { x: number; y: number };
  defaultPosition: string;
}

// Enhanced field zones with better coverage
export const fieldZones = {
  GK: { x: [35, 65], y: [80, 95], color: "#8B5CF6" },
  LB: { x: [5, 30], y: [55, 75], color: "#3B82F6" },
  LWB: { x: [5, 30], y: [40, 65], color: "#06B6D4" },
  CB: { x: [30, 70], y: [55, 80], color: "#10B981" },
  RB: { x: [70, 95], y: [55, 75], color: "#3B82F6" },
  RWB: { x: [70, 95], y: [40, 65], color: "#06B6D4" },
  LM: { x: [5, 30], y: [30, 55], color: "#F59E0B" },
  CDM: { x: [30, 70], y: [35, 60], color: "#EF4444" },
  CM: { x: [30, 70], y: [25, 55], color: "#F59E0B" },
  CAM: { x: [30, 70], y: [15, 40], color: "#EC4899" },
  RM: { x: [70, 95], y: [30, 55], color: "#F59E0B" },
  LW: { x: [5, 35], y: [10, 35], color: "#8B5CF6" },
  RW: { x: [65, 95], y: [10, 35], color: "#8B5CF6" },
  CF: { x: [35, 65], y: [10, 30], color: "#EF4444" },
  ST: { x: [35, 65], y: [5, 25], color: "#DC2626" },
  LF: { x: [15, 45], y: [5, 25], color: "#DC2626" },
  RF: { x: [55, 85], y: [5, 25], color: "#DC2626" },
} as const;

// Throttle function to limit function calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Enhanced position detection with confidence scoring
export const detectPosition = (
  x: number,
  y: number
): { position: string; confidence: number } => {
  let bestMatch = { position: "CM", confidence: 0 };

  for (const [position, zone] of Object.entries(fieldZones)) {
    if (x >= zone.x[0] && x <= zone.x[1] && y >= zone.y[0] && y <= zone.y[1]) {
      const centerX = (zone.x[0] + zone.x[1]) / 2;
      const centerY = (zone.y[0] + zone.y[1]) / 2;
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const maxDistance =
        Math.sqrt(
          Math.pow(zone.x[1] - zone.x[0], 2) +
            Math.pow(zone.y[1] - zone.y[0], 2)
        ) / 2;
      const confidence = Math.max(0, 1 - distance / maxDistance);

      if (confidence > bestMatch.confidence) {
        bestMatch = { position, confidence };
      }
    }
  }

  // If no exact match, use fallback logic
  if (bestMatch.confidence === 0) {
    if (y > 75) bestMatch = { position: "GK", confidence: 0.5 };
    else if (y > 55) {
      if (x < 30) bestMatch = { position: "LB", confidence: 0.3 };
      else if (x > 70) bestMatch = { position: "RB", confidence: 0.3 };
      else bestMatch = { position: "CB", confidence: 0.3 };
    } else if (y > 30) {
      if (x < 30) bestMatch = { position: "LM", confidence: 0.3 };
      else if (x > 70) bestMatch = { position: "RM", confidence: 0.3 };
      else bestMatch = { position: "CM", confidence: 0.3 };
    } else if (y > 10) {
      if (x < 35) bestMatch = { position: "LW", confidence: 0.3 };
      else if (x > 65) bestMatch = { position: "RW", confidence: 0.3 };
      else bestMatch = { position: "CAM", confidence: 0.3 };
    } else bestMatch = { position: "ST", confidence: 0.3 };
  }

  return bestMatch;
};

// Constrain coordinates to field boundaries with padding
export const constrainToField = (
  x: number,
  y: number
): { x: number; y: number } => {
  const minX = 12;
  const maxX = 88;
  const minY = 12;
  const maxY = 88;

  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
};

// Add visual field boundary checker
export const isWithinFieldBounds = (x: number, y: number): boolean => {
  return x >= 12 && x <= 88 && y >= 12 && y <= 88;
};

export const formations = {
  "4-3-3": [
    { id: "gk", position: { x: 50, y: 85 }, defaultPosition: "GK" },
    { id: "lb", position: { x: 85, y: 65 }, defaultPosition: "LB" },
    { id: "cb1", position: { x: 35, y: 65 }, defaultPosition: "CB" },
    { id: "cb2", position: { x: 65, y: 65 }, defaultPosition: "CB" },
    { id: "rb", position: { x: 15, y: 65 }, defaultPosition: "RB" },
    { id: "cm1", position: { x: 30, y: 45 }, defaultPosition: "CM" },
    { id: "cam", position: { x: 50, y: 35 }, defaultPosition: "CAM" },
    { id: "cm2", position: { x: 70, y: 45 }, defaultPosition: "CM" },
    { id: "lw", position: { x: 15, y: 20 }, defaultPosition: "LW" },
    { id: "st", position: { x: 50, y: 15 }, defaultPosition: "ST" },
    { id: "rw", position: { x: 85, y: 20 }, defaultPosition: "RW" },
  ],
  "4-2-3-1": [
    { id: "gk", position: { x: 50, y: 85 }, defaultPosition: "GK" },
    { id: "lb", position: { x: 20, y: 65 }, defaultPosition: "LB" },
    { id: "cb1", position: { x: 40, y: 65 }, defaultPosition: "CB" },
    { id: "cb2", position: { x: 60, y: 65 }, defaultPosition: "CB" },
    { id: "rb", position: { x: 80, y: 65 }, defaultPosition: "RB" },
    { id: "cdm1", position: { x: 35, y: 45 }, defaultPosition: "CDM" },
    { id: "cdm2", position: { x: 65, y: 45 }, defaultPosition: "CDM" },
    { id: "lw", position: { x: 20, y: 25 }, defaultPosition: "LW" },
    { id: "cam", position: { x: 50, y: 25 }, defaultPosition: "CAM" },
    { id: "rw", position: { x: 80, y: 25 }, defaultPosition: "RW" },
    { id: "st", position: { x: 50, y: 10 }, defaultPosition: "ST" },
  ],
  "4-4-2": [
    { id: "gk", position: { x: 50, y: 85 }, defaultPosition: "GK" },
    { id: "lb", position: { x: 20, y: 65 }, defaultPosition: "LB" },
    { id: "cb1", position: { x: 40, y: 65 }, defaultPosition: "CB" },
    { id: "cb2", position: { x: 60, y: 65 }, defaultPosition: "CB" },
    { id: "rb", position: { x: 80, y: 65 }, defaultPosition: "RB" },
    { id: "lm", position: { x: 20, y: 45 }, defaultPosition: "LM" },
    { id: "cm1", position: { x: 40, y: 45 }, defaultPosition: "CM" },
    { id: "cm2", position: { x: 60, y: 45 }, defaultPosition: "CM" },
    { id: "rm", position: { x: 80, y: 45 }, defaultPosition: "RM" },
    { id: "st1", position: { x: 40, y: 15 }, defaultPosition: "ST" },
    { id: "st2", position: { x: 60, y: 15 }, defaultPosition: "ST" },
  ],
} as const;

export const mockPlayers: Player[] = [
  // Starting 11
  {
    id: "1",
    name: "Mert Günok",
    position: "GK",
    rating: 77,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/51894-1727355668.png",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
  {
    id: "2",
    name: "Jonas Svensson",
    position: "RB",
    rating: 72,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/136184-1727356799.png",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
  {
    id: "3",
    name: "Gabriel Paulista",
    position: "CB",
    rating: 88,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/149498-1727355000.png",
    nationality: "Portugal",
    club: "Beşiktaş",
  },
  {
    id: "4",
    name: "Felix Uduokhai",
    position: "CB",
    rating: 86,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/278343-1727357502.png",
    nationality: "Brazil",
    club: "Beşiktaş",
  },
  {
    id: "5",
    name: "Arthur Masuaku",
    position: "LB",
    rating: 84,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/181380-1696075631.png",
    nationality: "Brazil",
    club: "Beşiktaş",
  },
  {
    id: "6",
    name: "Gedson Fernandes",
    position: "CM",
    rating: 83,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/337800-1727354898.png",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
  {
    id: "7",
    name: "Alex Oxlade-Chamberlain",
    position: "CDM",
    rating: 85,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/143424-1727356614.png",
    nationality: "Canada",
    club: "Beşiktaş",
  },
  {
    id: "8",
    name: "Kenny Arroyo",
    position: "LW",
    rating: 87,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/1074584-1739177410.jpeg",
    nationality: "Portugal",
    club: "Beşiktaş",
  },
  {
    id: "9",
    name: "Milot Rashica",
    position: "RM",
    rating: 77,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/291739-1727356752.png",
    nationality: "Kosova",
    club: "Beşiktaş",
  },
  {
    id: "10",
    name: "Rafa Silva",
    position: "RW",
    rating: 86,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/238055-1727356372.png",
    nationality: "Portugal",
    club: "Beşiktaş",
  },
  {
    id: "11",
    name: "Ciro Immobile",
    position: "ST",
    rating: 89,
    image:
      "https://img.a.transfermarkt.technology/portrait/header/105521-1727355739.png",
    nationality: "Uruguay",
    club: "Beşiktaş",
  },
  // Substitutes
  {
    id: "12",
    name: "Ersin Destanoğlu",
    position: "GK",
    rating: 79,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=face",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
  {
    id: "13",
    name: "Necip Uysal",
    position: "CM",
    rating: 80,
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop&crop=face",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
  {
    id: "14",
    name: "Cenk Tosun",
    position: "ST",
    rating: 82,
    image:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&crop=face",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
  {
    id: "15",
    name: "Salih Uçan",
    position: "CDM",
    rating: 75,
    image:
      "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100&h=100&fit=crop&crop=face",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
  {
    id: "16",
    name: "Tayyip Talha Sanuç",
    position: "CB",
    rating: 73,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
  {
    id: "17",
    name: "Onur Bulut",
    position: "RB",
    rating: 71,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
  {
    id: "18",
    name: "Mustafa Hekimoğlu",
    position: "LW",
    rating: 69,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    nationality: "Turkey",
    club: "Beşiktaş",
  },
];

type FormationType = keyof typeof formations;

interface DragPreview {
  position: { x: number; y: number };
  detectedPosition: string;
  confidence: number;
}

interface PlayerState {
  availablePlayers: Player[];
  lineupPlayers: LineupPlayer[];
  substituteePlayers: SubstitutePlayer[];
  selectedFormation: FormationType;
  draggedPlayer: LineupPlayer | SubstitutePlayer | null;
  draggedPlayerType: "lineup" | "substitute" | null;
  dragPreview: DragPreview | null;
  dragOperation: {
    type: "move" | "substitute" | null;
    details: string;
  };

  setFormation: (formation: FormationType) => void;
  updateLineupPlayer: (positionId: string, player: Player | null) => void;
  updatePlayerPosition: (
    positionId: string,
    position: { x: number; y: number }
  ) => void;
  updatePlayerPositionWithDetection: (
    positionId: string,
    position: { x: number; y: number }
  ) => void;
  initializeLineup: (formation: FormationType) => void;
  initializeSubstitutes: () => void;
  clearPosition: (positionId: string) => void;
  resetLineup: () => void;
  setDraggedPlayer: (
    player: LineupPlayer | SubstitutePlayer | null,
    type?: "lineup" | "substitute" | null
  ) => void;
  setDragPreview: (preview: DragPreview | null) => void;
  setDragOperation: (operation: {
    type: "move" | "substitute" | null;
    details: string;
  }) => void;
  substitutePlayer: (
    lineupPlayerId: string,
    substitutePlayerId: string
  ) => void;
  addSubstituteToField: (
    substitutePlayerId: string,
    fieldPosition: { x: number; y: number }
  ) => void;
  removePlayerFromField: (positionId: string) => void;

  getPlayerByPosition: (positionId: string) => LineupPlayer | undefined;
  getSubstituteByBenchPosition: (
    benchPosition: number
  ) => SubstitutePlayer | undefined;
  getAvailablePlayersForPosition: (position: string) => Player[];
  isPlayerInLineup: (playerId: string) => boolean;
  isPlayerInSubstitutes: (playerId: string) => boolean;
  getTargetPositionForSlot: (positionId: string) => string;
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    (set, get) => ({
      availablePlayers: importBesiktasPlayers(besiktasData as BesiktasData).filter(player => 
        !["mert-gunok", "arthur-masuaku", "gabriel-paulista", "felix-uduokhai", "jonas-svensson", 
          "gedson-fernandes", "alex-oxlade-chamberlain", "rafa-silva", "ernest-muci", "ciro-immobile", "milot-rashica"].includes(player.id)
      ),
      lineupPlayers: [
        {
          id: "mert-gunok",
          name: "Mert Günok",
          position: "GK",
          rating: 82,
          image: "/api/placeholder/150/150",
          nationality: "Turkey",
          club: "Beşiktaş",
          positionId: "gk",
          fieldPosition: { x: 50, y: 85 }
        },
        {
          id: "arthur-masuaku",
          name: "Arthur Masuaku",
          position: "LB",
          rating: 78,
          image: "/api/placeholder/150/150",
          nationality: "France",
          club: "Beşiktaş",
          positionId: "lb",
          fieldPosition: { x: 85, y: 65 }
        },
        {
          id: "gabriel-paulista",
          name: "Gabriel Paulista",
          position: "CB",
          rating: 80,
          image: "/api/placeholder/150/150",
          nationality: "Brazil",
          club: "Beşiktaş",
          positionId: "cb1",
          fieldPosition: { x: 35, y: 65 }
        },
        {
          id: "felix-uduokhai",
          name: "Felix Uduokhai",
          position: "CB",
          rating: 79,
          image: "/api/placeholder/150/150",
          nationality: "Germany",
          club: "Beşiktaş",
          positionId: "cb2",
          fieldPosition: { x: 65, y: 65 }
        },
        {
          id: "jonas-svensson",
          name: "Jonas Svensson",
          position: "RB",
          rating: 77,
          image: "/api/placeholder/150/150",
          nationality: "Norway",
          club: "Beşiktaş",
          positionId: "rb",
          fieldPosition: { x: 15, y: 65 }
        },
        {
          id: "gedson-fernandes",
          name: "Gedson Fernandes",
          position: "CM",
          rating: 81,
          image: "/api/placeholder/150/150",
          nationality: "Portugal",
          club: "Beşiktaş",
          positionId: "cm1",
          fieldPosition: { x: 30, y: 45 }
        },
        {
          id: "alex-oxlade-chamberlain-2",
          name: "Alex Oxlade-Chamberlain",
          position: "CM",
          rating: 83,
          image: "/api/placeholder/150/150",
          nationality: "England",
          club: "Beşiktaş",
          positionId: "cm2",
          fieldPosition: { x: 70, y: 45 }
        },
        {
          id: "rafa-silva",
          name: "Rafa Silva",
          position: "CAM",
          rating: 85,
          image: "/api/placeholder/150/150",
          nationality: "Portugal",
          club: "Beşiktaş",
          positionId: "cam",
          fieldPosition: { x: 50, y: 35 }
        },
        {
          id: "ernest-muci",
          name: "Ernest Muci",
          position: "LW",
          rating: 76,
          image: "/api/placeholder/150/150",
          nationality: "Albania",
          club: "Beşiktaş",
          positionId: "lw",
          fieldPosition: { x: 15, y: 20 }
        },
        {
          id: "ciro-immobile",
          name: "Ciro Immobile",
          position: "ST",
          rating: 87,
          image: "/api/placeholder/150/150",
          nationality: "Italy",
          club: "Beşiktaş",
          positionId: "st",
          fieldPosition: { x: 50, y: 15 }
        },
        {
          id: "milot-rashica",
          name: "Milot Rashica",
          position: "RW",
          rating: 80,
          image: "/api/placeholder/150/150",
          nationality: "Kosovo",
          club: "Beşiktaş",
          positionId: "rw",
          fieldPosition: { x: 85, y: 20 }
        }
      ],
      substituteePlayers: [],
      selectedFormation: "4-3-3",
      draggedPlayer: null,
      draggedPlayerType: null,
      dragPreview: null,
      dragOperation: { type: null, details: "" },

      setFormation: (formation) => {
        set((state) => {
          const formationPositions = formations[formation];
          const newLineupPlayers: LineupPlayer[] = [];

          formationPositions.forEach((pos, index) => {
            const existingPlayer = state.lineupPlayers.find(
              (p) =>
                p.position === pos.defaultPosition ||
                (pos.defaultPosition === "CB" && p.position === "CB") ||
                (pos.defaultPosition === "CM" &&
                  (p.position === "CM" || p.position === "CDM")) ||
                (pos.defaultPosition === "CDM" &&
                  (p.position === "CDM" || p.position === "CM"))
            );

            if (
              existingPlayer &&
              !newLineupPlayers.find((p) => p.id === existingPlayer.id)
            ) {
              newLineupPlayers.push({
                ...existingPlayer,
                fieldPosition: pos.position,
                positionId: pos.id,
              });
            } else if (index < mockPlayers.length) {
              const defaultPlayer = mockPlayers[index];
              newLineupPlayers.push({
                ...defaultPlayer,
                fieldPosition: pos.position,
                positionId: pos.id,
              });
            }
          });

          return {
            ...state,
            selectedFormation: formation,
            lineupPlayers: newLineupPlayers,
          };
        });
      },

      updateLineupPlayer: (positionId, player) => {
        set((state) => {
          const formationPos = formations[state.selectedFormation].find(
            (p) => p.id === positionId
          );
          if (!formationPos) return state;

          const filteredPlayers = state.lineupPlayers.filter(
            (p) => p.positionId !== positionId
          );

          if (player) {
            return {
              ...state,
              lineupPlayers: [
                ...filteredPlayers,
                {
                  ...player,
                  fieldPosition: formationPos.position,
                  positionId,
                },
              ],
            };
          }

          return {
            ...state,
            lineupPlayers: filteredPlayers,
          };
        });
      },

      updatePlayerPosition: (positionId, position) => {
        const constrainedPosition = constrainToField(position.x, position.y);
        set((state) => ({
          ...state,
          lineupPlayers: state.lineupPlayers.map((player) =>
            player.positionId === positionId
              ? { ...player, fieldPosition: constrainedPosition }
              : player
          ),
        }));
      },

      updatePlayerPositionWithDetection: (positionId, position) => {
        const constrainedPosition = constrainToField(position.x, position.y);
        const detection = detectPosition(
          constrainedPosition.x,
          constrainedPosition.y
        );

        set((state) => {
          console.log(
            `📍 Position updated: ${positionId} moved to (${constrainedPosition.x.toFixed(
              1
            )}, ${constrainedPosition.y.toFixed(1)}) - detected as ${
              detection.position
            } (${(detection.confidence * 100).toFixed(0)}% confidence)`
          );

          return {
            ...state,
            lineupPlayers: state.lineupPlayers.map((player) =>
              player.positionId === positionId
                ? {
                    ...player,
                    fieldPosition: constrainedPosition,
                    position: detection.position,
                  }
                : player
            ),
            dragOperation: {
              type: "move",
              details: `Moved to ${detection.position} (${(
                detection.confidence * 100
              ).toFixed(0)}% confidence)`,
            },
          };
        });
      },

      initializeLineup: (formation) => {
        set((state) => {
          const formationPositions = formations[formation];
          const initialLineup = formationPositions.map((pos, index) => ({
            ...mockPlayers[index],
            fieldPosition: pos.position,
            positionId: pos.id,
          }));

          return {
            ...state,
            selectedFormation: formation,
            lineupPlayers: initialLineup,
          };
        });
      },

      initializeSubstitutes: () => {
        set((state) => {
          // Get players not in lineup (starting from index 11)
          const substitutePlayersData = mockPlayers.slice(11);
          const initialSubstitutes = substitutePlayersData.map(
            (player, index) => ({
              ...player,
              benchPosition: index,
            })
          );

          return {
            ...state,
            substituteePlayers: initialSubstitutes,
          };
        });
      },

      clearPosition: (positionId) => {
        set((state) => ({
          ...state,
          lineupPlayers: state.lineupPlayers.filter(
            (p) => p.positionId !== positionId
          ),
        }));
      },

      resetLineup: () => {
        const { selectedFormation } = get();
        get().initializeLineup(selectedFormation);
        get().initializeSubstitutes();
      },

      setDraggedPlayer: (player, type = null) => {
        set({ draggedPlayer: player, draggedPlayerType: type });
      },

      setDragPreview: (preview) => {
        set({ dragPreview: preview });
      },

      setDragOperation: (operation) => {
        set({ dragOperation: operation });

        // Clear operation after 3 seconds
        if (operation.type) {
          setTimeout(() => {
            set({ dragOperation: { type: null, details: "" } });
          }, 3000);
        }
      },

      substitutePlayer: (lineupPlayerId, substitutePlayerId) => {
        set((state) => {
          const lineupPlayer = state.lineupPlayers.find(
            (p) => p.positionId === lineupPlayerId
          );
          const substitutePlayer = state.substituteePlayers.find(
            (p) => p.id === substitutePlayerId
          );

          if (!lineupPlayer || !substitutePlayer) return state;

          console.log(
            `🔄 Substitution: ${substitutePlayer.name} IN, ${lineupPlayer.name} OUT`
          );

          // Remove substitute from bench and add to lineup
          const newLineupPlayers = state.lineupPlayers.map((player) =>
            player.positionId === lineupPlayerId
              ? {
                  ...substitutePlayer,
                  fieldPosition: lineupPlayer.fieldPosition,
                  positionId: lineupPlayer.positionId,
                }
              : player
          );

          // Add lineup player to bench
          const newSubstitutes = state.substituteePlayers.map((player) =>
            player.id === substitutePlayerId
              ? {
                  ...lineupPlayer,
                  benchPosition: substitutePlayer.benchPosition,
                }
              : player
          );

          return {
            ...state,
            lineupPlayers: newLineupPlayers,
            substituteePlayers: newSubstitutes,
            dragOperation: {
              type: "substitute",
              details: `${substitutePlayer.name} substituted for ${lineupPlayer.name}`,
            },
          };
        });
      },

      addSubstituteToField: (substitutePlayerId, fieldPosition) => {
        set((state) => {
          const substitutePlayer = state.substituteePlayers.find(
            (p) => p.id === substitutePlayerId
          );
          if (!substitutePlayer) return state;

          const detection = detectPosition(fieldPosition.x, fieldPosition.y);

          // Generate new position ID
          const newPositionId = `sub_${Date.now()}`;

          // Add substitute to field
          const newLineupPlayer: LineupPlayer = {
            ...substitutePlayer,
            fieldPosition,
            positionId: newPositionId,
            position: detection.position,
          };

          // Remove from substitutes
          const newSubstitutes = state.substituteePlayers.filter(
            (p) => p.id !== substitutePlayerId
          );

          console.log(
            `➕ Added ${substitutePlayer.name} to field at ${detection.position}`
          );

          return {
            ...state,
            lineupPlayers: [...state.lineupPlayers, newLineupPlayer],
            substituteePlayers: newSubstitutes,
            dragOperation: {
              type: "substitute",
              details: `${substitutePlayer.name} added to field as ${detection.position}`,
            },
          };
        });
      },

      removePlayerFromField: (positionId) => {
        set((state) => {
          const player = state.lineupPlayers.find(
            (p) => p.positionId === positionId
          );
          if (!player) return state;

          // Find next available bench position
          const occupiedPositions = state.substituteePlayers.map(
            (p) => p.benchPosition
          );
          const nextBenchPosition =
            Array.from({ length: 7 }, (_, i) => i).find(
              (pos) => !occupiedPositions.includes(pos)
            ) || state.substituteePlayers.length;

          // Add to substitutes
          const newSubstitute: SubstitutePlayer = {
            ...player,
            benchPosition: nextBenchPosition,
          };

          // Remove from lineup
          const newLineupPlayers = state.lineupPlayers.filter(
            (p) => p.positionId !== positionId
          );

          console.log(`➖ Removed ${player.name} from field to bench`);

          return {
            ...state,
            lineupPlayers: newLineupPlayers,
            substituteePlayers: [
              ...state.substituteePlayers,
              newSubstitute,
            ].sort((a, b) => a.benchPosition - b.benchPosition),
            dragOperation: {
              type: "substitute",
              details: `${player.name} moved to bench`,
            },
          };
        });
      },

      getPlayerByPosition: (positionId) => {
        return get().lineupPlayers.find((p) => p.positionId === positionId);
      },

      getSubstituteByBenchPosition: (benchPosition) => {
        return get().substituteePlayers.find(
          (p) => p.benchPosition === benchPosition
        );
      },

      getAvailablePlayersForPosition: (position) => {
        const { availablePlayers, lineupPlayers, substituteePlayers } = get();
        const playersInUse = [
          ...lineupPlayers.map((p) => p.id),
          ...substituteePlayers.map((p) => p.id),
        ];

        return availablePlayers.filter(
          (player) =>
            !playersInUse.includes(player.id) &&
            (player.position === position ||
              (position === "CB" && player.position === "CB") ||
              (position === "CM" &&
                (player.position === "CM" || player.position === "CDM")) ||
              (position === "CDM" &&
                (player.position === "CDM" || player.position === "CM")))
        );
      },

      isPlayerInLineup: (playerId) => {
        return get().lineupPlayers.some((p) => p.id === playerId);
      },

      isPlayerInSubstitutes: (playerId) => {
        return get().substituteePlayers.some((p) => p.id === playerId);
      },

      getTargetPositionForSlot: (positionId) => {
        const { selectedFormation } = get();
        const formationPos = formations[selectedFormation].find(
          (p) => p.id === positionId
        );
        return formationPos?.defaultPosition || "CM";
      },
    }),
    {
      name: "player-store",
    }
  )
);

// Initialize with lineup and substitutes
usePlayerStore.getState().initializeLineup("4-3-3");
usePlayerStore.getState().initializeSubstitutes();
