import { AssignmentCard, getBucket } from './AssignmentCard'
import type { Assignment } from '../lib/api'

type Bucket = 'urgent' | 'do_today' | 'on_track' | 'done'

interface BucketConfig {
  id: Bucket
  label: string
  subLabel: string
  accentClass: string
  dotClass: string
}

const BUCKETS: BucketConfig[] = [
  {
    id: 'urgent',
    label: 'URGENT',
    subLabel: 'Due today or tomorrow',
    accentClass: 'text-danger-text',
    dotClass: 'bg-danger-text animate-pulse',
  },
  {
    id: 'do_today',
    label: 'DO TODAY',
    subLabel: 'Due in 1–3 days',
    accentClass: 'text-warning-text',
    dotClass: 'bg-warning-text',
  },
  {
    id: 'on_track',
    label: 'ON TRACK',
    subLabel: 'More than 3 days out or no deadline',
    accentClass: 'text-success-text',
    dotClass: 'bg-success-text',
  },
  {
    id: 'done',
    label: 'DONE',
    subLabel: 'All tasks complete',
    accentClass: 'text-text-muted',
    dotClass: 'bg-text-muted',
  },
]

interface UrgencyDashboardProps {
  assignments: Assignment[]
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

export function UrgencyDashboard({ assignments, onOpen, onDelete }: UrgencyDashboardProps) {
  const byBucket = (bucket: Bucket) =>
    assignments.filter((a) => getBucket(a) === bucket)

  const activeBuckets = BUCKETS.filter(
    (b) => b.id !== 'done' && byBucket(b.id).length > 0,
  )
  const doneBucket = byBucket('done')

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-display font-bold text-2xl text-text-primary">No assignments yet</p>
        <p className="text-sm text-text-secondary">
          Hit the + button to add your first assignment and get a step-by-step plan.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Active buckets */}
      {activeBuckets.map((b) => {
        const cards = byBucket(b.id)
        return (
          <section key={b.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-2 w-2 rounded-full flex-shrink-0 ${b.dotClass}`} />
              <span className={`text-xs font-semibold tracking-widest uppercase ${b.accentClass}`}>
                {b.label}
              </span>
              <span className="text-xs text-text-secondary">— {b.subLabel}</span>
            </div>
            <div className="flex flex-col gap-3">
              {cards.map((a) => (
                <AssignmentCard key={a.id} assignment={a} onOpen={onOpen} onDelete={onDelete} />
              ))}
            </div>
          </section>
        )
      })}

      {/* If nothing active, show placeholder for active sections */}
      {activeBuckets.length === 0 && doneBucket.length > 0 && (
        <div className="text-center py-8">
          <p className="font-display font-bold text-2xl text-text-primary">Everything\u2019s done!</p>
          <p className="text-sm text-text-secondary mt-1">Add a new assignment when you\u2019re ready.</p>
        </div>
      )}

      {/* Done section — collapsed/subtle */}
      {doneBucket.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-text-muted flex-shrink-0" />
            <span className="text-xs font-semibold tracking-widest uppercase text-text-muted">DONE</span>
            <span className="text-xs text-text-muted">— Completed assignments</span>
          </div>
          <div className="flex flex-col gap-3">
            {doneBucket.map((a) => (
              <AssignmentCard key={a.id} assignment={a} onOpen={onOpen} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
