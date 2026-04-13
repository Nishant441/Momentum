import { useState, useEffect, useRef } from 'react'
import { Settings } from 'lucide-react'
import type { NotificationSettings } from '../hooks/useNotifications'

interface SettingsMenuProps {
  settings: NotificationSettings
  notifPermission: 'pending' | 'granted' | 'denied'
  onToggleNotifications: () => void
  onToggleSound: () => void
}

export function SettingsMenu({
  settings,
  notifPermission,
  onToggleNotifications,
  onToggleSound,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const notifAvailable = notifPermission === 'granted'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
        title="Settings"
        aria-label="Settings"
      >
        <Settings size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-40 w-52 rounded-2xl border border-border bg-card-bg py-2 shadow-sm">
          <div className="px-3 py-1 mb-1">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Settings</p>
          </div>

          {}
          <button
            onClick={() => {
              if (notifAvailable) onToggleNotifications()
            }}
            disabled={!notifAvailable}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-raised disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-text-primary">Notifications</span>
            <Toggle on={settings.notificationsEnabled && notifAvailable} />
          </button>

          {}
          <button
            onClick={() => {
              if (notifAvailable && settings.notificationsEnabled) onToggleSound()
            }}
            disabled={!notifAvailable || !settings.notificationsEnabled}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-raised disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-text-primary">Sound</span>
            <Toggle on={settings.soundEnabled && notifAvailable && settings.notificationsEnabled} />
          </button>

          {}
          {!notifAvailable && (
            <p className="px-3 pt-1 pb-2 text-xs text-text-muted leading-snug">
              {notifPermission === 'denied'
                ? 'Notifications disabled. Enable in browser settings.'
                : 'Enable notifications to use these settings.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`relative w-9 h-5 rounded-full transition-colors ${
        on ? 'bg-action' : 'bg-border'
      }`}
    >
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-text-inverse shadow transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </div>
  )
}
