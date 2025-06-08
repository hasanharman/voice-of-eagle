export interface TransferRumour {
  id: string;
  player_name: string;
  age: number | null;
  nationality: string | null;
  nationality_code: string | null;
  positions: string[] | null;
  current_team: string | null;
  current_league: string | null;
  market_value: number | null; // In cents
  source_name: string | null;
  source_url: string | null;
  transfermarkt_url: string | null;
  photo_url: string | null;
  video_links: VideoLink[];
  status: "active" | "completed" | "rejected" | "expired";
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface VideoLink {
  title: string;
  url: string;
  platform: "youtube" | "vimeo" | "other";
}

export interface CommunityVote {
  id: string;
  rumour_id: string;
  user_id: string;
  vote_type: "upvote" | "downvote";
  created_at: string;
  updated_at: string;
}

export interface PriorityVote {
  id: string;
  rumour_id: string;
  user_id: string;
  priority_level: "high" | "medium" | "low";
  created_at: string;
  updated_at: string;
}

export interface RumourWithScores extends TransferRumour {
  upvotes: number;
  downvotes: number;
  total_community_votes: number;
  community_approval: number;
  high_priority_votes: number;
  medium_priority_votes: number;
  low_priority_votes: number;
  total_priority_votes: number;
  avg_priority_score: number;
  calculated_priority_level: "high" | "medium" | "low";
}

export type SortOption =
  | "latest"
  | "priority"
  | "popularity"
  | "most_discussed"
  | "market_value";

export interface FilterOptions {
  positions: string[];
  leagues: string[];
  priorities: ("high" | "medium" | "low")[];
  statuses: ("active" | "completed" | "rejected" | "expired")[];
  ageRange: [number, number];
  marketValueRange: [number, number];
}
