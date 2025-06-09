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
import { useI18n } from "@/lib/i18n/context";

export default function LineupBuilder() {
  const { t } = useI18n();
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

  const handleFormationChange = (formation: keyof typeof formations) => {
    setFormation(formation);
  };



  return (
    <div className="p-4">
      <div className="max-w-md mx-auto">
        {/* Formation Selector */}
        <div className="flex items-center gap-4 mb-6">
          <Select
            value={selectedFormation}
            onValueChange={handleFormationChange}
          >
            <SelectTrigger className="w-full bg-background border-border shadow-sm">
              <SelectValue placeholder={t('lineup.selectFormation')} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(formations).map((formation) => (
                <SelectItem key={formation} value={formation}>
                  {formation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={resetLineup}
            className="text-muted-foreground border-border hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
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
