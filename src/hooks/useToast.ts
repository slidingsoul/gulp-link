import { useCallback, useEffect, useRef, useState } from 'react'

export interface ToastMessage {
  id: string
  message: string
  tone: 'success' | 'error' | 'info'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timers = useRef<Map<string, number>>(new Map())
  const messagesById = useRef<Map<string, string>>(new Map())
  const liveMessages = useRef<Set<string>>(new Set())

  const remove = useCallback((id: string) => {
    const message = messagesById.current.get(id)
    if (message) {
      liveMessages.current.delete(message)
      messagesById.current.delete(id)
    }
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const dismiss = useCallback(
    (id: string) => {
      remove(id)
      setToasts((current) => current.filter((toast) => toast.id !== id))
    },
    [remove],
  )

  const push = useCallback(
    (message: string, tone: ToastMessage['tone'] = 'info') => {
      // Don't stack identical messages when a user gulps several links quickly.
      if (liveMessages.current.has(message)) return

      liveMessages.current.add(message)
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      messagesById.current.set(id, message)
      setToasts((current) => [...current.slice(-2), { id, message, tone }])

      const timer = window.setTimeout(() => {
        remove(id)
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, 3200)
      timers.current.set(id, timer)
    },
    [remove],
  )

  useEffect(() => {
    const timerMap = timers.current
    const messageMap = messagesById.current
    const liveSet = liveMessages.current
    return () => {
      timerMap.forEach((timer) => window.clearTimeout(timer))
      timerMap.clear()
      messageMap.clear()
      liveSet.clear()
    }
  }, [])

  return { toasts, push, dismiss }
}
