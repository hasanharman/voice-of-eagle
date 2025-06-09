// components/player.tsx
"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LineupPlayer } from "@/lib/store/player.store";
import { getAreaBasedPosition } from "@/lib/utils/besiktas-import";

interface PlayerCardProps {
  player: LineupPlayer;
  onDragStart: () => void;
  onDrag?: (event: any, info: any) => void;
  onDragEnd: (event: any, info: any) => void;
  onClick: (event: any) => void;
  isDragging?: boolean;
}

const PlayerCard = memo(function PlayerCard({
  player,
  onDragStart,
  onDrag,
  onDragEnd,
  onClick,
  isDragging = false,
}: PlayerCardProps) {
  const handleClick = (event: React.MouseEvent) => {
    if (isDragging) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick(event);
  };

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab select-none"
      style={{
        left: `${player.fieldPosition.x}%`,
        top: `${player.fieldPosition.y}%`,
      }}
      drag
      dragMomentum={false}
      dragElastic={0.05} // Reduced elasticity
      // More restrictive drag constraints to keep players within field
      dragConstraints={{
        left: -200, // Reduced from -300
        right: 200, // Reduced from 300
        top: -200, // Reduced from -300
        bottom: 200, // Reduced from 300
      }}
      onDragStart={onDragStart}
      onDrag={onDrag}
      whileDrag={{
        scale: 1.1,
        zIndex: 50,
        rotate: -8,
        cursor: "grabbing",
      }}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      whileHover={{ scale: isDragging ? 1.1 : 1.05 }}
      whileTap={{ scale: isDragging ? 1.1 : 0.95 }}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      layout
    >
      {/* Normal State - Circular Avatar */}
      <motion.div
        className="flex flex-col items-center pointer-events-none"
        animate={{
          opacity: isDragging ? 0 : 1,
          scale: isDragging ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative mb-2">
          <Avatar className="w-12 h-12 border-2 border-white shadow-xl">
            <AvatarImage
              src={player.image}
              alt={player.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-black to-gray-600 text-white text-sm font-bold">
              {player.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        <motion.div
          className="text-black text-xs font-semibold text-center whitespace-nowrap max-w-20 truncate mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {player.name}
        </motion.div>

        <motion.div
          className="text-black text-xs font-medium opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.3 }}
        >
          {getAreaBasedPosition(player.fieldPosition)}
        </motion.div>
      </motion.div>

      {/* Drag State - Card Format */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: isDragging ? 1 : 0,
          scale: isDragging ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="relative w-20 h-28 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg border border-border shadow-2xl overflow-hidden"
          animate={{
            boxShadow: isDragging
              ? "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)"
              : "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {/* Dark overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

          {/* Player image */}
          <div className="relative h-16 overflow-hidden">
            <img
              src={player.image}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Player info */}
          <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
            <div className="text-xs font-bold truncate mb-1">
              {player.name.split(" ").slice(-1)[0]}
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="text-xs px-1 py-0 bg-white bg-opacity-20 text-white border-white border-opacity-30"
              >
                {getAreaBasedPosition(player.fieldPosition)}
              </Badge>

            </div>
          </div>

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            animate={{
              x: isDragging ? ["-100%", "100%"] : "-100%",
            }}
            transition={{
              duration: 1.5,
              repeat: isDragging ? Infinity : 0,
              ease: "linear",
            }}
            style={{
              transform: "skewX(-20deg)",
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

export default PlayerCard;
