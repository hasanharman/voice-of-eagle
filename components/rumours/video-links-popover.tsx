"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Play, ExternalLink } from "lucide-react";
import { VideoLink } from "@/lib/types/rumours.types";
import Link from "next/link";
import Image from "next/image";

interface VideoLinksPopoverProps {
  videoLinks: VideoLink[];
}

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Helper function to get YouTube thumbnail URL
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/default.jpg`;
}

// Helper function to get video title (you might want to fetch this from YouTube API)
function getVideoTitle(url: string): string {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `YouTube Video ${videoId}` : "Video";
}

export function VideoLinksPopover({ videoLinks }: VideoLinksPopoverProps) {
  if (!videoLinks || videoLinks.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Play className="h-4 w-4" />
          <span className="sr-only">View videos</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="text-sm font-medium">Videos</div>

          <div className="flex items-center gap-2 flex-wrap">
            {videoLinks.map((videoUrl, index) => {
              const videoId = getYouTubeVideoId(videoUrl as any);
              const thumbnailUrl = videoId
                ? getYouTubeThumbnail(videoId)
                : null;
              const title = getVideoTitle(videoUrl as any);

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <Link
                    href={videoUrl as any}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative aspect-video w-full">
                      {thumbnailUrl ? (
                        <>
                          <img
                            src={thumbnailUrl}
                            alt={title}
                            className="object-cover w-full h-full"
                          />
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-red-600 rounded-full p-3">
                              <Play className="h-3 w-3 text-white fill-white" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          <Play className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
