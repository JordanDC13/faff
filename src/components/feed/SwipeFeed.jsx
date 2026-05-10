import { useState, useRef, useCallback, useEffect } from 'react'
import TinderCard from 'react-tinder-card'
import { Heart, X, Bookmark, Settings } from 'lucide-react'
import { ActivityCard } from '../cards/ActivityCard'
import { WildcardCard } from '../cards/WildcardCard'
import { CardDetail } from '../cards/CardDetail'
import { Logo } from '../ui/Logo'
import { EnergyDots } from '../ui/EnergyDots'
import { clsx } from 'clsx'

const WILDCARD_THRESHOLD = 5

export function SwipeFeed({ activities, context, onSwipe, onReset, saved, swipeHistory }) {
  const [deck, setDeck] = useState(activities)
  const [currentIndex, setCurrentIndex] = useState(activities.length - 1)
  const [leftSwipeStreak, setLeftSwipeStreak] = useState(0)
  const [showWildcard, setShowWildcard] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [swipeIndicator, setSwipeIndicator] = useState(null) // 'left' | 'right'
  const [isOutOfCards, setIsOutOfCards] = useState(false)

  const cardRefs = useRef([])
  const canSwipe = currentIndex >= 0 && !showWildcard

  // keep refs in sync with deck length
  useEffect(() => {
    cardRefs.current = activities.map((_, i) => cardRefs.current[i] || null)
    setDeck(activities)
    setCurrentIndex(activities.length - 1)
    setLeftSwipeStreak(0)
    setShowWildcard(false)
    setIsOutOfCards(false)
  }, [activities])

  const onCardLeftScreen = useCallback((direction, activity) => {
    setSwipeIndicator(null)
    onSwipe(activity, direction)

    const isLeft = direction === 'left'
    const newStreak = isLeft ? leftSwipeStreak + 1 : 0
    setLeftSwipeStreak(newStreak)

    if (newStreak >= WILDCARD_THRESHOLD) {
      setShowWildcard(true)
      return
    }

    setCurrentIndex(prev => {
      const next = prev - 1
      if (next < 0) setIsOutOfCards(true)
      return next
    })
  }, [onSwipe, leftSwipeStreak])

  const onSwipeDirection = useCallback((direction) => {
    setSwipeIndicator(direction)
  }, [])

  const swipeCard = useCallback(async (direction) => {
    if (!canSwipe) return
    const ref = cardRefs.current[currentIndex]
    if (ref) await ref.swipe(direction)
  }, [canSwipe, currentIndex])

  function handleWildcardAccept() {
    const randomActivity = activities[Math.floor(Math.random() * activities.length)]
    setSelectedActivity(randomActivity)
    setShowWildcard(false)
    setLeftSwipeStreak(0)
    setCurrentIndex(prev => prev - 1)
  }

  function handleCardTap(activity) {
    setSelectedActivity(activity)
  }

  function handleDetailSave() {
    // Treat tapping "Let's do this" from detail as a right swipe
    if (selectedActivity) {
      onSwipe(selectedActivity, 'right')
      setSelectedActivity(null)
    }
  }

  function handleDetailDismiss() {
    // Treat as left swipe (already counted when card swiped, so just close)
    setSelectedActivity(null)
  }

  const personalised = swipeHistory.length >= 10

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2 safe-top">
        <div>
          <Logo className="text-xl" />
          {personalised && (
            <p className="font-body text-xs text-orange mt-0.5">Personalised for you ✦</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-stone-light">
            <EnergyDots value={context.energy} size="sm" />
          </div>
          <button
            onClick={onReset}
            className="p-2 text-stone-dark hover:text-ink transition-colors"
            aria-label="Change context"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Context pills */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto">
        <span className="flex-shrink-0 bg-white border border-stone-light text-ink text-xs font-body px-3 py-1 rounded-full">
          £{context.budget === 0 ? '0' : `≤${context.budget}`}
        </span>
        <span className="flex-shrink-0 bg-white border border-stone-light text-ink text-xs font-body px-3 py-1 rounded-full capitalize">
          {context.vibe}
        </span>
        <span className="flex-shrink-0 bg-white border border-stone-light text-ink text-xs font-body px-3 py-1 rounded-full capitalize">
          {context.solo_social === 'both' ? 'Solo or social' : context.solo_social}
        </span>
        {saved.length > 0 && (
          <span className="flex-shrink-0 bg-orange/10 border border-orange/20 text-orange text-xs font-body px-3 py-1 rounded-full">
            {saved.length} saved
          </span>
        )}
      </div>

      {/* Card stack */}
      <div className="flex-1 relative px-5">
        {isOutOfCards && !showWildcard ? (
          <EmptyState onReset={onReset} />
        ) : showWildcard ? (
          <div className="absolute inset-0 flex items-center justify-center px-5">
            <div className="w-full" style={{ height: 'min(520px, 70vh)' }}>
              <WildcardCard onAccept={handleWildcardAccept} />
            </div>
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{ touchAction: 'none' }}
          >
            {/* Swipe hint overlays */}
            <div
              className={clsx(
                'absolute left-5 top-1/3 z-30 bg-orange text-cream font-display text-2xl font-bold px-5 py-2 rounded-2xl rotate-[-12deg] transition-opacity duration-150',
                swipeIndicator === 'right' ? 'opacity-100' : 'opacity-0',
              )}
            >
              YESSS
            </div>
            <div
              className={clsx(
                'absolute right-5 top-1/3 z-30 bg-stone text-ink font-display text-2xl font-bold px-5 py-2 rounded-2xl rotate-[12deg] transition-opacity duration-150',
                swipeIndicator === 'left' ? 'opacity-100' : 'opacity-0',
              )}
            >
              NOPE
            </div>

            {/* Cards */}
            {deck.map((activity, index) => {
              const isTop = index === currentIndex
              const isSecond = index === currentIndex - 1
              if (!isTop && !isSecond && index !== currentIndex - 2) return null

              return (
                <TinderCard
                  key={activity.id}
                  ref={el => (cardRefs.current[index] = el)}
                  onSwipe={(dir) => onCardLeftScreen(dir, activity)}
                  onCardLeftScreen={() => {}}
                  preventSwipe={[]}
                  swipeRequirementType="position"
                  swipeThreshold={80}
                  className="absolute inset-0"
                >
                  <div
                    className="w-full h-full px-0 py-0 cursor-grab active:cursor-grabbing"
                    style={{
                      transform: isSecond ? 'scale(0.96) translateY(8px)' : undefined,
                      zIndex: isTop ? 20 : 10,
                      transition: 'transform 0.3s ease',
                    }}
                    onClick={() => isTop && handleCardTap(activity)}
                    onPointerMove={(e) => {
                      if (!isTop) return
                      const rect = e.currentTarget.closest('.absolute.inset-0')?.getBoundingClientRect()
                      if (!rect) return
                      const midX = rect.left + rect.width / 2
                      if (e.clientX > midX + 40) setSwipeIndicator('right')
                      else if (e.clientX < midX - 40) setSwipeIndicator('left')
                      else setSwipeIndicator(null)
                    }}
                    onPointerUp={() => setSwipeIndicator(null)}
                    onPointerLeave={() => setSwipeIndicator(null)}
                  >
                    <div style={{ height: 'min(520px, 70vh)', width: '100%' }}>
                      <ActivityCard activity={activity} />
                    </div>
                  </div>
                </TinderCard>
              )
            })}
          </div>
        )}

        {/* Spacer for card area */}
        <div style={{ height: 'min(520px, 70vh)' }} />
      </div>

      {/* Action buttons */}
      {!isOutOfCards && !showWildcard && (
        <div className="flex items-center justify-center gap-8 px-5 py-6 safe-bottom">
          <SwipeButton
            icon={<X size={28} />}
            label="Nope"
            color="stone"
            onClick={() => swipeCard('left')}
            disabled={!canSwipe}
          />
          <SaveButton saved={saved} />
          <SwipeButton
            icon={<Heart size={28} />}
            label="Yes!"
            color="orange"
            onClick={() => swipeCard('right')}
            disabled={!canSwipe}
          />
        </div>
      )}

      {/* Card detail sheet */}
      {selectedActivity && (
        <CardDetail
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onSave={handleDetailSave}
          onDismiss={handleDetailDismiss}
        />
      )}
    </div>
  )
}

function SwipeButton({ icon, label, color, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={clsx(
        'flex flex-col items-center gap-1 rounded-full p-4 transition-all duration-200 active:scale-90',
        'border-2 shadow-card',
        color === 'orange'
          ? 'bg-white border-orange text-orange hover:bg-orange/5'
          : 'bg-white border-stone text-stone-dark hover:bg-stone-light/50',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {icon}
    </button>
  )
}

function SaveButton({ saved }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-stone-light text-stone-dark shadow-card">
        <Bookmark size={22} />
      </div>
      {saved.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange text-cream text-xs font-body font-medium w-5 h-5 rounded-full flex items-center justify-center">
          {saved.length}
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
      <h3 className="font-display text-xl font-semibold text-ink mb-2">
        You've seen the lot.
      </h3>
      <p className="font-body text-stone-dark text-sm leading-relaxed mb-6">
        Very thorough of you. Perhaps you do know exactly what you want — or perhaps
        you'd like to change things up a bit?
      </p>
      <button onClick={onReset} className="btn-primary">
        Start fresh
      </button>
    </div>
  )
}
