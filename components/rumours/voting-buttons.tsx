"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { RumourWithScores } from "@/lib/types/rumours.types";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface VotingButtonsProps {
  rumour: RumourWithScores;
}

export function VotingButtons({ rumour }: VotingButtonsProps) {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserVote = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("community_votes")
          .select("vote_type")
          .eq("rumour_id", rumour.id)
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user vote:", error);
        } else if (data) {
          setUserVote(data.vote_type);
        }
      } catch (error) {
        console.error("Error fetching user vote:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserVote();
  }, [user, rumour.id, supabase]);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    if (isVoting) return;

    const rateLimitKey = `vote_${user.id}`;
    const lastVoteTime = localStorage.getItem(rateLimitKey);
    const now = Date.now();
    
    if (lastVoteTime && now - parseInt(lastVoteTime) < 1000) {
      toast.error("Please wait before voting again");
      return;
    }

    setIsVoting(true);

    try {
      if (userVote === voteType) {
        const { error } = await supabase
          .from("community_votes")
          .delete()
          .eq("rumour_id", rumour.id)
          .eq("user_id", user.id);

        if (error) throw error;
        setUserVote(null);
        toast.success("Vote removed");
      } else {
        const { error } = await supabase.from("community_votes").upsert({
          rumour_id: rumour.id,
          user_id: user.id,
          vote_type: voteType,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
        setUserVote(voteType);
        toast.success(`${voteType === "upvote" ? "Upvoted" : "Downvoted"}!`);
      }

      localStorage.setItem(rateLimitKey, now.toString());
      window.location.reload();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const approvalColor =
    rumour.community_approval >= 70
      ? "text-green-600"
      : rumour.community_approval >= 40
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        <Button
          variant={userVote === "upvote" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleVote("upvote")}
          disabled={isVoting || isLoading}
          className="h-8 w-8 p-0"
        >
          <ThumbsUp className="h-3 w-3" />
        </Button>
        <Button
          variant={userVote === "downvote" ? "destructive" : "ghost"}
          size="sm"
          onClick={() => handleVote("downvote")}
          disabled={isVoting || isLoading}
          className="h-8 w-8 p-0"
        >
          <ThumbsDown className="h-3 w-3" />
        </Button>
      </div>
      <div className="text-center">
        <div className={`text-sm font-medium ${approvalColor}`}>
          {rumour.community_approval}%
        </div>
        <div className="text-xs text-muted-foreground">
          {rumour.total_community_votes} votes
        </div>
      </div>
    </div>
  );
}
