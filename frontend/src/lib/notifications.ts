export const isSupported = (): boolean => 'Notification' in window

export const requestPermission = async (): Promise<boolean> => {
  if (!isSupported()) return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export const sendNotification = (title: string, body: string): void => {
  if (!isSupported()) return
  if (Notification.permission !== 'granted') return
  new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: title, // deduplicates notifications with the same title
  })
}
