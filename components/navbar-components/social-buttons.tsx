import * as React from "react";
import { Button } from "@/components/ui/button";
import { Coffee, Github } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

export default function SocialButtons() {
  return (
    <div className="flex items-center gap-1">
      {/* <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground relative size-8 rounded-full shadow-none"
        asChild
      >
        <a
          href="https://github.com/hasanharman"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
      </Button> */}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground relative size-8 rounded-full shadow-none"
        asChild
      >
        <a
          href="https://buymeacoffee.com/hasanharman"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buy me a coffee"
        >
          <Coffee className="h-4 w-4" />
        </a>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground relative size-8 rounded-full shadow-none"
        asChild
      >
        <a
          href="https://x.com/strad3r"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
        >
          <FaXTwitter className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
