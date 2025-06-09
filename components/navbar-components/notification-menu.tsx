"use client"

import { useState } from "react"
import { BellIcon, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useI18n } from "@/lib/i18n/context"
import { useNotificationStore } from "@/lib/store/notification.store"
import { useAuth } from "@/hooks/useAuth"
import { getRelativeTime } from "@/lib/utils/time"

const initialNotifications = [
  {
    id: 1,
    user: "Chris Tompson",
    action: "requested review on",
    target: "PR #42: Feature implementation",
    timestamp: "15 minutes ago",
    unread: true,
  },
  {
    id: 2,
    user: "Emma Davis",
    action: "shared",
    target: "New component library",
    timestamp: "45 minutes ago",
    unread: true,
  },
  {
    id: 3,
    user: "James Wilson",
    action: "assigned you to",
    target: "API integration task",
    timestamp: "4 hours ago",
    unread: false,
  },
  {
    id: 4,
    user: "Alex Morgan",
    action: "replied to your comment in",
    target: "Authentication flow",
    timestamp: "12 hours ago",
    unread: false,
  },
  {
    id: 5,
    user: "Sarah Chen",
    action: "commented on",
    target: "Dashboard redesign",
    timestamp: "2 days ago",
    unread: false,
  },
  {
    id: 6,
    user: "Miky Derya",
    action: "mentioned you in",
    target: "Origin UI open graph image",
    timestamp: "2 weeks ago",
    unread: false,
  },
]

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  )
}

export default function NotificationMenu() {
  const { t } = useI18n()
  const { isAdmin } = useAuth()
  const { notifications, addNotification, markAsRead, markAllAsRead } = useNotificationStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    user: "",
    action: "",
    target: "",
  })

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleAddNotification = () => {
    if (newNotification.user && newNotification.action && newNotification.target) {
      addNotification({
        user: newNotification.user,
        action: newNotification.action,
        target: newNotification.target,
        timestamp: new Date().toISOString(),
        unread: true,
      })
      setNewNotification({ user: "", action: "", target: "" })
      setIsAddDialogOpen(false)
    }
  }

  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground relative size-8 rounded-full shadow-none"
              aria-label="Open notifications"
            >
              <BellIcon size={16} aria-hidden="true" />
              {unreadCount > 0 && (
                <div
                  aria-hidden="true"
                  className="bg-primary absolute top-0.5 right-0.5 size-1 rounded-full"
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-1">
            <div className="flex items-baseline justify-between gap-4 px-3 py-2">
              <div className="text-sm font-semibold">{t('nav.notifications')}</div>
              <div className="flex gap-2">
                {isAdmin && (
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                )}
                {unreadCount > 0 && (
                  <button
                    className="text-xs font-medium hover:underline"
                    onClick={markAllAsRead}
                  >
                    {t('nav.markAllAsRead')}
                  </button>
                )}
              </div>
            </div>
            <div
              role="separator"
              aria-orientation="horizontal"
              className="bg-border -mx-1 my-1 h-px"
            ></div>
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground px-3 py-2 text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="relative flex items-start pe-3">
                    <div className="flex-1 space-y-1">
                      <div className="text-foreground/80 text-left">
                        <span className="text-foreground font-medium hover:underline">
                          {notification.user}
                        </span>{" "}
                        {notification.action}{" "}
                        <span className="text-foreground font-medium hover:underline">
                          {notification.target}
                        </span>
                        .
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {getRelativeTime(notification.timestamp)}
                      </div>
                    </div>
                    {notification.unread && (
                      <div className="absolute end-0 self-center">
                        <span className="sr-only">Unread</span>
                        <Dot />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </PopoverContent>
        </Popover>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user">User</Label>
              <Input
                id="user"
                value={newNotification.user}
                onChange={(e) => setNewNotification({ ...newNotification, user: e.target.value })}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                value={newNotification.action}
                onChange={(e) => setNewNotification({ ...newNotification, action: e.target.value })}
                placeholder="Enter action (e.g., 'added a rumour')"
              />
            </div>
            <div>
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                value={newNotification.target}
                onChange={(e) => setNewNotification({ ...newNotification, target: e.target.value })}
                placeholder="Enter target (e.g., 'Player Name to Team')"
              />
            </div>
            <Button onClick={handleAddNotification} className="w-full">
              Add Notification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
