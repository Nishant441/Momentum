import type { Task } from '../components/TaskCard'

// ── Assignment type ──────────────────────────────────────────────────────────

export interface Assignment {
  id: string
  title: string          // AI-generated title for the assignment
  rawInput: string       // what the user typed
  deadline: string | null // "YYYY-MM-DD" or null
  tasks: Task[]
  completedIds: number[]
  createdAt: string      // ISO timestamp
}

// ── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an academic task breakdown assistant.
Given an assignment, break it into micro-tasks a student can do one at a time.

Return a JSON object with two keys:
- "title": a short (3-6 word) title summarising the assignment
- "tasks": an array of task objects

Each task must:
- Be specific and immediately actionable
- Take 5–30 minutes
- Be ordered logically
- Use active verbs: Write, Find, Outline, Review, Draft, List

Also return a riskScore (0–100) for each task based on:
- Higher score if the task is vague or creative (writing, analysis, brainstorming)
- Higher score if it's the first task (starting is hardest)
- Higher score if estimated time is long
- Lower score if it's mechanical (finding quotes, formatting, copying)

Respond ONLY with raw JSON. No markdown. No explanation.
Schema: {"title":"...","tasks":[{"id":1,"title":"...","description":"...","estimatedMinutes":10,"order":1,"riskScore":85}]}`

// ── API call ─────────────────────────────────────────────────────────────────

export async function breakDownAssignment(
  userInput: string,
  apiKey: string,
): Promise<{ title: string; tasks: Task[] }> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.replace(/[^\x20-\x7E]/g, '')}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Assignment: ${userInput}` },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json()
  const raw: string = data.choices?.[0]?.message?.content ?? ''

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const parsed = JSON.parse(cleaned) as { title: string; tasks: Task[] }

  // Clamp values to valid ranges
  const tasks = parsed.tasks.map((t) => ({
    ...t,
    estimatedMinutes: Math.min(t.estimatedMinutes, 30),
    riskScore: Math.max(0, Math.min(100, t.riskScore ?? 50)),
  }))

  return { title: parsed.title, tasks }
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const ASSIGNMENTS_KEY = 'momentum_assignments'

export function loadAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY)
    return raw ? (JSON.parse(raw) as Assignment[]) : []
  } catch {
    return []
  }
}

export function saveAssignments(assignments: Assignment[]): void {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments))
}
