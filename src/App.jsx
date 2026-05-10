import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { useLocation } from './hooks/useLocation'
import { useWeather } from './hooks/useWeather'
import { useSwipeHistory } from './hooks/useSwipeHistory'
import { useSettings } from './hooks/useSettings'
import { AuthScreen } from './components/auth/AuthScreen'
import { ContextSnapshot } from './components/context/ContextSnapshot'
import { SwipeFeed } from './components/feed/SwipeFeed'
import { SettingsScreen } from './components/settings/SettingsScreen'
import { BottomNav } from './components/ui/BottomNav'
import { ACTIVITIES, rankActivities } from './data/activities'

const SCREEN = { AUTH: 'auth', CONTEXT: 'context', APP: 'app' }

export default function App() {
  const auth = useAuth()
  const { coords, requestLocation } = useLocation()
  const weather = useWeather(coords)
  const { settings, updateSettings, addExclusion, removeExclusion } = useSettings(auth.user)

  const [screen, setScreen] = useState(SCREEN.AUTH)
  const [activeTab, setActiveTab] = useState('feed') // 'feed' | 'settings'
  const [context, setContext] = useState(null)
  const [rankedActivities, setRankedActivities] = useState([])

  const { swipes, saved, recordSwipe, updateFeedback } = useSwipeHistory(auth.user, context)

  // Auto-advance when Supabase auth completes
  useEffect(() => {
    if (!auth.loading && auth.user && screen === SCREEN.AUTH) {
      advanceToContext()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user])

  // ── Auth ──────────────────────────────────────────────────────────────────

  async function handleEmailAuth(email, password, isSignup) {
    if (isSignup) {
      await auth.signUpWithEmail(email, password)
    } else {
      await auth.signInWithEmail(email, password)
      advanceToContext()
    }
  }

  function handleGuest() {
    auth.continueAsGuest()
    advanceToContext()
  }

  function advanceToContext() {
    requestLocation()
    setScreen(SCREEN.CONTEXT)
  }

  // ── Context ───────────────────────────────────────────────────────────────

  function handleContextSubmit(ctx) {
    // Merge in the effective budget (override or settings default)
    const enrichedContext = {
      ...ctx,
      defaultBudget: settings.budget_daily,
    }
    setContext(enrichedContext)
    setRankedActivities(rankActivities(ACTIVITIES, enrichedContext, settings, weather))
    setScreen(SCREEN.APP)
    setActiveTab('feed')
  }

  function handleReset() {
    setContext(null)
    setRankedActivities([])
    setScreen(SCREEN.CONTEXT)
  }

  // ── Swipe + feedback ──────────────────────────────────────────────────────

  function handleFeedback(reason, permanent, activity) {
    // Persist the reason on the swipe event
    updateFeedback(reason)

    if (!permanent || !activity) return

    // Permanent category signal
    if (reason === 'not_my_thing') {
      addExclusion('category', activity.category)
    }
    // Permanent activity exclusion
    if (reason === 'never_show') {
      addExclusion('activity_id', activity.id)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (auth.loading) {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <p className="font-display text-4xl text-ink font-semibold">faff</p>
      </div>
    )
  }

  // ── Screens ───────────────────────────────────────────────────────────────

  if (screen === SCREEN.AUTH || !auth.isAuthenticated) {
    return (
      <AuthScreen
        onGuest={handleGuest}
        onEmailAuth={handleEmailAuth}
        onGoogle={auth.signInWithGoogle}
      />
    )
  }

  if (screen === SCREEN.CONTEXT) {
    return (
      <ContextSnapshot
        onSubmit={handleContextSubmit}
        weather={weather}
        defaultBudget={settings.budget_daily}
      />
    )
  }

  if (screen === SCREEN.APP) {
    return (
      <div className="flex flex-col min-h-dvh bg-cream">
        {/* Tab content */}
        <div className="flex-1">
          {activeTab === 'feed' && rankedActivities.length > 0 ? (
            <SwipeFeed
              activities={rankedActivities}
              context={context}
              onSwipe={recordSwipe}
              onFeedback={handleFeedback}
              onReset={handleReset}
              saved={saved}
              swipeHistory={swipes}
            />
          ) : activeTab === 'feed' ? (
            /* No activities match — relax filters */
            <NoResultsState
              onReset={handleReset}
              onOpenSettings={() => setActiveTab('settings')}
            />
          ) : (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={updateSettings}
              onAddExclusion={addExclusion}
              onRemoveExclusion={removeExclusion}
            />
          )}
        </div>

        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    )
  }

  return null
}

function NoResultsState({ onReset, onOpenSettings }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh text-center px-8 pb-20">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="font-display text-xl font-semibold text-ink mb-2">
        Nothing quite fits right now.
      </h3>
      <p className="font-body text-stone-dark text-sm leading-relaxed mb-6">
        Your filters are being rather picky. Which is fair — but there might be
        nothing left after applying energy, budget, time, and exclusions all at once.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={onReset} className="btn-primary w-full text-center">
          Try different settings
        </button>
        <button onClick={onOpenSettings} className="btn-ghost w-full text-center text-stone-dark">
          Check exclusion list
        </button>
      </div>
    </div>
  )
}
