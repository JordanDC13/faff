import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Heart, X, Bookmark } from 'lucide-react'
import { SwipeCard } from './SwipeCard'
import { ActivityCard } from '../cards/ActivityCard'
import { WildcardCard } from '../cards/WildcardCard'
import { CardDetail } from '../cards/CardDetail'
import { SwipeFeedback } from '../feedback/SwipeFeedback'
import { Logo } from '../ui/Logo'
import { EnergyDots } from '../ui/EnergyDots'
import { clsx } from 'clsx'

const WILDCARD_THRESHOLD = 5

export function SwipeFeed({
  activities,
  context,
  onSwipe,
  onFeedback,
  onReset,
  saved,
  swipeHistory,
  startWithWildcard = false,
}) {
  const [topIndex, setTopIndex] = useState(activities.length - 1)
  const [leftStreak, setLeftStreak] = useState(0)
  const [showWildcard, setShowWildcard] = useState(startWithWildcard)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [swipeIndicator, setSwipeIndicator] = useState(null)
  const [isOutOfCards, setIsOutOfCards] = useState(false)

  const [feedbackActivity, setFeedbackActivity] = useState(null)
  const lastSwipedActivityRef = useRef(null)
  const cardRefs = useRef({})

  useEffect(() => {
    setTopIndex(activities.length - 1)
    setLeftStreak(0)
    setShowWildcard(startWithWildcard)
    setIsOutOfCards(false)
    setFeedbackActivity(null)
    cardRefs.current = {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities])

  const handleSwipe = useCallback((direction, activity) => {
    setSwipeIndicator(null)
    onSwipe(activity, direction)

    if (direction === 'left') {
      lastSwipedActivityRef.current = activity
      setFeedbackActivity(activity)
      const newStreak = leftStreak + 1
      setLeftStreak(newStreak)
      if (newStreak >= WILDCARD_THRESHOLD) {
        setShowWildcard(true)
        return
      }
    } else {
      setLeftStreak(0)
    }

    setTopIndex(prev => {
      const next = prev - 1
      if (next < 0) setIsOutOfCards(true)
      return next
    })
  }, [onSwipe, leftStreak])

  function handleFeedback(reason, permanent) {
    onFeedback(reason, permanent, lastSwipedActivityRef.current)
    setFeedbackActivity(null)
  }

  function triggerSwipe(direction) {
    if (topIndex < 0 || showWildcard) return
    cardRefs.current[topIndex]?.swipe(direction)
  }

  function handleWildcardAccept() {
    const pick = activities[Math.floor(Math.random() * activities.length)]
    setSelectedActivity(pick)
    setShowWildcard(false)
    setLeftStreak(0)
    setTopIndex(prev => {
      const next = prev - 1
      if (next < 0) setIsOutOfCards(true)
      return next
    })
  }

  const personalised = swipeHistory.length >= 10
  const canSwipe = topIndex >= 0 && !showWildcard && !isOutOfCards

  // ── Derive a human-readable mood label from context ──────────────────────
  const moodLabel = context.moodLabel ?? context.vibe ?? null

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2 safe-top flex-shrink-0">
        <div>
          <Logo className="text-xl" />
          {personalised && (
            <p className="font-body text-xs text-orange mt-0.5">Personalised for you ✦</p>
          )}
        </div>
        {/* Energy + change context */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-stone-light">
            <EnergyDots value={context.energy} size="sm" />
          </div>
          <button
            onClick={onReset}
            className="font-body text-xs text-stone-dark hover:text-orange transition-colors px-2 py-1"
          >
            change
          </button>
        </div>
      </div>

      {/* Context pills */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto flex-shrink-0">
        {moodLabel && <Pill className="capitalize">{moodLabel}</Pill>}
        <Pill>
          {(context.budgetOverride ?? context.defaultBudget) != null
            ? `£${context.budgetOverride ?? context.defaultBudget}`
            : '£?'}
          {context.budgetOverride != null ? ' today' : ''}
        </Pill>
        {saved.length > 0 && (
          <span className="flex-shrink-0 bg-orange/10 border border-orange/20 text-orange text-xs font-body px-3 py-1 rounded-full">
            {saved.length} saved
          </span>
        )}
      </div>

      {/* Card area — min-h-0 lets flex-1 shrink below its content so cards never overlap the buttons */}
      <div className="flex-1 min-h-0 relative px-5">
        <div className="relative h-full" style={{ maxHeight: '520px' }}>
          {isOutOfCards && !showWildcard ? (
            <EmptyState onReset={onReset} />
          ) : showWildcard ? (
            <WildcardCard onAccept={handleWildcardAccept} />
          ) : (
            <>
              <SwipeLabel side="left"  visible={swipeIndicator === 'right'}>YESSS</SwipeLabel>
              <SwipeLabel side="right" visible={swipeIndicator === 'left'}>NOPE</SwipeLabel>

              {[topIndex - 2, topIndex - 1, topIndex].map(idx => {
                if (idx < 0 || idx >= activities.length) return null
                const activity = activities[idx]
                const isTop = idx === topIndex
                const offset = topIndex - idx

                return (
                  <div
                    key={activity.id}
                    className="absolute inset-0"
                    style={{
                      zIndex: 10 + (2 - offset),
                      transform: offset > 0
                        ? `scale(${1 - offset * 0.04}) translateY(${offset * 10}px)`
                        : undefined,
                      transition: 'transform 0.3s ease',
                      pointerEvents: isTop ? 'auto' : 'none',
                    }}
                  >
                    {isTop ? (
                      <SwipeCard
                        ref={el => { if (el) cardRefs.current[idx] = el }}
                        onSwipe={dir => handleSwipe(dir, activity)}
                        onDirectionChange={setSwipeIndicator}
                      >
                        <div className="w-full h-full" onClick={() => setSelectedActivity(activity)}>
                          <ActivityCard activity={activity} />
                        </div>
                      </SwipeCard>
                    ) : (
                      <ActivityCard activity={activity} />
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* Action buttons — relative + z-30 keeps them above the card stack regardless of overflow */}
      {!isOutOfCards && !showWildcard && (
        <div className="relative z-30 flex items-center justify-center gap-8 px-5 py-5 flex-shrink-0">
          <ActionButton icon={<X size={28} />}     label="Nope" variant="stone"  onClick={() => triggerSwipe('left')}  disabled={!canSwipe} />
          <SavedBadge count={saved.length} />
          <ActionButton icon={<Heart size={28} />} label="Yes!" variant="orange" onClick={() => triggerSwipe('right')} disabled={!canSwipe} />
        </div>
      )}

      {/* Left-swipe feedback sheet */}
      <AnimatePresence>
        {feedbackActivity && (
          <SwipeFeedback
            activity={feedbackActivity}
            onFeedback={handleFeedback}
            onDismiss={() => setFeedbackActivity(null)}
          />
        )}
      </AnimatePresence>

      {/* Card detail sheet */}
      {selectedActivity && (
        <CardDetail
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onSave={() => { onSwipe(selectedActivity, 'right'); setSelectedActivity(null) }}
          onDismiss={() => setSelectedActivity(null)}
        />
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Pill({ children, className = '' }) {
  return (
    <span className={`flex-shrink-0 bg-white border border-stone-light text-ink text-xs font-body px-3 py-1 rounded-full ${className}`}>
      {children}
    </span>
  )
}

function SwipeLabel({ side, visible, children }) {
  return (
    <div className={clsx(
      'absolute top-1/3 z-30 font-display text-2xl font-bold px-5 py-2 rounded-2xl pointer-events-none transition-opacity duration-100',
      side === 'left' ? 'left-3 -rotate-12 bg-orange text-cream' : 'right-3 rotate-12 bg-stone text-ink',
      visible ? 'opacity-100' : 'opacity-0',
    )}>
      {children}
    </div>
  )
}

function ActionButton({ icon, label, variant, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={clsx(
        'flex flex-col items-center rounded-full p-4 border-2 shadow-card transition-all duration-200 active:scale-90',
        variant === 'orange'
          ? 'bg-white border-orange text-orange hover:bg-orange/5'
          : 'bg-white border-stone text-stone-dark hover:bg-stone-light/50',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {icon}
    </button>
  )
}

function SavedBadge({ count }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-stone-light text-stone-dark shadow-card">
        <Bookmark size={22} />
      </div>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange text-cream text-xs font-body font-medium w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
      <span className="text-xs font-body text-stone-dark mt-1">Saved</span>
    </div>
  )
}

function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="text-5xl mb-4">🌿</div>
      <h3 className="font-display text-xl font-semibold text-ink mb-2">You&rsquo;ve seen the lot.</h3>
      <p className="font-body text-stone-dark text-sm leading-relaxed mb-6">
        Very thorough. Perhaps change things up a bit?
      </p>
      <button onClick={onReset} className="btn-primary">Start fresh</button>
    </div>
  )
}
