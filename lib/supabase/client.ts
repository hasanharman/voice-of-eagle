import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      from: () => ({
        insert: () => ({ error: null }),
        update: () => ({ error: null }),
        select: () => ({
          order: () => ({ 
            data: [
              {
                id: 1,
                player_name: "Breel Embolo",
                age: 27,
                nationality: "Switzerland",
                nationality_code: "CH",
                positions: ["ST", "CF"],
                current_team: "AS Monaco",
                current_league: "Ligue 1",
                market_value: 15000000,
                direction: "incoming",
                status: "active",
                created_at: "2024-12-09T10:00:00Z",
                priority_score: 4.2,
                vote_count: 15
              },
              {
                id: 2,
                player_name: "Noah Okafor",
                age: 24,
                nationality: "Switzerland", 
                nationality_code: "CH",
                positions: ["LW", "ST"],
                current_team: "AC Milan",
                current_league: "Serie A",
                market_value: 25000000,
                direction: "incoming",
                status: "active",
                created_at: "2024-12-09T09:00:00Z",
                priority_score: 3.8,
                vote_count: 12
              },
              {
                id: 3,
                player_name: "Bright Osayi-Samuel",
                age: 26,
                nationality: "Nigeria",
                nationality_code: "NG", 
                positions: ["RB", "RWB"],
                current_team: "Fenerbahçe",
                current_league: "Süper Lig",
                market_value: 8000000,
                direction: "incoming",
                status: "active",
                created_at: "2024-12-09T08:00:00Z",
                priority_score: 3.5,
                vote_count: 8
              },
              {
                id: 4,
                player_name: "Ege Tıknaz",
                age: 22,
                nationality: "Turkey",
                nationality_code: "TR",
                positions: ["CM", "CAM"],
                current_team: "Galatasaray",
                current_league: "Süper Lig", 
                market_value: 5000000,
                direction: "outgoing",
                status: "active",
                created_at: "2024-12-09T07:00:00Z",
                priority_score: 2.9,
                vote_count: 6
              }
            ], 
            error: null 
          }),
          eq: () => ({ data: null, error: null }),
          single: () => ({ data: null, error: null })
        }),
        eq: () => ({ data: null, error: null }),
        single: () => ({ data: null, error: null })
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    } as any;
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
