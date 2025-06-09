"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ExternalLink,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Play,
  ArrowDown,
  ArrowUp,
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

export const createColumns = (
  t: (key: string) => string
): ColumnDef<RumourWithScores>[] => {
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
      header: t("table.player"),
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
      header: t("table.nationality"),
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

        return (
          <div className="flex flex-wrap gap-1">
            {positions.map((position) => (
              <Badge key={position} variant="secondary" className="text-xs">
                {position}
              </Badge>
            ))}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const positions = row.getValue(id) as string[];
        return positions?.some((position) => value.includes(position)) ?? false;
      },
    },
    {
      accessorKey: "current_team",
      header: t("table.currentTeam"),
      cell: ({ row }) => {
        const player = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{player.current_team}</span>
            <span className="text-sm text-muted-foreground">
              {player?.current_league}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "direction",
      header: t("table.direction"),
      cell: ({ row }) => {
        const direction = row.original.direction;
        if (!direction) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="flex items-center gap-2">
            {direction === "incoming" ? (
              <ArrowDown className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowUp className="h-4 w-4 text-blue-600" />
            )}
            <span className="text-sm">
              {direction === "incoming"
                ? t("table.incoming")
                : t("table.outgoing")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "market_value",
      header: t("table.marketValue"),
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
      header: t("table.dateAdded"),
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
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
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
    // {
    //   id: "actions",
    //   header: t("table.actions"),
    //   cell: ({ row }) => {
    //     const rumour = row.original;

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">Open menu</span>
    //             <MoreHorizontal className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem
    //             onClick={() => navigator.clipboard.writeText(rumour.id)}
    //           >
    //             Copy rumour ID
    //           </DropdownMenuItem>
    //           <DropdownMenuSeparator />
    //           {rumour.transfermarkt_url && (
    //             <DropdownMenuItem asChild>
    //               <a
    //                 href={rumour.transfermarkt_url}
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //               >
    //                 View on Transfermarkt
    //               </a>
    //             </DropdownMenuItem>
    //           )}
    //           <DropdownMenuItem>Edit rumour</DropdownMenuItem>
    //           <DropdownMenuItem className="text-red-600">
    //             Delete rumour
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
  ];
};
