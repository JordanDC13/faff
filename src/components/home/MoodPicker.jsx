import { Sofa, Users, Palette, Dices } from 'lucide-react'
import { clsx } from 'clsx'

// ── Time helpers ──────────────────────────────────────────────────────────────

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

function getDayLabel() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long' })
}

// ── Mood presets ──────────────────────────────────────────────────────────────
// Each preset maps directly to a context object passed to rankActivities.
// solo_social overrides vibe-based derivation in filterActivities.

const MOODS = [
  {
    id: 'lowkey',
    label: 'Low-key',
    subtitle: 'Chill, solo, nearby',
    icon: Sofa,
    iconColor: '#4A7C59',
    bgTint: 'bg-[#4A7C59]/5',
    preset: {
      energy: 2,
      vibe: 'chill',
      time: 120,
      budgetOverride: 10,
      solo_social: 'solo',
    },
  },
  {
    id: 'outout',
    label: 'Out out',
    subtitle: 'Social, active, go far',
    icon: Users,
    iconColor: '#2D6A8F',
    bgTint: 'bg-[#2D6A8F]/5',
    preset: {
      energy: 4,
      vibe: 'social',
      time: 300,
      budgetOverride: null,
      solo_social: 'social',
    },
  },
  {
    id: 'cultural',
    label: 'Something cultural',
    subtitle: 'Art, food, explore',
    icon: Palette,
    iconColor: '#7B4FA0',
    bgTint: 'bg-[#7B4FA0]/5',
    preset: {
      energy: 3,
      vibe: 'adventurous',
      time: 180,
      budgetOverride: null,
      solo_social: 'both',
    },
  },
  {
    id: 'sodit',
    label: 'Sod it',
    subtitle: 'Surprise me',
    icon: Dices,
    iconColor: '#E8521A',
    bgTint: 'bg-orange/5',
    wildcard: true,
    preset: {
      energy: 3,
      vibe: 'adventurous',
      time: 300,
      budgetOverride: null,
      solo_social: 'both',
    },
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function MoodPicker({ weather, defaultBudget, onSelectMood, onCustomVibe }) {
  const timeOfDay = getTimeOfDay()
  const dayLabel = getDayLabel()

  function buildContextStr() {
    const parts = [`${dayLabel} ${timeOfDay}`]
    if (weather) parts.push(`${weather.emoji} ${weather.label} · ${weather.temp}°C`)
    return parts.join(' · ')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-20">
      <div className="flex-1 flex flex-col px-5 pt-8 safe-top">

        {/* Context bar */}
        <p className="font-body text-xs text-stone-dark mb-5 tracking-wide">
          {buildContextStr()}
          {weather?.isRainy && (
            <span className="text-orange ml-1">· staying dry suggested</span>
          )}
        </p>

        {/* Headline */}
        <h1 className="font-display text-[2rem] font-semibold text-ink leading-tight mb-7">
          What kind of {timeOfDay}{' '}are<br />you after?
        </h1>

        {/* 2×2 Mood grid */}
        <div className="grid grid-cols-2 gap-3 flex-1 max-h-[420px]">
          {MOODS.map(mood => (
            <MoodTile
              key={mood.id}
              mood={mood}
              onSelect={() => onSelectMood(mood.preset, mood.wildcard ?? false, defaultBudget)}
            />
          ))}
        </div>

        {/* Custom vibe link */}
        <div className="flex justify-center mt-6 pb-2">
          <button
            onClick={onCustomVibe}
            className="font-body text-sm text-stone-dark hover:text-ink transition-colors flex items-center gap-1"
          >
            or set your own vibe
            <span className="text-orange">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tile ──────────────────────────────────────────────────────────────────────

function MoodTile({ mood, onSelect }) {
  const Icon = mood.icon
  const isSodIt = mood.wildcard

  return (
    <button
      onClick={onSelect}
      className={clsx(
        'flex flex-col justify-between p-4 rounded-3xl text-left transition-all duration-200',
        'active:scale-[0.97] hover:shadow-card-hover',
        isSodIt
          ? 'border-2 border-dashed border-orange bg-orange/5'
          : `${mood.bgTint} border-2 border-transparent hover:border-stone-light shadow-card bg-white`,
      )}
      style={{ minHeight: '9.5rem' }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
        style={{ backgroundColor: `${mood.iconColor}18` }}
      >
        <Icon
          size={22}
          strokeWidth={1.8}
          style={{ color: mood.iconColor }}
        />
      </div>

      {/* Text */}
      <div>
        <p className={clsx(
          'font-display font-semibold text-base leading-tight',
          isSodIt ? 'text-orange' : 'text-ink',
        )}>
          {mood.label}
        </p>
        <p className="font-body text-xs text-stone-dark mt-0.5 leading-snug">
          {mood.subtitle}
        </p>
      </div>
    </button>
  )
}
