import { useMemo } from 'react'

const TOTAL_BLOCKS = 60

interface VisualWorldProps {
  totalTasks: number
  completedCount: number
}

interface ChaosStyle {
  rotate: string
  translate: string
  opacity: number
  delay: string
}

// Organic parchment and growth color palettes for the garden board
const INACTIVE_COLORS = [
  'var(--color-parchment-1)',
  'var(--color-parchment-2)',
  'var(--color-neutral-tile)',
  'var(--color-parchment-3)',
]

const ACTIVE_COLORS = [
  'var(--color-growth-3)',
  'var(--color-growth-2)',
  'var(--color-growth-4)',
  'var(--color-growth-1)',
]

export function VisualWorld({ totalTasks, completedCount }: VisualWorldProps) {
  const greenCount =
    totalTasks > 0
      ? Math.min(Math.floor((completedCount / totalTasks) * TOTAL_BLOCKS), TOTAL_BLOCKS)
      : 0

  const allDone = totalTasks > 0 && completedCount >= totalTasks

  // Stable chaos values computed once on mount — never change on re-render
  const chaos: ChaosStyle[] = useMemo(
    () =>
      Array.from({ length: TOTAL_BLOCKS }, () => ({
        rotate: `${(Math.random() - 0.5) * 16}deg`,
        translate: `${(Math.random() - 0.5) * 6}px ${(Math.random() - 0.5) * 6}px`,
        opacity: 0.5 + Math.random() * 0.4,
        delay: `${Math.floor(Math.random() * 600)}ms`,
      })),
    []
  )

  // Stable color indices for organic variation
  const colorIndices = useMemo(
    () => Array.from({ length: TOTAL_BLOCKS }, () => Math.floor(Math.random() * 4)),
    []
  )

  return (
    <div className="w-full rounded-2xl border border-border bg-card-bg p-4 flex flex-col gap-3">
      {/* Block grid */}
      <div className="grid grid-cols-10 gap-1.5 w-full">
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
          const isGreen = i < greenCount
          const c = chaos[i]
          const colorIdx = colorIndices[i]

          return (
            <div
              key={i}
              className="aspect-square rounded"
              style={{
                transitionProperty: 'background-color, rotate, translate, opacity',
                transitionDuration: '450ms',
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: c.delay,
                rotate: isGreen ? '0deg' : c.rotate,
                translate: isGreen ? '0px 0px' : c.translate,
                opacity: isGreen ? 1 : c.opacity,
                backgroundColor: isGreen
                  ? ACTIVE_COLORS[colorIdx]
                  : INACTIVE_COLORS[colorIdx],
              }}
            />
          )
        })}
      </div>

      {/* Progress label */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">
          {completedCount} of {totalTasks} task{totalTasks !== 1 ? 's' : ''} complete
        </p>
        {allDone ? (
          <span className="text-xs font-medium text-success-text">All done ✓</span>
        ) : completedCount > 0 ? (
          <span className="text-xs text-gold-strong">
            {Math.round((completedCount / totalTasks) * 100)}% there
          </span>
        ) : (
          <span className="text-xs text-text-muted">Start a task to see progress</span>
        )}
      </div>
    </div>
  )
}
