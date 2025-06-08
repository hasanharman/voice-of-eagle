"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { LogOut, User } from "lucide-react"

export function UserMenu() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <Button onClick={signOut} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
