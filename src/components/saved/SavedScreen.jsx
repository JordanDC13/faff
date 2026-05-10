import { Bookmark } from 'lucide-react'
import { useState } from 'react'
import { CardDetail } from '../cards/CardDetail'
import { EnergyDots } from '../ui/EnergyDots'
import { CATEGORY_LABELS } from '../../data/activities'

function formatCost(min, max) {
  if (min === 0 && max === 0) return 'Free'
  if (min === 0) return `Up to £${max}`
  return `£${min}–£${max}`
}

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  if (mins === 60) return '1 hr'
  if (mins % 60 === 0) return `${mins / 60} hrs`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export function SavedScreen({ saved }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-20">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 safe-top">
        <h1 className="font-display text-2xl font-semibold text-ink">Saved</h1>
        {saved.length > 0 && (
          <p className="font-body text-stone-dark text-sm mt-0.5">
            {saved.length} {saved.length === 1 ? 'thing' : 'things'} you were up for.
          </p>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pb-20">
          <Bookmark size={40} strokeWidth={1.5} className="text-stone mb-4" />
          <h3 className="font-display text-lg font-semibold text-ink mb-1">
            Nothing saved yet.
          </h3>
          <p className="font-body text-stone-dark text-sm leading-relaxed">
            Swipe right on anything that takes your fancy and it&rsquo;ll live here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
          {saved.map((activity, i) => (
            <SavedCard
              key={`${activity.id}-${i}`}
              activity={activity}
              onClick={() => setSelected(activity)}
            />
          ))}
        </div>
      )}

      {selected && (
        <CardDetail
          activity={selected}
          onClose={() => setSelected(null)}
          onSave={() => setSelected(null)}
          onDismiss={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function SavedCard({ activity, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-card text-left active:scale-[0.98] transition-all hover:shadow-card-hover"
    >
      {/* Colour swatch */}
      <div
        className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
        style={{ backgroundColor: activity.color }}
      >
        {activity.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-ink text-sm leading-snug mb-0.5 truncate">
          {activity.title}
        </p>
        <p className="font-body text-xs text-stone-dark mb-1.5">
          {CATEGORY_LABELS[activity.category] ?? activity.category}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-stone-dark">
            {formatCost(activity.cost_min, activity.cost_max)}
          </span>
          <span className="text-stone">·</span>
          <span className="font-body text-xs text-stone-dark">
            {formatDuration(activity.duration_mins)}
          </span>
          <span className="text-stone">·</span>
          <EnergyDots value={activity.energy_required} size="sm" />
        </div>
      </div>

      <span className="text-stone-dark text-xs font-body flex-shrink-0">→</span>
    </button>
  )
}
