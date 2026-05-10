import { useState } from 'react'
import { EnergyDots } from '../ui/EnergyDots'
import { Logo } from '../ui/Logo'
import { VIBE_OPTIONS } from '../../data/activities'
import { clsx } from 'clsx'

const ENERGY_LABELS = ['', 'Absolutely shattered', 'Could manage a gentle stroll', 'Fairly up for it', 'Raring to go', 'Boundless energy (suspicious)']

const BUDGET_OPTIONS = [
  { value: 0, label: '£0', desc: 'Free stuff only' },
  { value: 10, label: 'Up to £10', desc: 'Very reasonable' },
  { value: 25, label: 'Up to £25', desc: 'Treat yourself' },
  { value: 50, label: 'Up to £50', desc: 'Splashing out' },
]

const TIME_OPTIONS = [
  { value: 30, label: '30 min', desc: 'Quick one' },
  { value: 60, label: '1 hour', desc: 'Decent chunk' },
  { value: 120, label: '2 hours', desc: 'Afternoon sorted' },
  { value: 300, label: 'All day', desc: 'Commit fully' },
]

export function ContextSnapshot({ onSubmit, weather }) {
  const [energy, setEnergy] = useState(3)
  const [budget, setBudget] = useState(25)
  const [time, setTime] = useState(120)
  const [vibe, setVibe] = useState('')
  const [solo, setSolo] = useState('both')

  function handleSubmit() {
    onSubmit({ energy, budget, time, vibe, solo_social: solo })
  }

  const canSubmit = vibe !== ''

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 safe-top">
        <Logo className="text-2xl mb-1" />
        <p className="font-body text-stone-dark text-sm">Let's work out what you're actually up for.</p>
        {weather && (
          <div className="flex items-center gap-1.5 mt-2 text-stone-dark font-body text-xs">
            <span>{weather.emoji}</span>
            <span>{weather.temp}°C · {weather.label} outside</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
        {/* Energy */}
        <div>
          <label className="font-display text-lg font-semibold text-ink block mb-1">
            How's the energy?
          </label>
          <p className="font-body text-stone-dark text-sm mb-4">
            {ENERGY_LABELS[energy]}
          </p>
          <div className="flex items-center gap-4">
            <EnergyDots value={energy} onChange={setEnergy} size="lg" />
            <span className="font-body text-stone text-sm">{energy} / 5</span>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="font-display text-lg font-semibold text-ink block mb-3">
            Budget today?
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {BUDGET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setBudget(opt.value)}
                className={clsx(
                  'rounded-2xl px-4 py-3 text-left transition-all duration-200 border-2',
                  budget === opt.value
                    ? 'bg-orange/10 border-orange'
                    : 'bg-white border-stone-light hover:border-stone',
                )}
              >
                <div className={clsx('font-body font-medium text-sm', budget === opt.value ? 'text-orange' : 'text-ink')}>{opt.label}</div>
                <div className="font-body text-xs text-stone-dark mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
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
                <div className={clsx('font-body font-medium text-sm', time === opt.value ? 'text-orange' : 'text-ink')}>{opt.label}</div>
                <div className="font-body text-xs text-stone-dark mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vibe */}
        <div>
          <label className="font-display text-lg font-semibold text-ink block mb-1">
            What's the vibe?
          </label>
          <p className="font-body text-stone-dark text-xs mb-3">Pick one. You can always lie.</p>
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

        {/* Solo / Social */}
        <div>
          <label className="font-display text-lg font-semibold text-ink block mb-3">
            Solo or social?
          </label>
          <div className="flex gap-2.5">
            {[
              { value: 'solo', label: '🎧 Solo', desc: 'Just me' },
              { value: 'social', label: '🎉 Social', desc: 'With others' },
              { value: 'both', label: '✌️ Either', desc: 'No preference' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSolo(opt.value)}
                className={clsx(
                  'flex-1 rounded-2xl px-3 py-3 text-center transition-all duration-200 border-2',
                  solo === opt.value
                    ? 'bg-orange/10 border-orange'
                    : 'bg-white border-stone-light hover:border-stone',
                )}
              >
                <div className={clsx('font-body font-medium text-sm', solo === opt.value ? 'text-orange' : 'text-ink')}>{opt.label}</div>
                <div className="font-body text-xs text-stone-dark mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 safe-bottom pt-4 bg-gradient-to-t from-cream via-cream to-transparent">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary w-full text-center text-base py-4"
        >
          Show me what's out there
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
