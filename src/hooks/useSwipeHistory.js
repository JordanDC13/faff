import { useState, useCallback } from 'react'
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

  const recordSwipe = useCallback(async (activity, direction) => {
    const event = {
      activity_id: activity.id,
      direction,
      energy_level_at_time: context?.energy ?? null,
      budget_at_time: context?.budget ?? null,
      time_of_day: new Date().getHours(),
      created_at: new Date().toISOString(),
    }

    setSwipes(prev => {
      const next = [...prev, event]
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
      return next
    })

    if (direction === 'right') {
      setSaved(prev => [...prev, activity])
    }

    if (supabase && user?.id) {
      await supabase.from('swipe_events').insert({
        user_id: user.id,
        ...event,
      }).then(({ error }) => {
        if (error) console.warn('Swipe not persisted:', error.message)
      })
    }
  }, [user, context])

  const leftSwipeCount = swipes.filter(s => s.direction === 'left').length

  return { swipes, saved, recordSwipe, leftSwipeCount }
}
