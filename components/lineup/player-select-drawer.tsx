"use client";

import { useState, useMemo } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, X, Star } from "lucide-react";
import { usePlayerStore, Player } from "@/lib/store/player.store";
import { useI18n } from "@/lib/i18n/context";

interface PlayerSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  positionId: string | null;
}

export default function PlayerSelectionDrawer({
  isOpen,
  onClose,
  positionId,
}: PlayerSelectionDrawerProps) {
  const { t } = useI18n();
  const {
    availablePlayers,
    updateLineupPlayer,
    getPlayerByPosition,
    isPlayerInLineup,
  } = usePlayerStore();
  const [searchTerm, setSearchTerm] = useState("");

  const currentPlayer = useMemo(() => {
    return positionId ? getPlayerByPosition(positionId) : null;
  }, [positionId, getPlayerByPosition]);

  const filteredPlayers = useMemo(() => {
    return availablePlayers
      .filter(
        (player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.nationality.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  }, [availablePlayers, searchTerm]);

  const handlePlayerSelect = (player: Player) => {
    if (positionId) {
      updateLineupPlayer(positionId, player);
      onClose();
    }
  };

  const handleRemovePlayer = () => {
    if (positionId) {
      updateLineupPlayer(positionId, null);
      onClose();
    }
  };

  if (!positionId) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle className="text-lg font-semibold">
            {t("lineup.selectPlayer")}
          </DrawerTitle>
          <DrawerDescription>
            {t("lineup.choosePlayerForPosition")}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="relative mb-4 mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("lineup.searchPlayers")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>

          {/* Current Player */}
          {currentPlayer && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2">
                    <AvatarImage
                      src={currentPlayer.image}
                      alt={currentPlayer.name}
                      className="object-contain bg-white"
                    />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {currentPlayer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {currentPlayer.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {currentPlayer.position}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {currentPlayer.nationality}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePlayer}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Player List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPlayers.map((player) => {
              const isSelected = currentPlayer?.id === player.id;
              const inLineup = isPlayerInLineup(player.id);

              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-100 border-blue-300 shadow-md"
                      : inLineup
                      ? "bg-muted border-border opacity-50 cursor-not-allowed"
                      : "bg-background border-border hover:bg-muted hover:border-border hover:shadow-sm"
                  }`}
                  onClick={() => !inLineup && handlePlayerSelect(player)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={player.image}
                        alt={player.name}
                        className="object-contain bg-white"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                        {player.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm text-foreground">
                          {player.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {player.position}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {player.nationality}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {player.club}
                        </span>
                        {inLineup && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-red-600 font-medium">
                              {t("lineup.inLineup")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPlayers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t("lineup.noPlayersFound")}</p>
                <p className="text-sm">{t("lineup.tryAdjustingSearch")}</p>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
