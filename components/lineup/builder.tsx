// components/builder.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";

import FootballField from "./field";
import PlayerSelectionResponsive from "./player-select";
import { usePlayerStore, formations } from "@/lib/store/player.store";

export default function LineupBuilder() {
  const {
    selectedFormation,
    setFormation,
    resetLineup,
    lineupPlayers,
    substituteePlayers,
  } = usePlayerStore();

  const [isPlayerDrawerOpen, setIsPlayerDrawerOpen] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null
  );

  const handlePlayerSlotClick = (positionId: string) => {
    setSelectedPositionId(positionId);
    setIsPlayerDrawerOpen(true);
  };

  const handleSubstituteClick = (playerId: string) => {
    // Handle substitute selection if needed
    console.log("Substitute clicked:", playerId);
  };

  const handleFormationChange = (formation: keyof typeof formations) => {
    setFormation(formation);
  };

  const averageRating =
    lineupPlayers.length > 0
      ? Math.round(
          lineupPlayers.reduce((acc, p) => acc + p.rating, 0) /
            lineupPlayers.length
        )
      : 0;

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="font-bold text-gray-800 text-lg">LINEUP</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={resetLineup}
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Formation Selector */}
        <div className="mb-6">
          <Select
            value={selectedFormation}
            onValueChange={handleFormationChange}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm">
              <SelectValue placeholder="Select formation" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(formations).map((formation) => (
                <SelectItem key={formation} value={formation}>
                  {formation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Football Field */}
        <Card className="p-2 rounded-3xl border-2 border-white mb-6 overflow-hidden drop-shadow-lg">
          <FootballField onPlayerSlotClick={handlePlayerSlotClick} />
        </Card>



        {/* Player Selection Drawer */}
        <PlayerSelectionResponsive
          isOpen={isPlayerDrawerOpen}
          onClose={() => setIsPlayerDrawerOpen(false)}
          positionId={selectedPositionId}
        />
      </div>
    </div>
  );
}
