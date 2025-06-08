// components/field.tsx
"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import PlayerCard from "./player";
import DragPreview from "./drag-preview";
import {
  usePlayerStore,
  formations,
  constrainToField,
  detectPosition,
  throttle,
  isWithinFieldBounds,
} from "@/lib/store/player.store";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/context";

interface FootballFieldProps {
  onPlayerSlotClick: (positionId: string) => void;
}

export default function FootballField({
  onPlayerSlotClick,
}: FootballFieldProps) {
  const { t } = useI18n()
  const {
    selectedFormation,
    lineupPlayers,
    updatePlayerPositionWithDetection,
    updatePlayerPosition,
    setDraggedPlayer,
    setDragPreview,
    setDragOperation,
    dragOperation,
    dragPreview,
    draggedPlayer,
    draggedPlayerType,
    substitutePlayer,
    addSubstituteToField,
    removePlayerFromField,
  } = usePlayerStore();

  const fieldRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [originalPosition, setOriginalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Memoize formation positions to prevent unnecessary re-renders
  const formationPositions = useMemo(
    () => formations[selectedFormation],
    [selectedFormation]
  );

  // Function to check if a position is occupied by another player
  const isPositionOccupied = useCallback(
    (x: number, y: number, excludePlayerId: string) => {
      const threshold = 15; // Distance threshold for collision detection

      return lineupPlayers.some((player) => {
        if (player.positionId === excludePlayerId) return false; // Exclude the dragged player

        const distance = Math.sqrt(
          Math.pow(player.fieldPosition.x - x, 2) +
            Math.pow(player.fieldPosition.y - y, 2)
        );

        return distance < threshold;
      });
    },
    [lineupPlayers]
  );

  const handleDragStart = useCallback(
    (positionId: string) => {
      console.log(`🎯 Starting drag for player: ${positionId}`);
      const player = lineupPlayers.find((p) => p.positionId === positionId);
      if (player) {
        // Store original position for potential snap back
        setOriginalPosition({ ...player.fieldPosition });
        setDraggedPlayer(player, "lineup");
        setDraggedPlayerId(positionId);
        setIsDragging(true);
        setDragOperation({ type: null, details: "Sürükleniyor..." });
      }
    },
    [lineupPlayers, setDraggedPlayer, setDraggedPlayerId, setDragOperation]
  );

  // Throttled drag handler to prevent excessive updates
  const throttledDragHandler = useMemo(
    () =>
      throttle((positionId: string, x: number, y: number) => {
        if (!draggedPlayer) return;

        const constrainedPosition = constrainToField(x, y);
        const detection = detectPosition(
          constrainedPosition.x,
          constrainedPosition.y
        );
        const isOutOfBounds = !isWithinFieldBounds(x, y);
        const isOccupied =
          !isOutOfBounds &&
          isPositionOccupied(
            constrainedPosition.x,
            constrainedPosition.y,
            positionId
          );

        let previewStatus = "VALID";
        let previewPosition = constrainedPosition;

        if (isOutOfBounds) {
          previewStatus = "OUT";
          previewPosition = { x, y };
        } else if (isOccupied) {
          previewStatus = "OCCUPIED";
        }

        // Update drag preview with status
        setDragPreview({
          position: previewPosition,
          detectedPosition:
            previewStatus === "VALID" ? detection.position : previewStatus,
          confidence: previewStatus === "VALID" ? detection.confidence : 0,
        });
      }, 16), // ~60fps throttling
    [draggedPlayer, setDragPreview, isPositionOccupied]
  );

  const handleDrag = useCallback(
    (positionId: string, event: any, info: any) => {
      if (!fieldRef.current || !draggedPlayer) return;

      const fieldRect = fieldRef.current.getBoundingClientRect();
      const x = ((info.point.x - fieldRect.left) / fieldRect.width) * 100;
      const y = ((info.point.y - fieldRect.top) / fieldRect.height) * 100;

      // Use throttled handler
      throttledDragHandler(positionId, x, y);
    },
    [fieldRef, draggedPlayer, throttledDragHandler]
  );

  const handleDragEnd = useCallback(
    (positionId: string, event: any, info: any) => {
      console.log(`🏁 Drag ended for player: ${positionId}`);

      if (!fieldRef.current || !originalPosition) {
        console.log("❌ No field ref or original position found");
        resetDragState();
        return;
      }

      const fieldRect = fieldRef.current.getBoundingClientRect();
      const x = ((info.point.x - fieldRect.left) / fieldRect.width) * 100;
      const y = ((info.point.y - fieldRect.top) / fieldRect.height) * 100;

      // Check if dragged to bench area (below the field)
      if (y > 100) {
        console.log(`➖ Player dragged to bench area`);
        removePlayerFromField(positionId);
        setDragOperation({
          type: "substitute",
          details: "Oyuncu bankaya gönderildi",
        });
        resetDragState();
        return;
      }

      // Check if the drop position is within bounds
      if (!isWithinFieldBounds(x, y)) {
        console.log(`❌ Drop position outside field bounds - Snapping back`);
        updatePlayerPosition(positionId, originalPosition);
        setDragOperation({
          type: null,
          details:
            "⚠️ Oyuncu eski konumuna döndü - saha sınırları dışına bırakılamaz",
        });
        toast.error(
          "Oyuncu eski konumuna döndü - saha sınırları dışına bırakılamaz"
        );
        resetDragState();
        return;
      }

      const constrainedPosition = constrainToField(x, y);

      // Check if position is occupied by another player
      if (
        isPositionOccupied(
          constrainedPosition.x,
          constrainedPosition.y,
          positionId
        )
      ) {
        console.log(`❌ Position occupied by another player - Snapping back`);
        updatePlayerPosition(positionId, originalPosition);
        setDragOperation({
          type: null,
          details:
            "⚠️ Oyuncu eski konumuna döndü - pozisyon başka oyuncu tarafından dolu",
        });
        resetDragState();
        return;
      }

      // Valid drop - update position
      const detection = detectPosition(
        constrainedPosition.x,
        constrainedPosition.y
      );
      console.log(
        `📍 Valid drop: (${constrainedPosition.x.toFixed(
          1
        )}, ${constrainedPosition.y.toFixed(1)}) - ${detection.position} (${(
          detection.confidence * 100
        ).toFixed(0)}% confidence)`
      );
      toast.success(
        `Oyuncu yeni konumda: ${detection.position} (${(
          detection.confidence * 100
        ).toFixed(0)}% confidence)`
      );

      updatePlayerPositionWithDetection(positionId, constrainedPosition);
      resetDragState();
    },
    [
      fieldRef,
      updatePlayerPositionWithDetection,
      updatePlayerPosition,
      originalPosition,
      isPositionOccupied,
      removePlayerFromField,
    ]
  );

  // Add this to your existing field.tsx component - update the handleSubstituteDrop function:

  const handleSubstituteDrop = useCallback(
    (event: any) => {
      if (draggedPlayerType !== "substitute" || !draggedPlayer) {
        return;
      }

      // Prevent default drop behavior
      event.preventDefault();

      if (!fieldRef.current) {
        console.log("❌ No field ref found");
        setDraggedPlayer(null, null);
        return;
      }

      const fieldRect = fieldRef.current.getBoundingClientRect();
      const x = ((event.clientX - fieldRect.left) / fieldRect.width) * 100;
      const y = ((event.clientY - fieldRect.top) / fieldRect.height) * 100;

      // Check if dropped within field bounds
      if (!isWithinFieldBounds(x, y)) {
        console.log(`❌ Substitute dropped outside field bounds`);
        setDragOperation({
          type: null,
          details: "⚠️ Yedeği saha sınırları dışına bırakamazsınız",
        });
        toast.warning("Yedeği saha sınırları dışına bırakamazsınız");
        setDraggedPlayer(null, null);
        return;
      }

      const constrainedPosition = constrainToField(x, y);

      // Check if position is occupied by another player
      const occupiedPlayer = lineupPlayers.find((player) => {
        const distance = Math.sqrt(
          Math.pow(player.fieldPosition.x - constrainedPosition.x, 2) +
            Math.pow(player.fieldPosition.y - constrainedPosition.y, 2)
        );
        return distance < 15;
      });

      if (occupiedPlayer) {
        // Substitute the player
        console.log(
          `🔄 Substituting ${occupiedPlayer.name} with ${draggedPlayer.name}`
        );
        substitutePlayer(occupiedPlayer.positionId, draggedPlayer.id);
        setDragOperation({
          type: "substitute",
          details: `${draggedPlayer.name} ↔ ${occupiedPlayer.name} değişikliği yapıldı`,
        });
        toast.success(
          `${draggedPlayer.name} ↔ ${occupiedPlayer.name} değişikliği yapıldı`
        );
      } else {
        // Add substitute to empty field position
        console.log(`➕ Adding ${draggedPlayer.name} to field`);
        addSubstituteToField(draggedPlayer.id, constrainedPosition);
        setDragOperation({
          type: "substitute",
          details: `${draggedPlayer.name} sahaya eklendi`,
        });
        toast.success(`${draggedPlayer.name} sahaya eklendi`);
      }

      setDraggedPlayer(null, null);
    },
    [
      fieldRef,
      draggedPlayerType,
      draggedPlayer,
      lineupPlayers,
      substitutePlayer,
      addSubstituteToField,
      setDraggedPlayer,
      setDragOperation,
    ]
  );

  const resetDragState = useCallback(() => {
    setDraggedPlayer(null, null);
    setDraggedPlayerId(null);
    setIsDragging(false);
    setDragPreview(null);
    setOriginalPosition(null);
  }, [setDraggedPlayer, setDragPreview]);

  const handlePlayerClick = useCallback(
    (positionId: string, event: any) => {
      if (!isDragging && draggedPlayerId !== positionId) {
        console.log(`👆 Player clicked: ${positionId}`);
        onPlayerSlotClick(positionId);
      }
    },
    [isDragging, draggedPlayerId, onPlayerSlotClick]
  );

  return (
    <div className="space-y-4">
      {/* Field */}
      <div
        ref={fieldRef}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #c6ebc8 0%, #b8e5bb 100%)`,
        }}
        onDrop={handleSubstituteDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Field markings */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Outer boundary */}
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.6"
            rx="3"
          />

          {/* Inner playable area boundary (visual guide) */}
          <rect
            x="12"
            y="12"
            width="76"
            height="76"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.3"
            strokeDasharray="2,2"
          />

          {/* Center circle */}
          <circle
            cx="50"
            cy="50"
            r="12"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.6"
          />

          {/* Center line */}
          <line
            x1="5"
            y1="50"
            x2="95"
            y2="50"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.6"
          />

          {/* Goal areas */}
          <rect
            x="35"
            y="5"
            width="30"
            height="15"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.4"
          />
          <rect
            x="35"
            y="80"
            width="30"
            height="15"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.4"
          />
        </svg>

        {/* Empty position slots */}
        {formationPositions.map((pos: any) => {
          const playerInPosition = lineupPlayers.find(
            (p) => p.positionId === pos.id
          );
          if (playerInPosition) return null;

          return (
            <motion.div
              key={pos.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${pos.position.x}%`,
                top: `${pos.position.y}%`,
              }}
              onClick={() => onPlayerSlotClick(pos.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-white border-opacity-50 bg-white bg-opacity-10 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-xs font-semibold drop-shadow-lg opacity-80">
                  {pos.defaultPosition}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Drag Preview */}
        {dragPreview && draggedPlayer && (
          <DragPreview
            position={dragPreview.position}
            detectedPosition={dragPreview.detectedPosition}
            confidence={dragPreview.confidence}
            playerName={draggedPlayer.name}
          />
        )}

        {/* Players */}
        {lineupPlayers.map((player) => (
          <PlayerCard
            key={player.positionId}
            player={player}
            onDragStart={() => handleDragStart(player.positionId)}
            onDrag={(event, info) => handleDrag(player.positionId, event, info)}
            onDragEnd={(event, info) =>
              handleDragEnd(player.positionId, event, info)
            }
            onClick={(event) => handlePlayerClick(player.positionId, event)}
            isDragging={draggedPlayerId === player.positionId}
          />
        ))}

        {/* Drop Zone Indicator for Substitutes */}
        {draggedPlayerType === "substitute" && (
          <motion.div
            className="absolute inset-0 border-4 border-dashed border-blue-400 bg-blue-50 bg-opacity-30 rounded-2xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-blue-700 font-medium">{t('lineup.dropSubstituteHere')}</p>
              <p className="text-blue-600 text-sm">
                {t('lineup.dropToReplace')}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
