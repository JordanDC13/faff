import { EnergyDots } from '../ui/EnergyDots'
import { CATEGORY_LABELS } from '../../data/activities'

function formatCost(min, max) {
  if (min === 0 && max === 0) return 'Free'
  if (min === 0) return `Up to £${max}`
  if (min === max) return `£${min}`
  return `£${min}–£${max}`
}

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  if (mins === 60) return '1 hour'
  if (mins % 60 === 0) return `${mins / 60} hours`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export function ActivityCard({ activity, style, className = '' }) {
  return (
    <div
      className={`w-full h-full rounded-3xl overflow-hidden relative select-none ${className}`}
      style={{
        backgroundColor: activity.color,
        boxShadow: '0 8px 40px rgba(45,45,45,0.2)',
        ...style,
      }}
    >
      {/* Large emoji background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <span className="text-9xl">{activity.emoji}</span>
      </div>

      {/* Bottom gradient + content */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-5"
        style={{
          background: 'linear-gradient(to top, rgba(20,15,10,0.92) 0%, rgba(20,15,10,0.65) 38%, transparent 70%)',
        }}
      >
        {/* Category chip */}
        <div className="mb-3">
          <span className="card-chip">
            {activity.emoji} {CATEGORY_LABELS[activity.category] ?? activity.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-cream text-2xl font-semibold leading-snug mb-2">
          {activity.title}
        </h2>

        {/* Description */}
        <p className="font-body text-cream/75 text-sm leading-relaxed mb-4 line-clamp-2">
          {activity.description}
        </p>

        {/* Meta chips row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="card-chip">{formatCost(activity.cost_min, activity.cost_max)}</span>
          <span className="card-chip">{formatDuration(activity.duration_mins)}</span>
          <span className="card-chip flex items-center gap-1">
            <EnergyDots value={activity.energy_required} size="sm" />
          </span>
        </div>
      </div>
    </div>
  )
}
