import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useLocation } from './hooks/useLocation'
import { useWeather } from './hooks/useWeather'
import { useSwipeHistory } from './hooks/useSwipeHistory'
import { AuthScreen } from './components/auth/AuthScreen'
import { ContextSnapshot } from './components/context/ContextSnapshot'
import { SwipeFeed } from './components/feed/SwipeFeed'
import { ACTIVITIES, rankActivities } from './data/activities'

const SCREEN = { AUTH: 'auth', CONTEXT: 'context', FEED: 'feed' }

export default function App() {
  const auth = useAuth()
  const { coords, requestLocation } = useLocation()
  const weather = useWeather(coords)

  const [screen, setScreen] = useState(SCREEN.AUTH)
  const [context, setContext] = useState(null)
  const [rankedActivities, setRankedActivities] = useState([])

  const { swipes, saved, recordSwipe } = useSwipeHistory(auth.user, context)

  // Auto-advance when Supabase auth completes
  useEffect(() => {
    if (!auth.loading && auth.user && screen === SCREEN.AUTH) {
      advanceToContext()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user])

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

  function handleContextSubmit(ctx) {
    setContext(ctx)
    setRankedActivities(rankActivities(ACTIVITIES, ctx))
    setScreen(SCREEN.FEED)
  }

  function handleReset() {
    setContext(null)
    setRankedActivities([])
    setScreen(SCREEN.CONTEXT)
  }

  if (auth.loading) {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <p className="font-display text-4xl text-ink font-semibold">faff</p>
      </div>
    )
  }

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
    return <ContextSnapshot onSubmit={handleContextSubmit} weather={weather} />
  }

  if (screen === SCREEN.FEED && rankedActivities.length > 0) {
    return (
      <SwipeFeed
        activities={rankedActivities}
        context={context}
        onSwipe={recordSwipe}
        onReset={handleReset}
        saved={saved}
        swipeHistory={swipes}
      />
    )
  }

  return null
}
