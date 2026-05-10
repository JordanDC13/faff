export function WildcardCard({ onAccept, style }) {
  return (
    <div
      className="w-full h-full rounded-3xl overflow-hidden relative select-none flex flex-col items-center justify-center text-center p-8"
      style={{
        background: 'linear-gradient(135deg, #E8521A 0%, #C94213 100%)',
        boxShadow: '0 8px 40px rgba(232,82,26,0.35)',
        ...style,
      }}
    >
      <div className="text-6xl mb-4">🎲</div>
      <h2 className="font-display text-cream text-2xl font-semibold leading-snug mb-3">
        Sod it, surprise me.
      </h2>
      <p className="font-body text-cream/80 text-sm leading-relaxed mb-8 max-w-xs">
        You've said no to quite a lot. Fair enough. Let us just pick one for you.
        It'll be fine.
      </p>
      <button
        onClick={onAccept}
        className="bg-cream text-orange font-body font-semibold px-8 py-3 rounded-full transition-all active:scale-95 hover:bg-stone-light"
      >
        Go on then
      </button>
    </div>
  )
}
