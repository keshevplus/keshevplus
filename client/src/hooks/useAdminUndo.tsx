import { useCallback, useEffect } from 'react'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'

type UndoHandler = () => Promise<void> | void

interface UndoOptions {
  title: string
  description: string
  undoLabel: string
  undoSuccessTitle: string
  undoErrorTitle: string
  onUndo: UndoHandler
}

let latestUndo: { id: number; run: UndoHandler } | null = null
let nextUndoId = 0

export function useAdminUndo() {
  const { toast } = useToast()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isUndoShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z'
      if (!isUndoShortcut || !latestUndo) return
      event.preventDefault()
      const undo = latestUndo
      latestUndo = null
      Promise.resolve(undo.run()).catch(() => undefined)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return useCallback((options: UndoOptions) => {
    const id = ++nextUndoId
    const runUndo = async () => {
      try {
        await options.onUndo()
        toast({ title: options.undoSuccessTitle })
      } catch {
        toast({ title: options.undoErrorTitle, variant: 'destructive' })
      }
    }

    const guardedUndo = async () => {
      if (!latestUndo || latestUndo.id !== id) return
      latestUndo = null
      await runUndo()
    }

    latestUndo = { id, run: guardedUndo }

    toast({
      title: options.title,
      description: options.description,
      action: (
        <ToastAction altText={options.undoLabel} onClick={guardedUndo}>
          {options.undoLabel}
        </ToastAction>
      ),
    })
  }, [toast])
}
