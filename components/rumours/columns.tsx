"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  ExternalLink,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Play,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  ArrowUpDown,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RumourWithScores } from "@/lib/types/rumours.types";
import { formatCurrency, formatDate, getCountryFlag } from "@/lib/utils";
import { VotingButtons } from "@/components/rumours/voting-buttons";
import { VideoLinksPopover } from "@/components/rumours/video-links-popover";
import { PriorityVoting } from "@/components/rumours/priority-voting";
import { PositionsPopover } from "@/components/rumours/positions-popover";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export const createColumns = (
  t: (key: string) => string,
  onEditClick?: (id: string) => void
): ColumnDef<RumourWithScores>[] => {
  const { isAdmin } = useAuth();
  return [
    {
      accessorKey: "photo_url",
      header: "",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <Avatar className="h-10 w-10 border-2 bg-white drop-shadow">
            <AvatarImage
              src={player.photo_url || ""}
              alt={player.player_name}
              className="object-contain"
            />
            <AvatarFallback>
              {player.player_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "player_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            {t("table.player")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const player = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{player.player_name}</span>
            <span className="text-sm text-muted-foreground">
              {player.age && `${player.age} years old`}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "nationality",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            {t("table.nationality")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const player = row.original;
        if (!player.nationality || !player.nationality_code) return null;

        return (
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getCountryFlag(player.nationality_code)}
            </span>
            {/* <span className="text-sm">{player.nationality}</span> */}
          </div>
        );
      },
    },
    {
      accessorKey: "positions",
      header: t("table.positions"),
      cell: ({ row }) => {
        const positions = row.original.positions;
        if (!positions || positions.length === 0) return null;

        return <PositionsPopover positions={positions} />;
      },
      filterFn: (row, id, value) => {
        const positions = row.getValue(id) as string[];
        return positions?.some((position) => value.includes(position)) ?? false;
      },
    },
    {
      accessorKey: "transfer_info",
      header: t("table.transfer"),
      cell: ({ row }) => {
        const player = row.original;
        console.log("player", player);
        return (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{player.from_team}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{player.to_team}</span>
            </div>
            {player.current_league && (
              <span className="text-sm text-muted-foreground">
                {player.current_league}
              </span>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "market_value",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            {t("table.marketValue")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.original.market_value;
        if (!value) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="text-right font-medium">
            {formatCurrency(value / 100)} {/* Convert from cents */}
          </div>
        );
      },
    },
    {
      accessorKey: "calculated_priority_level",
      header: t("table.priority"),
      cell: ({ row }) => {
        const rumour = row.original;
        return <PriorityVoting rumour={rumour} />;
      },
    },
    {
      accessorKey: "community_approval",
      header: t("table.community"),
      cell: ({ row }) => {
        const rumour = row.original;
        return <VotingButtons rumour={rumour} />;
      },
    },
    {
      accessorKey: "source_name",
      header: t("table.source"),
      cell: ({ row }) => {
        const rumour = row.original;
        if (!rumour.source_name) return null;

        return (
          <div className="flex items-center gap-2">
            {rumour.source_url && (
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={rumour.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            {t("table.dateAdded")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors = {
          active: "bg-green-100 text-green-800",
          completed: "bg-blue-100 text-blue-800",
          rejected: "bg-red-100 text-red-800",
          expired: "bg-muted text-muted-foreground",
        };

        return (
          <Badge className={statusColors[status]}>{t(`table.${status}`)}</Badge>
        );
      },
    },

    {
      accessorKey: "video_links",
      header: t("table.videos"),
      cell: ({ row }) => {
        const videoLinks = row.original.video_links;
        if (!videoLinks || videoLinks.length === 0) return null;

        return <VideoLinksPopover videoLinks={videoLinks} />;
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: t("table.actions"),
      cell: ({ row }) => {
        const rumour = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(rumour.id)}
              >
                Copy rumour ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {rumour.transfermarkt_url && (
                <DropdownMenuItem asChild>
                  <a
                    href={rumour.transfermarkt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Transfermarkt
                  </a>
                </DropdownMenuItem>
              )}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onEditClick?.(rumour.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      if (confirm(t("common.confirmDelete"))) {
                        const supabase = createClient();
                        await supabase
                          .from("transfer_rumours")
                          .delete()
                          .eq("id", rumour.id);
                        window.location.reload();
                      }
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
};
