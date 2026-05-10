import { X } from 'lucide-react'
import { EnergyDots } from '../ui/EnergyDots'
import { CATEGORY_LABELS } from '../../data/activities'

function formatCost(min, max) {
  if (min === 0 && max === 0) return 'Free'
  if (min === 0) return `Up to £${max}`
  return `£${min}–£${max}`
}

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  if (mins === 60) return '1 hour'
  if (mins % 60 === 0) return `${mins / 60} hours`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export function CardDetail({ activity, onClose, onSave, onDismiss }) {
  if (!activity) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream">
      {/* Hero */}
      <div
        className="relative h-56 flex-shrink-0 flex items-end"
        style={{ backgroundColor: activity.color }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-25">
          <span className="text-8xl">{activity.emoji}</span>
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(253,246,236,1) 0%, transparent 60%)',
          }}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/30 text-white rounded-full p-2 backdrop-blur-sm"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-36">
        <div className="mb-2">
          <span className="text-xs font-body text-stone-dark uppercase tracking-wider">
            {CATEGORY_LABELS[activity.category] ?? activity.category}
          </span>
        </div>

        <h2 className="font-display text-2xl font-semibold text-ink leading-tight mb-3">
          {activity.title}
        </h2>

        <p className="font-body text-stone-dark leading-relaxed mb-6">
          {activity.description}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Stat label="Cost" value={formatCost(activity.cost_min, activity.cost_max)} />
          <Stat label="Time needed" value={formatDuration(activity.duration_mins)} />
          <Stat label="Setting" value={activity.indoor_outdoor === 'both' ? 'In or out' : activity.indoor_outdoor === 'indoor' ? 'Indoors' : 'Outdoors'} />
          <Stat label="Best for" value={activity.solo_social === 'both' ? 'Solo or group' : activity.solo_social === 'solo' ? 'Solo' : 'Groups'} />
        </div>

        {/* Energy */}
        <div className="mb-6">
          <p className="font-body text-xs text-stone-dark uppercase tracking-wider mb-2">Energy required</p>
          <EnergyDots value={activity.energy_required} size="md" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {activity.tags.map(tag => (
            <span key={tag} className="bg-stone-light text-ink text-xs font-body px-3 py-1 rounded-full capitalize">
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream border-t border-stone-light px-6 py-4 safe-bottom">
        <button
          onClick={onSave}
          className="btn-primary w-full text-center text-base py-4 mb-2"
        >
          Let's do this ✓
        </button>
        <button
          onClick={onDismiss}
          className="btn-ghost w-full text-center text-sm text-stone-dark"
        >
          Not today — show me something else
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-3">
      <p className="font-body text-xs text-stone-dark mb-0.5">{label}</p>
      <p className="font-body font-medium text-ink text-sm">{value}</p>
    </div>
  )
}
