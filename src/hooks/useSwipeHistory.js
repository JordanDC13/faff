import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SESSION_KEY = 'faff_swipe_session'

export function useSwipeHistory(user, context) {
  const [swipes, setSwipes] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]')
    } catch {
      return []
    }
  })

  const [saved, setSaved] = useState([])

  // Tracks the DB row id of the most recent swipe so we can patch feedback_reason onto it
  const lastSwipeIdRef = useRef(null)

  const recordSwipe = useCallback(async (activity, direction) => {
    const id = crypto.randomUUID()
    const event = {
      id,
      activity_id: activity.id,
      direction,
      energy_level_at_time: context?.energy ?? null,
      budget_at_time: context?.budgetOverride ?? context?.budget_daily ?? null,
      time_of_day: new Date().getHours(),
      created_at: new Date().toISOString(),
      feedback_reason: null,
    }

    lastSwipeIdRef.current = id

    setSwipes(prev => {
      const next = [...prev, event]
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
      return next
    })

    if (direction === 'right') {
      setSaved(prev => [...prev, activity])
    }

    if (supabase && user?.id) {
      supabase.from('swipe_events').insert({
        id,
        user_id: user.id,
        activity_id: event.activity_id,
        direction: event.direction,
        energy_level_at_time: event.energy_level_at_time,
        budget_at_time: event.budget_at_time,
        time_of_day: event.time_of_day,
        feedback_reason: null,
      }).then(({ error }) => {
        if (error) console.warn('Swipe not persisted:', error.message)
      })
    }
  }, [user, context])

  // Called after left-swipe feedback is selected
  const updateFeedback = useCallback(async (reason) => {
    const id = lastSwipeIdRef.current
    if (!id) return

    setSwipes(prev => {
      const next = prev.map(s => s.id === id ? { ...s, feedback_reason: reason } : s)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
      return next
    })

    if (supabase && user?.id) {
      supabase.from('swipe_events')
        .update({ feedback_reason: reason })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Feedback reason not persisted:', error.message)
        })
    }
  }, [user])

  return { swipes, saved, recordSwipe, updateFeedback }
}
