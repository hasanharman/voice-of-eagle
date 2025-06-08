"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RumourWithScores } from "@/lib/types/rumours.types";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface PriorityVotingProps {
  rumour: RumourWithScores;
}

export function PriorityVoting({ rumour }: PriorityVotingProps) {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [userPriority, setUserPriority] = useState<
    "high" | "medium" | "low" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserPriority = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("priority_votes")
          .select("priority_level")
          .eq("rumour_id", rumour.id)
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user priority:", error);
        } else if (data) {
          setUserPriority(data.priority_level);
        }
      } catch (error) {
        console.error("Error fetching user priority:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPriority();
  }, [user, rumour.id, supabase]);

  const handlePriorityVote = async (priority: "high" | "medium" | "low") => {
    if (!user) {
      toast.error("Please sign in to vote on priority");
      return;
    }

    if (isVoting) return;

    const rateLimitKey = `priority_${user.id}`;
    const lastVoteTime = localStorage.getItem(rateLimitKey);
    const now = Date.now();
    
    if (lastVoteTime && now - parseInt(lastVoteTime) < 1000) {
      toast.error("Please wait before voting again");
      return;
    }

    setIsVoting(true);

    try {
      if (userPriority === priority) {
        const { error } = await supabase
          .from("priority_votes")
          .delete()
          .eq("rumour_id", rumour.id)
          .eq("user_id", user.id);

        if (error) throw error;
        setUserPriority(null);
        toast.success("Priority vote removed");
      } else {
        const { error } = await supabase.from("priority_votes").upsert({
          rumour_id: rumour.id,
          user_id: user.id,
          priority_level: priority,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
        setUserPriority(priority);
        toast.success(`Voted ${priority} priority!`);
      }

      localStorage.setItem(rateLimitKey, now.toString());
      window.location.reload();
    } catch (error) {
      console.error("Error voting priority:", error);
      toast.error("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };

  const priorityLevel = rumour.calculated_priority_level || "low";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-1">
          <div className="flex flex-col items-center gap-1">
            <Badge className={priorityColors[priorityLevel]}>
              {priorityLevel.toUpperCase()}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {rumour.total_priority_votes} votes
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div className="text-sm font-medium">Vote on Priority Level</div>

          <div className="space-y-2">
            {(["high", "medium", "low"] as const).map((priority) => (
              <Button
                key={priority}
                variant={userPriority === priority ? "default" : "outline"}
                size="sm"
                onClick={() => handlePriorityVote(priority)}
                disabled={isVoting || isLoading}
                className="w-full justify-between"
              >
                <span className="capitalize">{priority} Priority</span>
                <Badge variant="secondary">
                  {priority === "high"
                    ? rumour.high_priority_votes
                    : priority === "medium"
                    ? rumour.medium_priority_votes
                    : rumour.low_priority_votes}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Average Score: {rumour.avg_priority_score.toFixed(1)}/3.0
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
