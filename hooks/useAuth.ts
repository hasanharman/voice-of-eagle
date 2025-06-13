"use client"

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

function clearSupabaseAuthCookies() {
  // Clear common Supabase auth cookies (access, refresh, chunked)
  document.cookie = 'sb-access-token=; Max-Age=0; path=/';
  document.cookie = 'sb-refresh-token=; Max-Age=0; path=/';
  // Optionally clear chunked cookies if used
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let unsubscribed = false;
    const getUser = async () => {
      try {
        const { data: { user } } = await getUserWithTimeout(supabase, 3000)
        if (unsubscribed) return;
        setUser(user)
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()
          setIsAdmin(profile?.is_admin || false)
        } else {
          setIsAdmin(false)
        }
      } catch (e) {
        clearSupabaseAuthCookies()
        setUser(null)
        setIsAdmin(false)
      } finally {
        if (!unsubscribed) setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (unsubscribed) return;
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()
          setIsAdmin(profile?.is_admin || false)
        } else {
          setIsAdmin(false)
        }
        setLoading(false)
      }
    )

    return () => {
      unsubscribed = true;
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`
        }
      })
      
      if (error) {
        console.error('Error signing in:', error)
      }
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    user,
    loading,
    isAdmin,
    signInWithGoogle,
    signOut,
  }
}
