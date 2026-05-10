import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useLocation } from './hooks/useLocation'
import { useWeather } from './hooks/useWeather'
import { useSwipeHistory } from './hooks/useSwipeHistory'
import { useSettings } from './hooks/useSettings'
import { AuthScreen } from './components/auth/AuthScreen'
import { MoodPicker } from './components/home/MoodPicker'
import { ContextSnapshot } from './components/context/ContextSnapshot'
import { SwipeFeed } from './components/feed/SwipeFeed'
import { SavedScreen } from './components/saved/SavedScreen'
import { SettingsScreen } from './components/settings/SettingsScreen'
import { ProfileScreen } from './components/profile/ProfileScreen'
import { BottomNav } from './components/ui/BottomNav'
import { ACTIVITIES, rankActivities } from './data/activities'

// ── Top-level screen states ───────────────────────────────────────────────────
// AUTH → the auth wall
// CONTEXT → full context snapshot form (no bottom nav)
// APP → main app shell with bottom nav tabs
const SCREEN = { AUTH: 'auth', CONTEXT: 'context', APP: 'app' }

export default function App() {
  const auth = useAuth()
  const { coords, requestLocation } = useLocation()
  const weather = useWeather(coords)
  const { settings, updateSettings, addExclusion, removeExclusion } = useSettings(auth.user)

  const [screen, setScreen] = useState(SCREEN.AUTH)
  const [activeTab, setActiveTab] = useState('home')

  // Feed state — null means "show MoodPicker", set means "show SwipeFeed"
  const [context, setContext] = useState(null)
  const [rankedActivities, setRankedActivities] = useState([])
  const [startWithWildcard, setStartWithWildcard] = useState(false)

  const { swipes, saved, recordSwipe, updateFeedback } = useSwipeHistory(auth.user, context)

  // Auto-advance when Supabase OAuth completes
  useEffect(() => {
    if (!auth.loading && auth.user && screen === SCREEN.AUTH) {
      enterApp()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user])

  // ── Navigation ────────────────────────────────────────────────────────────

  function enterApp() {
    requestLocation()
    setScreen(SCREEN.APP)
  }

  function goHome() {
    setContext(null)
    setRankedActivities([])
    setStartWithWildcard(false)
    setActiveTab('home')
  }

  function handleTabChange(tab) {
    // Tapping Home while in the feed goes back to MoodPicker
    if (tab === 'home' && activeTab === 'home' && context !== null) {
      goHome()
      return
    }
    setActiveTab(tab)
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async function handleEmailAuth(email, password, isSignup) {
    if (isSignup) {
      await auth.signUpWithEmail(email, password)
    } else {
      await auth.signInWithEmail(email, password)
      enterApp()
    }
  }

  function handleGuest() {
    auth.continueAsGuest()
    enterApp()
  }

  // ── Mood tile tap (no confirmation — go straight to feed) ─────────────────

  function handleSelectMood(preset, isWildcard, defaultBudget) {
    const ctx = {
      ...preset,
      defaultBudget,
      moodLabel: preset.vibe,
    }
    setContext(ctx)
    setStartWithWildcard(isWildcard)
    setRankedActivities(rankActivities(ACTIVITIES, ctx, settings, weather))
    // Stay on home tab — feed renders in place of MoodPicker
  }

  // ── Full context form ("or set your own vibe") ────────────────────────────

  function handleCustomVibe() {
    setScreen(SCREEN.CONTEXT)
  }

  function handleContextSubmit(ctx) {
    const enriched = { ...ctx, defaultBudget: settings.budget_daily }
    setContext(enriched)
    setStartWithWildcard(false)
    setRankedActivities(rankActivities(ACTIVITIES, enriched, settings, weather))
    setScreen(SCREEN.APP)
    setActiveTab('home')
  }

  // ── Swipe feedback ────────────────────────────────────────────────────────

  function handleFeedback(reason, permanent, activity) {
    updateFeedback(reason)
    if (!permanent || !activity) return
    if (reason === 'not_my_thing') addExclusion('category', activity.category)
    if (reason === 'never_show')   addExclusion('activity_id', activity.id)
  }

  // ── Loading splash ────────────────────────────────────────────────────────

  if (auth.loading) {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <p className="font-display text-4xl text-ink font-semibold">faff</p>
      </div>
    )
  }

  // ── Auth wall ─────────────────────────────────────────────────────────────

  if (screen === SCREEN.AUTH || !auth.isAuthenticated) {
    return (
      <AuthScreen
        onGuest={handleGuest}
        onEmailAuth={handleEmailAuth}
        onGoogle={auth.signInWithGoogle}
      />
    )
  }

  // ── Full context form (no bottom nav) ─────────────────────────────────────

  if (screen === SCREEN.CONTEXT) {
    return (
      <ContextSnapshot
        onSubmit={handleContextSubmit}
        weather={weather}
        defaultBudget={settings.budget_daily}
      />
    )
  }

  // ── Main app shell ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      <div className="flex-1">
        {activeTab === 'home' && (
          context && rankedActivities.length > 0 ? (
            <SwipeFeed
              activities={rankedActivities}
              context={context}
              onSwipe={recordSwipe}
              onFeedback={handleFeedback}
              onReset={goHome}
              saved={saved}
              swipeHistory={swipes}
              startWithWildcard={startWithWildcard}
            />
          ) : context && rankedActivities.length === 0 ? (
            <NoResultsState
              onGoHome={goHome}
              onOpenSettings={() => setActiveTab('settings')}
            />
          ) : (
            <MoodPicker
              weather={weather}
              defaultBudget={settings.budget_daily}
              onSelectMood={handleSelectMood}
              onCustomVibe={handleCustomVibe}
            />
          )
        )}

        {activeTab === 'saved' && (
          <SavedScreen saved={saved} />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={updateSettings}
            onAddExclusion={addExclusion}
            onRemoveExclusion={removeExclusion}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            user={auth.user}
            isGuest={auth.isGuest}
            swipeHistory={swipes}
            saved={saved}
            onSignOut={() => { auth.signOut(); setScreen(SCREEN.AUTH) }}
          />
        )}
      </div>

      <BottomNav active={activeTab} onChange={handleTabChange} />
    </div>
  )
}

// ── Shared sub-component ──────────────────────────────────────────────────────

function NoResultsState({ onGoHome, onOpenSettings }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh text-center px-8 pb-20">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="font-display text-xl font-semibold text-ink mb-2">
        Nothing quite fits right now.
      </h3>
      <p className="font-body text-stone-dark text-sm leading-relaxed mb-6">
        Your filters are being rather picky — try a different mood, or check your exclusion list.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={onGoHome} className="btn-primary w-full text-center">
          Try a different mood
        </button>
        <button onClick={onOpenSettings} className="btn-ghost w-full text-center text-stone-dark">
          Check exclusions
        </button>
      </div>
    </div>
  )
}
