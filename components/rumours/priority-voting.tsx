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
import { SignupDialog } from "@/components/auth/signup-dialog";
import { useI18n } from "@/lib/i18n/context";

interface PriorityVotingProps {
  rumour: RumourWithScores;
}

export function PriorityVoting({ rumour }: PriorityVotingProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [userPriority, setUserPriority] = useState<
    "high" | "medium" | "low" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
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
        }
        
        if (data) {
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
      setShowSignupDialog(true);
      return;
    }

    if (isVoting) return;

    const rateLimitKey = `priority_${user.id}`;
    const lastVoteTime = localStorage.getItem(rateLimitKey);
    const now = Date.now();
    
    if (lastVoteTime && now - parseInt(lastVoteTime) < 1000) {
      toast.error(t('voting.pleaseWaitBeforeVoting'));
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
        toast.success(t('voting.priorityVoteRemoved'));
      } else {
        const { error } = await supabase.from("priority_votes").upsert({
          rumour_id: rumour.id,
          user_id: user.id,
          priority_level: priority,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
        setUserPriority(priority);
        toast.success(`${t('common.' + priority)} ${t('voting.votedPriority')}`);
      }

      localStorage.setItem(rateLimitKey, now.toString());
    } catch (error) {
      console.error("Error voting priority:", error);
      toast.error(t('voting.failedToVote'));
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
          <div className="text-sm font-medium">{t('priority.voteOnPriorityLevel')}</div>

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
                <span className="capitalize">{t('common.' + priority)} {t('priority.priority')}</span>
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
            {t('priority.averageScore')}: {rumour.avg_priority_score?.toFixed(1) || '0.0'}/3.0
          </div>
        </div>
      </PopoverContent>
      <SignupDialog 
        open={showSignupDialog} 
        onOpenChange={setShowSignupDialog} 
      />
    </Popover>
  );
}
