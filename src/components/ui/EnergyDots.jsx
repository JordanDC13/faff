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
        // Use <span> in read-only contexts so we never nest <button> inside <button>
        const Tag = onChange ? 'button' : 'span'
        return (
          <Tag
            key={i}
            type={onChange ? 'button' : undefined}
            onClick={onChange ? () => onChange(dotNum) : undefined}
            className={clsx(
              'rounded-full transition-all duration-200 block',
              sizes[size],
              filled ? 'bg-orange dot-active' : 'bg-stone-light',
              onChange ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default',
            )}
            aria-label={onChange ? `Set energy to ${dotNum}` : undefined}
          />
        )
      })}
    </div>
  )
}
