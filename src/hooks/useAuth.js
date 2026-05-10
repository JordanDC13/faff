import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const guestFlag = localStorage.getItem('faff_guest')
    if (guestFlag === 'true') {
      setIsGuest(true)
      setLoading(false)
      return
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Auth unavailable')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUpWithEmail = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Auth unavailable')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Auth unavailable')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }, [])

  const continueAsGuest = useCallback(() => {
    localStorage.setItem('faff_guest', 'true')
    setIsGuest(true)
  }, [])

  const signOut = useCallback(async () => {
    localStorage.removeItem('faff_guest')
    setIsGuest(false)
    if (supabase && user) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }, [user])

  return {
    user,
    loading,
    isGuest,
    isAuthenticated: !!user || isGuest,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    continueAsGuest,
    signOut,
  }
}
