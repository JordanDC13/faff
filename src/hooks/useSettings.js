import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'faff_settings'

export const DEFAULT_SETTINGS = {
  budget_daily: 50,
  budget_meal: 20,
  budget_drinks: 15,
  budget_activity: 25,
  max_travel_km: 10,
  excluded_categories: [],
  excluded_activity_ids: [],
}

export function useSettings(user) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS }
    } catch {
      return { ...DEFAULT_SETTINGS }
    }
  })
  const [loading, setLoading] = useState(false)

  // Load persisted settings from Supabase for authenticated users
  useEffect(() => {
    if (!supabase || !user?.id) return
    setLoading(true)
    supabase
      .from('user_preference_profiles')
      .select('settings_json')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.settings_json) {
          const merged = { ...DEFAULT_SETTINGS, ...data.settings_json }
          setSettings(merged)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        }
        setLoading(false)
      })
  }, [user?.id])

  const persist = useCallback(async (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    if (supabase && user?.id) {
      await supabase.from('user_preference_profiles').upsert({
        user_id: user.id,
        preferred_budget_avg: newSettings.budget_daily,
        settings_json: newSettings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }
  }, [user?.id])

  const updateSettings = useCallback((updates) => {
    persist({ ...settings, ...updates })
  }, [settings, persist])

  const addExclusion = useCallback((type, value) => {
    const key = type === 'category' ? 'excluded_categories' : 'excluded_activity_ids'
    if (settings[key].includes(value)) return
    persist({ ...settings, [key]: [...settings[key], value] })
  }, [settings, persist])

  const removeExclusion = useCallback((type, value) => {
    const key = type === 'category' ? 'excluded_categories' : 'excluded_activity_ids'
    persist({ ...settings, [key]: settings[key].filter(v => v !== value) })
  }, [settings, persist])

  return { settings, loading, updateSettings, addExclusion, removeExclusion }
}
