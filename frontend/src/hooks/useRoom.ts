import { useState, useEffect, useRef, useCallback } from 'react'
import type { Task } from '../components/TaskCard'

export interface Sprinter {
  id: string
  user: string
  task: string
  minutesLeft: number
}

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://127.0.0.1:8000/ws/room'

// ── Persistent guest identity ──────────────────────────────────────────────

const ADJECTIVES = ['Focused', 'Sharp', 'Driven', 'Swift', 'Bold', 'Calm', 'Eager', 'Bright']
const ANIMALS = ['Eagle', 'Fox', 'Wolf', 'Hawk', 'Bear', 'Owl', 'Lion', 'Lynx']

function getGuestName(): string {
  const stored = localStorage.getItem('momentum_guest_name')
  if (stored) return stored
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const n = Math.floor(Math.random() * 99) + 1
  const name = `${adj}${animal}${n}`
  localStorage.setItem('momentum_guest_name', name)
  return name
}

function getSprinterId(): string {
  const stored = localStorage.getItem('momentum_sprinter_id')
  if (stored) return stored
  const id = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
  localStorage.setItem('momentum_sprinter_id', id)
  return id
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useRoom() {
  const [sprinters, setSprinters] = useState<Sprinter[]>([])
  const [connected, setConnected] = useState(false)

  const ws = useRef<WebSocket | null>(null)
  const shouldReconnect = useRef(true)
  const reconnectDelay = useRef(1000)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const guestName = useRef(getGuestName())
  const sprinterId = useRef(getSprinterId())

  const send = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }, [])

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    try {
      const socket = new WebSocket(WS_URL)
      ws.current = socket

      socket.onopen = () => {
        console.log('✅ WebSocket successfully connected.')
        setConnected(true)
        reconnectDelay.current = 1000 // reset backoff on success
      }

      socket.onmessage = (e: MessageEvent) => {
        try {
          const msg = JSON.parse(e.data as string)
          if (msg.event === 'room_update') {
            // Exclude self from the displayed list
            setSprinters(
              (msg.sprinters as Sprinter[]).filter((s) => s.id !== sprinterId.current)
            )
          }
        } catch {
          // ignore malformed messages
        }
      }

      socket.onclose = () => {
        setConnected(false)
        ws.current = null
        if (!shouldReconnect.current) return
        reconnectTimer.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30_000)
          connect()
        }, reconnectDelay.current)
      }

      socket.onerror = () => {
        socket.close()
      }
    } catch {
      // Backend not running — silently degrade
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    shouldReconnect.current = true
    connect()
    return () => {
      shouldReconnect.current = false
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])

  // ── Public API ─────────────────────────────────────────────────────────

  const joinSprint = useCallback((task: Task, minutesLeft: number) => {
    send({
      event: 'join_sprint',
      id: sprinterId.current,
      user: guestName.current,
      task: task.title,
      minutesLeft,
    })
  }, [send])

  const leaveSprint = useCallback(() => {
    send({ event: 'leave_sprint', id: sprinterId.current })
  }, [send])

  const tickUpdate = useCallback((minutesLeft: number) => {
    send({ event: 'tick', id: sprinterId.current, minutesLeft })
  }, [send])

  return {
    sprinters,         // other users only (self filtered out)
    connected,
    guestName: guestName.current,
    joinSprint,
    leaveSprint,
    tickUpdate,
  }
}
