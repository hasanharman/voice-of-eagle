// components/drag-preview.tsx
"use client";

import { memo } from "react";
import { motion } from "motion/react";

interface DragPreviewProps {
  position: { x: number; y: number };
  detectedPosition: string;
  confidence: number;
  playerName: string;
}

const DragPreview = memo(function DragPreview({
  position,
  detectedPosition,
  confidence,
  playerName,
}: DragPreviewProps) {
  const isOutOfBounds = detectedPosition === "OUT";
  const isInvalid = isOutOfBounds;

  const confidenceColor = isInvalid
    ? "#EF4444"
    : confidence > 0.7
    ? "#10B981"
    : confidence > 0.4
    ? "#F59E0B"
    : "#EF4444";

  const getDisplayText = () => {
    if (isOutOfBounds) return "OUT OF BOUNDS";
    return detectedPosition;
  };

  const getIcon = () => {
    if (isOutOfBounds) return "⚠️";
    return `${(confidence * 100).toFixed(0)}%`;
  };

  return (
    <motion.div
      className="absolute pointer-events-none z-40"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {/* Dashed outline preview */}
      <motion.div
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: isInvalid ? [1, 1.1, 1] : [1, 1.05, 1],
        }}
        transition={{
          duration: isInvalid ? 0.5 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main dashed border */}
        <div
          className={`w-20 h-28 border-2 rounded-lg ${
            isInvalid ? "border-solid" : "border-dashed"
          }`}
          style={{
            borderColor: confidenceColor,
            backgroundColor: `${confidenceColor}${isInvalid ? "25" : "15"}`,
          }}
        />

        {/* Position indicator */}
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-semibold text-white shadow-lg"
          style={{ backgroundColor: confidenceColor }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {getDisplayText()}
        </motion.div>

        {/* Confidence indicator or warning */}
        <motion.div
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium bg-black bg-opacity-70 text-white"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {getIcon()}
        </motion.div>

        {/* Warning icon for invalid positions */}
        {isInvalid && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
});

export default DragPreview;
