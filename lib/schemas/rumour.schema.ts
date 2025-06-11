import { z } from "zod";

export const rumourFormSchema = z.object({
  player_name: z.string().min(1, "Player name is required"),
  age: z.number().optional(),
  nationality: z.string().optional(),
  nationality_code: z.string().optional(),
  positions: z.array(z.string()).default([]),
  from_team: z.string().optional(),
  to_team: z.string().optional(),
  current_league: z.string().optional(),
  market_value: z.number().optional(),
  source_url: z.string().url().optional().or(z.literal("")),
  transfermarkt_url: z.string().url().optional().or(z.literal("")),
  photo_url: z.string().url().optional().or(z.literal("")),
  video_links: z.array(z.object({
    title: z.string().min(1, "Video title is required"),
    url: z.string().url("Invalid video URL"),
    platform: z.enum(["youtube"])
  })).default([])
});

export type RumourFormData = z.infer<typeof rumourFormSchema>;
