"use client";

import { useState } from "react";
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
  const supabase = createClient();

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    setIsVoting(true);

    try {
      // If user already voted the same way, remove the vote
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
        // Insert or update vote
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

      // Trigger a refresh of the data
      window.location.reload(); // Simple approach, you might want to use a more sophisticated state management
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
          disabled={isVoting}
          className="h-8 w-8 p-0"
        >
          <ThumbsUp className="h-3 w-3" />
        </Button>
        <Button
          variant={userVote === "downvote" ? "destructive" : "ghost"}
          size="sm"
          onClick={() => handleVote("downvote")}
          disabled={isVoting}
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
