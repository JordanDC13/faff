import { clsx } from 'clsx'

export function EnergyDots({ value, max = 5, onChange, size = 'md' }) {
  const sizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value
        const dotNum = i + 1
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(dotNum)}
            disabled={!onChange}
            className={clsx(
              'rounded-full transition-all duration-200',
              sizes[size],
              filled
                ? 'bg-orange dot-active'
                : 'bg-stone-light',
              onChange && 'cursor-pointer hover:scale-110 active:scale-95',
              !onChange && 'cursor-default',
            )}
            aria-label={onChange ? `Set energy to ${dotNum}` : `Energy ${dotNum}`}
          />
        )
      })}
    </div>
  )
}
