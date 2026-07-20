import { useState, useRef, useEffect, useCallback, type RefObject } from 'react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { invalidateTranslationCache } from '@/hooks/useLanguage'

export interface PendingEdit {
  key: string
  oldValue: string
  newValue: string
  element: HTMLElement | null
}

// Click-to-edit-text-in-place logic shared by the standalone Visual Editor
// tab and the Sections Manager live preview, so both surfaces behave
// identically instead of maintaining two copies of this iframe wiring.
export function useInlineTextEditor(iframeRef: RefObject<HTMLIFrameElement>, editLang: string, isHe: boolean) {
  const { toast } = useToast()
  const [editMode, setEditMode] = useState(false)
  const [translationMap, setTranslationMap] = useState<Record<string, string>>({})
  const [reverseMap, setReverseMap] = useState<Map<string, string>>(new Map())
  const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([])
  const [saving, setSaving] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [highlightedCount, setHighlightedCount] = useState(0)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const pendingEditsRef = useRef<PendingEdit[]>([])
  const editModeRef = useRef(false)
  const translationMapRef = useRef<Record<string, string>>({})
  const listenersRef = useRef<{ doc: Document; click: any; blur: any; keydown: any } | null>(null)

  useEffect(() => { pendingEditsRef.current = pendingEdits }, [pendingEdits])
  useEffect(() => { editModeRef.current = editMode }, [editMode])
  useEffect(() => { translationMapRef.current = translationMap }, [translationMap])

  const fetchTranslations = useCallback(async (lang: string) => {
    try {
      const res = await fetch(`/api/translations?lang=${lang}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTranslationMap(data)
        const reverse = new Map<string, string>()
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string' && value.trim().length > 1) {
            reverse.set(value.trim(), key)
          }
        }
        setReverseMap(reverse)
      }
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'טעינת תרגומים נכשלה' : 'Failed to load translations',
        variant: 'destructive',
      })
    }
  }, [isHe, toast])

  useEffect(() => {
    fetchTranslations(editLang)
  }, [editLang, fetchTranslations])

  const findTextNodes = useCallback((root: Node): Text[] => {
    const textNodes: Text[] = []
    const walker = root.ownerDocument!.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const text = node.textContent?.trim()
          if (!text || text.length < 2) return NodeFilter.FILTER_REJECT
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT
          const tag = parent.tagName.toLowerCase()
          if (['script', 'style', 'noscript', 'iframe'].includes(tag)) {
            return NodeFilter.FILTER_REJECT
          }
          return NodeFilter.FILTER_ACCEPT
        },
      }
    )
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text)
    }
    return textNodes
  }, [])

  const highlightEditableElements = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return

    const doc = iframe.contentDocument
    doc.querySelectorAll('[data-i18n-key]').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.removeAttribute('contenteditable')
      htmlEl.style.removeProperty('outline')
      htmlEl.style.removeProperty('outline-offset')
      htmlEl.style.removeProperty('cursor')
      htmlEl.style.removeProperty('position')
      htmlEl.removeAttribute('data-i18n-key')
    })

    if (!editMode) {
      setHighlightedCount(0)
      return
    }

    const textNodes = findTextNodes(doc.body)
    let count = 0

    for (const textNode of textNodes) {
      const text = textNode.textContent?.trim()
      if (!text) continue

      const key = reverseMap.get(text)
      if (!key) continue

      const parent = textNode.parentElement
      if (!parent) continue
      if (parent.getAttribute('data-i18n-key')) continue

      parent.setAttribute('data-i18n-key', key)
      parent.style.outline = '2px dashed rgba(34, 197, 94, 0.5)'
      parent.style.outlineOffset = '2px'
      parent.style.cursor = 'pointer'
      parent.style.position = 'relative'
      count++
    }

    setHighlightedCount(count)
  }, [editMode, reverseMap, findTextNodes, iframeRef])

  const onIframeLoad = useCallback(() => {
    setIframeLoaded(true)

    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    const doc = iframe.contentDocument

    const style = doc.createElement('style')
    style.textContent = `
      [data-i18n-key]:hover {
        outline-color: rgba(34, 197, 94, 0.9) !important;
        outline-style: solid !important;
      }
      [data-i18n-key]:focus {
        outline: 3px solid rgba(34, 197, 94, 1) !important;
        outline-offset: 2px !important;
        background: rgba(34, 197, 94, 0.05) !important;
      }
      [data-i18n-editing] {
        outline: 3px solid #F97316 !important;
        background: rgba(249, 115, 22, 0.08) !important;
      }
    `
    doc.head.appendChild(style)

    if (listenersRef.current) {
      const prev = listenersRef.current
      prev.doc.removeEventListener('click', prev.click, true)
      prev.doc.removeEventListener('blur', prev.blur, true)
      prev.doc.removeEventListener('keydown', prev.keydown, true)
      listenersRef.current = null
    }

    const clickHandler = (e: MouseEvent) => {
      if (!editModeRef.current) return
      const target = e.target as HTMLElement
      const editableEl = target.closest('[data-i18n-key]') as HTMLElement | null
      if (!editableEl) return

      e.preventDefault()
      e.stopPropagation()

      doc.querySelectorAll('[data-i18n-editing]').forEach((el) => {
        (el as HTMLElement).removeAttribute('data-i18n-editing')
        ;(el as HTMLElement).contentEditable = 'false'
      })

      const key = editableEl.getAttribute('data-i18n-key')
      if (!key) return

      editableEl.contentEditable = 'true'
      editableEl.setAttribute('data-i18n-editing', 'true')
      editableEl.focus()
      setEditingKey(key)
    }

    const blurHandler = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (!target.hasAttribute('data-i18n-editing')) return

      const key = target.getAttribute('data-i18n-key')
      if (!key) return

      const newValue = target.textContent?.trim() || ''
      const oldValue = translationMapRef.current[key] || ''

      if (newValue && oldValue && newValue !== oldValue) {
        const existing = pendingEditsRef.current.find((pe) => pe.key === key)
        if (existing) {
          setPendingEdits((prev) =>
            prev.map((pe) => (pe.key === key ? { ...pe, newValue, element: target } : pe))
          )
        } else {
          setPendingEdits((prev) => [...prev, { key, oldValue, newValue, element: target }])
        }
      }

      target.removeAttribute('data-i18n-editing')
      target.contentEditable = 'false'
      setEditingKey(null)
    }

    const keydownHandler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (!target.hasAttribute('data-i18n-editing')) return

      if (e.key === 'Enter') {
        e.preventDefault()
        target.blur()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        const key = target.getAttribute('data-i18n-key')
        if (key && translationMapRef.current[key]) {
          target.textContent = translationMapRef.current[key]
        }
        target.removeAttribute('data-i18n-editing')
        target.contentEditable = 'false'
        setEditingKey(null)
      }
    }

    doc.addEventListener('click', clickHandler, true)
    doc.addEventListener('blur', blurHandler, true)
    doc.addEventListener('keydown', keydownHandler, true)
    listenersRef.current = { doc, click: clickHandler, blur: blurHandler, keydown: keydownHandler }

    setTimeout(() => highlightEditableElements(), 500)
  }, [highlightEditableElements, iframeRef])

  useEffect(() => {
    if (iframeLoaded) {
      highlightEditableElements()
    }
  }, [editMode, iframeLoaded, highlightEditableElements])

  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        const prev = listenersRef.current
        try {
          prev.doc.removeEventListener('click', prev.click, true)
          prev.doc.removeEventListener('blur', prev.blur, true)
          prev.doc.removeEventListener('keydown', prev.keydown, true)
        } catch {}
        listenersRef.current = null
      }
    }
  }, [])

  const handleSaveAll = async () => {
    if (pendingEdits.length === 0) return
    setSaving(true)

    try {
      const items = pendingEdits.map((edit) => ({
        key: edit.key,
        language: editLang,
        value: edit.newValue,
      }))

      await apiRequest('PUT', '/api/translations/bulk', items)
      invalidateTranslationCache(editLang)

      toast({
        title: isHe ? 'נשמר בהצלחה' : 'Saved successfully',
        description: isHe
          ? `${pendingEdits.length} תרגומים עודכנו`
          : `${pendingEdits.length} translations updated`,
      })

      setPendingEdits([])
      await fetchTranslations(editLang)

      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src
      }
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'שמירת התרגומים נכשלה' : 'Failed to load translations',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDiscardAll = () => {
    pendingEdits.forEach((edit) => {
      if (edit.element && edit.element.isConnected) {
        edit.element.textContent = edit.oldValue
      }
    })
    setPendingEdits([])
  }

  const handleRemoveEdit = (key: string) => {
    const edit = pendingEdits.find((e) => e.key === key)
    if (edit?.element && edit.element.isConnected) {
      edit.element.textContent = edit.oldValue
    }
    setPendingEdits((prev) => prev.filter((e) => e.key !== key))
  }

  const execCommand = (command: string) => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    iframe.contentDocument.execCommand(command, false)
  }

  return {
    editMode,
    setEditMode,
    pendingEdits,
    saving,
    editingKey,
    highlightedCount,
    onIframeLoad,
    handleSaveAll,
    handleDiscardAll,
    handleRemoveEdit,
    execCommand,
  }
}
