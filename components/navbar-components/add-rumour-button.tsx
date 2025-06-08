"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MessageCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export default function AddRumourButton() {
  const { t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-full shadow-none"
          aria-label="Add rumour"
        >
          <Plus
            className="text-muted-foreground"
            size={16}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="pb-2">
        <DropdownMenuItem
          className="cursor-pointer py-1 focus:bg-transparent focus:underline"
          asChild
        >
          <a
            href="https://x.com/messages/compose?recipient_id=strd3r"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={16} className="opacity-60" aria-hidden="true" />
            {t('rumours.addRumourGuide')}
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
