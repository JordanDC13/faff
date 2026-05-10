import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

const SWIPE_THRESHOLD = 100
const ROTATION_FACTOR = 15

export const SwipeCard = forwardRef(function SwipeCard(
  { children, onSwipe, onDirectionChange, disabled },
  ref,
) {
  const x = useMotionValue(0)
  const [dragging, setDragging] = useState(false)

  const rotate = useTransform(x, [-300, 300], [-ROTATION_FACTOR, ROTATION_FACTOR])
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0])

  // Expose programmatic swipe to parent via ref
  useImperativeHandle(ref, () => ({
    swipe: async (direction) => {
      const target = direction === 'right' ? 600 : -600
      await animate(x, target, { duration: 0.3, ease: 'easeOut' })
      onSwipe?.(direction)
    },
  }))

  function handleDrag(_, info) {
    const offset = info.offset.x
    if (offset > 40) onDirectionChange?.('right')
    else if (offset < -40) onDirectionChange?.('left')
    else onDirectionChange?.(null)
  }

  async function handleDragEnd(_, info) {
    setDragging(false)
    onDirectionChange?.(null)

    const offset = info.offset.x
    const velocity = info.velocity.x

    const shouldRight = offset > SWIPE_THRESHOLD || velocity > 500
    const shouldLeft = offset < -SWIPE_THRESHOLD || velocity < -500

    if (shouldRight) {
      await animate(x, 600, { duration: 0.3, ease: 'easeOut' })
      onSwipe?.('right')
    } else if (shouldLeft) {
      await animate(x, -600, { duration: 0.3, ease: 'easeOut' })
      onSwipe?.('left')
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 28 })
    }
  }

  return (
    <motion.div
      style={{ x, rotate, opacity, touchAction: 'none' }}
      drag={disabled ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => setDragging(true)}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      {children}
    </motion.div>
  )
})
