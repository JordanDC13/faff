import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { EnergyDots } from '../ui/EnergyDots'
import { Logo } from '../ui/Logo'
import { VIBE_OPTIONS } from '../../data/activities'
import { clsx } from 'clsx'

const ENERGY_LABELS = [
  '', 'Absolutely shattered', 'Could manage a gentle stroll',
  'Fairly up for it', 'Raring to go', 'Boundless energy (suspicious)',
]

const TIME_OPTIONS = [
  { value: 30,  label: '30 min',  desc: 'Quick one' },
  { value: 60,  label: '1 hour',  desc: 'Decent chunk' },
  { value: 120, label: '2 hours', desc: 'Afternoon sorted' },
  { value: 300, label: 'All day', desc: 'Full commitment' },
]

const BUDGET_OVERRIDES = [
  { value: 0,   label: '£0',       desc: 'Free only' },
  { value: 10,  label: '≤ £10',    desc: 'Very light' },
  { value: 25,  label: '≤ £25',    desc: 'Reasonable' },
  { value: 50,  label: '≤ £50',    desc: 'Treating myself' },
  { value: 100, label: '≤ £100',   desc: 'Going big' },
]

export function ContextSnapshot({ onSubmit, weather, defaultBudget = 50 }) {
  const [energy, setEnergy] = useState(3)
  const [time, setTime] = useState(120)
  const [vibe, setVibe] = useState('')
  const [showBudgetOverride, setShowBudgetOverride] = useState(false)
  const [budgetOverride, setBudgetOverride] = useState(null) // null = use default

  const effectiveBudget = budgetOverride ?? defaultBudget
  const canSubmit = vibe !== ''

  function handleSubmit() {
    onSubmit({
      energy,
      time,
      vibe,
      budgetOverride: budgetOverride,   // null = use settings default
    })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 safe-top flex-shrink-0">
        <Logo className="text-2xl mb-1" />
        <p className="font-body text-stone-dark text-sm">
          Let&rsquo;s work out what you&rsquo;re actually up for.
        </p>
        {weather && (
          <div className="flex items-center gap-1.5 mt-2 text-stone-dark font-body text-xs">
            <span>{weather.emoji}</span>
            <span>{weather.temp}°C · {weather.label} outside</span>
            {weather.isRainy && (
              <span className="text-orange">&nbsp;· outdoor activities deprioritised</span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">

        {/* ── Energy ─────────────────────────────────────────────── */}
        <div>
          <label className="font-display text-lg font-semibold text-ink block mb-1">
            How&rsquo;s the energy?
          </label>
          <p className="font-body text-stone-dark text-sm mb-4">
            {ENERGY_LABELS[energy]}
          </p>
          <div className="flex items-center gap-4">
            <EnergyDots value={energy} onChange={setEnergy} size="lg" />
            <span className="font-body text-stone text-sm">{energy} / 5</span>
          </div>
        </div>

        {/* ── Vibe ───────────────────────────────────────────────── */}
        <div>
          <label className="font-display text-lg font-semibold text-ink block mb-1">
            What&rsquo;s the vibe?
          </label>
          <p className="font-body text-stone-dark text-xs mb-3">
            Pick one. This also sets solo/social — &lsquo;Social&rsquo; and &lsquo;Solo&rsquo; do what they say.
          </p>
          <div className="flex flex-wrap gap-2">
            {VIBE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setVibe(opt.value)}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-body text-sm transition-all duration-200',
                  vibe === opt.value
                    ? 'bg-orange text-cream border-orange'
                    : 'bg-white text-ink border-stone-light hover:border-stone',
                )}
              >
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Time ───────────────────────────────────────────────── */}
        <div>
          <label className="font-display text-lg font-semibold text-ink block mb-3">
            Time available?
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTime(opt.value)}
                className={clsx(
                  'rounded-2xl px-4 py-3 text-left transition-all duration-200 border-2',
                  time === opt.value
                    ? 'bg-orange/10 border-orange'
                    : 'bg-white border-stone-light hover:border-stone',
                )}
              >
                <div className={clsx('font-body font-medium text-sm', time === opt.value ? 'text-orange' : 'text-ink')}>
                  {opt.label}
                </div>
                <div className="font-body text-xs text-stone-dark mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Budget (collapsible override) ───────────────────────── */}
        <div>
          <button
            onClick={() => setShowBudgetOverride(v => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <p className="font-display text-lg font-semibold text-ink">Budget</p>
              <p className="font-body text-xs text-stone-dark mt-0.5">
                Using your default: <span className="text-ink font-medium">
                  {defaultBudget === 0 ? 'Free only' : `£${defaultBudget}`}
                </span>
                {budgetOverride !== null && (
                  <span className="text-orange ml-1.5">
                    → overridden to {budgetOverride === 0 ? 'free only' : `£${budgetOverride}`} today
                  </span>
                )}
              </p>
            </div>
            <span className="text-stone-dark">
              {showBudgetOverride ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>

          {showBudgetOverride && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BUDGET_OVERRIDES.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBudgetOverride(opt.value === defaultBudget ? null : opt.value)}
                  className={clsx(
                    'rounded-2xl px-3 py-2.5 text-center transition-all duration-200 border-2',
                    effectiveBudget === opt.value && budgetOverride !== null
                      ? 'bg-orange/10 border-orange'
                      : opt.value === defaultBudget && budgetOverride === null
                        ? 'bg-stone-light/50 border-stone'
                        : 'bg-white border-stone-light hover:border-stone',
                  )}
                >
                  <div className={clsx(
                    'font-body font-medium text-xs',
                    effectiveBudget === opt.value && budgetOverride !== null ? 'text-orange' : 'text-ink',
                  )}>
                    {opt.label}
                  </div>
                  <div className="font-body text-xs text-stone-dark mt-0.5">{opt.desc}</div>
                </button>
              ))}
              {budgetOverride !== null && (
                <button
                  onClick={() => setBudgetOverride(null)}
                  className="col-span-3 text-center font-body text-xs text-stone mt-1"
                >
                  Reset to default (£{defaultBudget})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 safe-bottom pt-3 flex-shrink-0 bg-gradient-to-t from-cream via-cream to-transparent">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary w-full text-center text-base py-4"
        >
          Show me what&rsquo;s out there
        </button>
        {!canSubmit && (
          <p className="text-center font-body text-stone text-xs mt-2">
            Pick a vibe first — just one, promise.
          </p>
        )}
      </div>
    </div>
  )
}
