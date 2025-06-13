"use client"

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

function clearSupabaseAuthCookies() {
  document.cookie = 'sb-access-token=; Max-Age=0; path=/';
  document.cookie = 'sb-refresh-token=; Max-Age=0; path=/';
  for (let i = 0; i < 5; i++) {
    document.cookie = `sb-access-token.${i}=; Max-Age=0; path=/`;
    document.cookie = `sb-refresh-token.${i}=; Max-Age=0; path=/`;
  }
}

async function getUserWithTimeout(supabase: any, timeoutMs = 3000) {
  return Promise.race([
    supabase.auth.getUser(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs)),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let unsubscribed = false;
    const getUser = async () => {
      try {
        const { data: { user } } = await getUserWithTimeout(supabase, 3000)
        if (unsubscribed) return;
        setUser(user)
      } catch (e) {
        clearSupabaseAuthCookies()
        setUser(null)
      } finally {
        if (!unsubscribed) setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (unsubscribed) return;
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      unsubscribed = true;
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
