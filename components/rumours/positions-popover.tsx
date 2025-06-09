"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n/context";

interface PositionsPopoverProps {
  positions: string[];
}

export function PositionsPopover({ positions }: PositionsPopoverProps) {
  const { t } = useI18n();
  
  if (!positions || positions.length === 0) return null;

  const firstPosition = positions[0];
  const additionalPositions = positions.slice(1);

  if (additionalPositions.length === 0) {
    return (
      <Badge variant="secondary" className="text-xs">
        {t(`positions.${firstPosition}`)}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Badge variant="secondary" className="text-xs">
        {t(`positions.${firstPosition}`)}
      </Badge>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-xs">
            +{additionalPositions.length}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            <div className="text-sm font-medium">{t('table.positions')}</div>
            <div className="flex flex-wrap gap-1">
              {additionalPositions.map((position) => (
                <Badge key={position} variant="secondary" className="text-xs">
                  {t(`positions.${position}`)}
                </Badge>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
