import { useState } from 'react'
import { X } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { CATEGORY_LABELS, ACTIVITIES } from '../../data/activities'
import { clsx } from 'clsx'

const BUDGET_FIELDS = [
  { key: 'budget_daily',    label: 'Daily budget',            desc: 'Overall spending cap for the day' },
  { key: 'budget_meal',     label: 'Meal budget (per person)', desc: 'Per head for food' },
  { key: 'budget_drinks',   label: 'Drinks budget',           desc: 'Rounds, not bottles' },
  { key: 'budget_activity', label: 'Activity spend limit',    desc: 'Entry fees, tickets, etc.' },
]

const BUDGET_STEPS = [0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200]

const DISTANCE_OPTIONS = [
  { value: 1,  label: '1 km',    desc: 'Walkable' },
  { value: 3,  label: '3 km',    desc: 'Short cycle' },
  { value: 10, label: '10 km',   desc: 'Easy journey' },
  { value: 25, label: '25 km',   desc: 'Day trip' },
  { value: 99, label: 'Any',     desc: 'No limit' },
]

const ALL_CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))

export function SettingsScreen({ settings, onUpdateSettings, onAddExclusion, onRemoveExclusion }) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showActivityPicker, setShowActivityPicker] = useState(false)
  const [activitySearch, setActivitySearch] = useState('')

  function nearest(val) {
    return BUDGET_STEPS.reduce((a, b) => Math.abs(b - val) < Math.abs(a - val) ? b : a)
  }

  function stepBudget(key, dir) {
    const cur = settings[key] ?? 25
    const idx = BUDGET_STEPS.indexOf(nearest(cur))
    const next = BUDGET_STEPS[Math.max(0, Math.min(BUDGET_STEPS.length - 1, idx + dir))]
    onUpdateSettings({ [key]: next })
  }

  const filteredActivities = ACTIVITIES.filter(a =>
    !settings.excluded_activity_ids.includes(a.id) &&
    (activitySearch === '' || a.title.toLowerCase().includes(activitySearch.toLowerCase()))
  )

  const excludedActivities = ACTIVITIES.filter(a => settings.excluded_activity_ids.includes(a.id))

  return (
    <div className="flex flex-col min-h-dvh bg-cream pb-20">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 safe-top">
        <Logo className="text-xl mb-1" />
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="font-body text-stone-dark text-sm mt-0.5">
          Your defaults. Override any of these on the spot when you start a session.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-8 pb-6">

        {/* ── Budget preferences ──────────────────────────────────── */}
        <section>
          <SectionHeader title="Budget preferences" />
          <div className="space-y-3">
            {BUDGET_FIELDS.map(({ key, label, desc }) => (
              <div key={key} className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-body font-medium text-sm text-ink">{label}</p>
                  <p className="font-body text-xs text-stone-dark">{desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StepButton onClick={() => stepBudget(key, -1)} label="−" />
                  <span className="font-body font-semibold text-ink text-sm w-10 text-center">
                    {settings[key] === 0 ? 'Free' : `£${settings[key]}`}
                  </span>
                  <StepButton onClick={() => stepBudget(key, 1)} label="+" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Max travel distance ─────────────────────────────────── */}
        <section>
          <SectionHeader title="Max travel distance" />
          <div className="flex gap-2 flex-wrap">
            {DISTANCE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onUpdateSettings({ max_travel_km: opt.value })}
                className={clsx(
                  'flex-1 min-w-[4.5rem] rounded-2xl px-3 py-2.5 text-center border-2 transition-all duration-200',
                  settings.max_travel_km === opt.value
                    ? 'bg-orange/10 border-orange'
                    : 'bg-white border-stone-light hover:border-stone',
                )}
              >
                <div className={clsx('font-body font-medium text-sm', settings.max_travel_km === opt.value ? 'text-orange' : 'text-ink')}>
                  {opt.label}
                </div>
                <div className="font-body text-xs text-stone-dark">{opt.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Exclusion list ──────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Things you never want to see"
            subtitle="Add categories or specific activities. Swipe feedback also builds this list."
          />

          {/* Excluded categories */}
          <div className="mb-3">
            <p className="font-body text-xs text-stone-dark mb-2">Categories</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.excluded_categories.length === 0 && (
                <p className="font-body text-xs text-stone italic">None excluded yet</p>
              )}
              {settings.excluded_categories.map(cat => (
                <ExclusionTag
                  key={cat}
                  label={CATEGORY_LABELS[cat] ?? cat}
                  onRemove={() => onRemoveExclusion('category', cat)}
                />
              ))}
            </div>
            {!showCategoryPicker ? (
              <button
                onClick={() => setShowCategoryPicker(true)}
                className="text-orange font-body text-sm font-medium"
              >
                + Add category
              </button>
            ) : (
              <div className="bg-white rounded-2xl p-3 border border-stone-light">
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES
                    .filter(c => !settings.excluded_categories.includes(c.value))
                    .map(c => (
                      <button
                        key={c.value}
                        onClick={() => {
                          onAddExclusion('category', c.value)
                          setShowCategoryPicker(false)
                        }}
                        className="bg-stone-light text-ink text-xs font-body px-3 py-1.5 rounded-full hover:bg-stone transition-colors"
                      >
                        {c.label}
                      </button>
                    ))}
                </div>
                <button
                  onClick={() => setShowCategoryPicker(false)}
                  className="mt-3 text-stone font-body text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Excluded specific activities */}
          <div>
            <p className="font-body text-xs text-stone-dark mb-2">Specific activities</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {excludedActivities.length === 0 && (
                <p className="font-body text-xs text-stone italic">None excluded yet</p>
              )}
              {excludedActivities.map(a => (
                <ExclusionTag
                  key={a.id}
                  label={`${a.emoji} ${a.title}`}
                  onRemove={() => onRemoveExclusion('activity_id', a.id)}
                />
              ))}
            </div>
            {!showActivityPicker ? (
              <button
                onClick={() => setShowActivityPicker(true)}
                className="text-orange font-body text-sm font-medium"
              >
                + Add activity
              </button>
            ) : (
              <div className="bg-white rounded-2xl p-3 border border-stone-light">
                <input
                  type="text"
                  placeholder="Search activities…"
                  value={activitySearch}
                  onChange={e => setActivitySearch(e.target.value)}
                  className="input-base mb-3 text-sm"
                />
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {filteredActivities.slice(0, 20).map(a => (
                    <button
                      key={a.id}
                      onClick={() => {
                        onAddExclusion('activity_id', a.id)
                        setActivitySearch('')
                        setShowActivityPicker(false)
                      }}
                      className="text-left px-3 py-2 rounded-xl hover:bg-stone-light transition-colors"
                    >
                      <span className="font-body text-sm text-ink">{a.emoji} {a.title}</span>
                    </button>
                  ))}
                  {filteredActivities.length === 0 && (
                    <p className="font-body text-xs text-stone py-2 text-center">Nothing matches</p>
                  )}
                </div>
                <button
                  onClick={() => { setShowActivityPicker(false); setActivitySearch('') }}
                  className="mt-3 text-stone font-body text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Quiet reassurance */}
        <p className="font-body text-stone text-xs text-center leading-relaxed pb-2">
          Changes save automatically. Exclusions take effect the next time you start a session.
        </p>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      {subtitle && <p className="font-body text-xs text-stone-dark mt-0.5">{subtitle}</p>}
    </div>
  )
}

function StepButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full bg-stone-light text-ink font-body font-semibold text-base flex items-center justify-center active:scale-90 transition-transform hover:bg-stone"
      aria-label={label}
    >
      {label}
    </button>
  )
}

function ExclusionTag({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 bg-ink/10 text-ink text-xs font-body px-3 py-1.5 rounded-full">
      <span className="max-w-[160px] truncate">{label}</span>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-stone-dark hover:text-ink transition-colors"
        aria-label={`Remove ${label}`}
      >
        <X size={12} />
      </button>
    </span>
  )
}
