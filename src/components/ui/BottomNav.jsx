import { Home, SlidersHorizontal } from 'lucide-react'
import { clsx } from 'clsx'

const TABS = [
  { id: 'feed', label: 'Discover', icon: Home },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
]

export function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-cream border-t border-stone-light safe-bottom">
      <div className="flex items-stretch h-16">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150',
                isActive ? 'text-orange' : 'text-stone-dark hover:text-ink',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={clsx('text-xs font-body', isActive ? 'font-semibold' : 'font-normal')}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
