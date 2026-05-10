import { LogOut, Zap, Heart } from 'lucide-react'
import { Logo } from '../ui/Logo'

export function ProfileScreen({ user, isGuest, swipeHistory, saved, onSignOut }) {
  const totalSwipes = swipeHistory.length
  const rightSwipes = swipeHistory.filter(s => s.direction === 'right').length
  const displayName = isGuest ? 'Guest' : (user?.email?.split('@')[0] ?? 'You')
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-20">
      {/* Header */}
      <div className="px-5 pt-8 pb-6 safe-top">
        <Logo className="text-xl mb-6" />

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange/15 flex items-center justify-center">
            <span className="font-display font-bold text-orange text-lg">{initials}</span>
          </div>
          <div>
            <p className="font-display font-semibold text-ink text-lg">{displayName}</p>
            {!isGuest && user?.email && (
              <p className="font-body text-stone-dark text-xs mt-0.5">{user.email}</p>
            )}
            {isGuest && (
              <p className="font-body text-xs text-orange mt-0.5">Guest session</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 space-y-6 overflow-y-auto pb-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Zap size={18} className="text-orange" />}
            value={totalSwipes}
            label="Total swipes"
          />
          <StatCard
            icon={<Heart size={18} className="text-orange" />}
            value={saved.length}
            label="Saved activities"
          />
        </div>

        {/* Guest upsell */}
        {isGuest && (
          <div className="bg-orange/8 border border-orange/20 rounded-2xl px-4 py-4">
            <p className="font-display font-semibold text-ink text-sm mb-1">
              Save your preferences
            </p>
            <p className="font-body text-stone-dark text-xs leading-relaxed mb-3">
              Create a free account and your exclusions, budget defaults, and swipe history sync across devices.
            </p>
            <p className="font-body text-xs text-orange">
              Sign up from the home screen — your guest session will carry over.
            </p>
          </div>
        )}

        {/* About */}
        <div className="bg-white rounded-2xl px-4 py-4">
          <p className="font-display font-semibold text-ink text-sm mb-1">About Faff</p>
          <p className="font-body text-stone-dark text-xs leading-relaxed">
            Even &lsquo;nothing&rsquo; is a plan. Faff helps you decide what to do with your day
            — no commitment required, no endless scrolling, just a gentle nudge.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 text-stone-dark font-body text-sm py-4 rounded-2xl border border-stone-light hover:bg-stone-light/50 active:scale-[0.98] transition-all"
        >
          <LogOut size={16} />
          {isGuest ? 'Leave guest mode' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex flex-col gap-2">
      {icon}
      <div>
        <p className="font-display font-bold text-ink text-2xl leading-none">{value}</p>
        <p className="font-body text-xs text-stone-dark mt-0.5">{label}</p>
      </div>
    </div>
  )
}
