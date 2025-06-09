import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      from: () => ({
        insert: () => ({ error: null }),
        update: () => ({ error: null }),
        select: () => ({
          order: () => ({ data: null, error: null }),
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
