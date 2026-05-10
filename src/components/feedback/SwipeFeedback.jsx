import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const AUTO_DISMISS_MS = 4000

const OPTIONS = [
  { id: 'not_my_thing',  label: 'Not my kind of thing',  emoji: '👎', permanent: true },
  { id: 'wrong_energy',  label: 'Wrong energy for today', emoji: '⚡', permanent: false },
  { id: 'too_far',       label: 'Too far away',           emoji: '📍', permanent: false },
  { id: 'too_expensive', label: 'Too expensive',          emoji: '💸', permanent: false },
  { id: 'never_show',    label: 'Never show me this',     emoji: '🚫', permanent: true, destructive: true },
]

export function SwipeFeedback({ activity, onFeedback, onDismiss }) {
  const [progress, setProgress] = useState(100)
  const [confirming, setConfirming] = useState(false)
  const startRef = useRef(Date.now())
  const pausedRef = useRef(false)

  // Countdown bar — pauses while confirm dialog is open
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return
      const elapsed = Date.now() - startRef.current
      const pct = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100)
      setProgress(pct)
      if (pct <= 0) {
        clearInterval(id)
        onDismiss()
      }
    }, 50)
    return () => clearInterval(id)
  }, [onDismiss])

  useEffect(() => {
    pausedRef.current = confirming
  }, [confirming])

  function handleOption(opt) {
    if (opt.id === 'never_show') {
      setConfirming(true)
      return
    }
    onFeedback(opt.id, opt.permanent)
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-[0_-8px_32px_rgba(45,45,45,0.12)]"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Progress bar */}
      <div className="mx-5 mt-3 h-1 bg-stone-light rounded-full overflow-hidden">
        <div
          className="h-full bg-orange rounded-full"
          style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {confirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="px-5 pt-4 pb-2"
          >
            <p className="font-display text-lg font-semibold text-ink mb-1">
              Remove from your feed?
            </p>
            <p className="font-body text-stone-dark text-sm mb-5 leading-relaxed">
              &ldquo;{activity.title}&rdquo; won&rsquo;t appear again. You can undo this in Settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 bg-stone-light text-ink font-body font-medium px-4 py-3 rounded-2xl active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => onFeedback('never_show', true)}
                className="flex-1 bg-ink text-cream font-body font-medium px-4 py-3 rounded-2xl active:scale-95 transition-all"
              >
                Remove it
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="px-5 pt-3 pb-2"
          >
            <p className="font-body text-stone-dark text-xs uppercase tracking-wider mb-3">
              What put you off?
            </p>
            <div className="flex flex-col gap-1.5">
              {OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleOption(opt)}
                  className={clsx(
                    'flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-2xl transition-all active:scale-[0.98]',
                    opt.destructive
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-stone-light/60 text-ink hover:bg-stone-light',
                  )}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span className="font-body text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={onDismiss}
              className="w-full text-center font-body text-stone text-xs py-3 mt-1"
            >
              Skip — just show me the next one
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// clsx is not imported at module level — inline it here to avoid a separate import
function clsx(...classes) {
  return classes.filter(Boolean).join(' ')
}
