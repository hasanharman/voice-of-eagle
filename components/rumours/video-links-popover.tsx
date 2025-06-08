"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Play, ExternalLink } from "lucide-react"
import { VideoLink } from "@/lib/types/rumours.types"

interface VideoLinksPopoverProps {
  videoLinks: VideoLink[]
}

export function VideoLinksPopover({ videoLinks }: VideoLinksPopoverProps) {
  if (!videoLinks || videoLinks.length === 0) return null

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return '🎥'
      case 'vimeo':
        return '📹'
      default:
        return '🎬'
    }
  }

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
          <div className="text-sm font-medium">Video Highlights</div>
          
          <div className="space-y-2">
            {videoLinks.map((video, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlatformIcon(video.platform)}</span>
                  <div>
                    <div className="text-sm font-medium">{video.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {video.platform}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
