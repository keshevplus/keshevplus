import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/useLanguage'
import { apiRequest } from '@/lib/queryClient'
import { invalidateTranslationCache } from '@/hooks/useLanguage'
import { ALL_LANGUAGES, type SupportedLanguage } from '@/i18n/config'
import { cn } from '@/lib/utils'
import {
  Eye,
  Pencil,
  Save,
  RotateCcw,
  Bold,
  Italic,
  Underline,
  Monitor,
  Smartphone,
  Tablet,
  X,
  Type,
  MousePointer,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react'

interface PendingEdit {
  key: string
  oldValue: string
  newValue: string
  element: HTMLElement | null
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

export default function VisualEditor() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [editMode, setEditMode] = useState(false)
  const [editLang, setEditLang] = useState<SupportedLanguage>(language)
  const [translationMap, setTranslationMap] = useState<Record<string, string>>({})
  const [reverseMap, setReverseMap] = useState<Map<string, string>>(new Map())
  const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([])
  const [saving, setSaving] = useState(false)
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null)
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [highlightedCount, setHighlightedCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const pendingEditsRef = useRef<PendingEdit[]>([])
  const editModeRef = useRef(false)
  const translationMapRef = useRef<Record<string, string>>({})
  const listenersRef = useRef<{ doc: Document; click: any; blur: any; keydown: any } | null>(null)

  useEffect(() => {
    pendingEditsRef.current = pendingEdits
  }, [pendingEdits])

  useEffect(() => {
    editModeRef.current = editMode
  }, [editMode])

  useEffect(() => {
    translationMapRef.current = translationMap
  }, [translationMap])

  // Handle ESC for fullscreen exit
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isFullscreen])

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
  }, [editMode, reverseMap, findTextNodes])

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true)

    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    const doc = iframe.contentDocument

    const hideAdmin = doc.createElement('style')
    hideAdmin.textContent = `
      [data-testid="button-open-chat"],
      [data-testid="chat-attention-bar"],
      .cookies-banner,
      [data-testid="button-close-chat-bar"] {
        display: none !important;
      }
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
    doc.head.appendChild(hideAdmin)

    if (listenersRef.current) {
      const prev = listenersRef.current
      prev.doc.removeEventListener('click', prev.click, true)
      prev.doc.removeEventListener('blur', prev.blur, true)
      prev.doc.removeEventListener('keydown', prev.keydown, true)
      listenersRef.current = null
    }

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const editableEl = target.closest('[data-i18n-key]') as HTMLElement | null
      
      // Always prevent default to stop link navigation or form submissions in preview
      e.preventDefault()
      e.stopPropagation()

      if (!editModeRef.current) return
      if (!editableEl) return

      doc.querySelectorAll('[data-i18n-editing]').forEach((el) => {
        (el as HTMLElement).removeAttribute('data-i18n-editing')
        ;(el as HTMLElement).contentEditable = 'false'
      })

      const key = editableEl.getAttribute('data-i18n-key')
      if (!key) return

      editableEl.contentEditable = 'true'
      editableEl.setAttribute('data-i18n-editing', 'true')
      editableEl.focus()
      setActiveElement(editableEl)
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
      setActiveElement(null)
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
        setActiveElement(null)
        setEditingKey(null)
      }
    }

    doc.addEventListener('click', clickHandler, true)
    doc.addEventListener('blur', blurHandler, true)
    doc.addEventListener('keydown', keydownHandler, true)
    listenersRef.current = { doc, click: clickHandler, blur: blurHandler, keydown: keydownHandler }

    setTimeout(() => highlightEditableElements(), 500)
  }, [highlightEditableElements])

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

      await apiRequest('PUT', '/api/translations/bulk', { items })
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

  const iframeSrc = `/?_t=${Date.now()}`

  return (
    <div className={cn(
      "space-y-4",
      isFullscreen && "fixed inset-0 z-[1000] bg-background p-4 flex flex-col h-screen overflow-hidden"
    )}>
      <Card className={cn(isFullscreen && "flex-1 flex flex-col h-full border-none shadow-none")}>
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{isHe ? 'עורך ויזואלי' : 'Visual Editor'}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={editLang}
                onValueChange={(v) => setEditLang(v as SupportedLanguage)}
              >
                <SelectTrigger className="w-[140px]" data-testid="select-editor-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} data-testid={`option-editor-lang-${lang.code}`}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={editMode ? 'default' : 'outline'}
                onClick={() => setEditMode(!editMode)}
                data-testid="button-toggle-edit-mode"
              >
                {editMode ? (
                  <>
                    <MousePointer className="h-4 w-4 mr-1.5" />
                    {isHe ? 'מצב עריכה פעיל' : 'Editing Active'}
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-1.5" />
                    {isHe ? 'הפעל עריכה' : 'Enable Editing'}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                data-testid="button-toggle-fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-3", isFullscreen && "flex-1 flex flex-col overflow-hidden")}>
          <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant={viewport === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setViewport('desktop')}
                data-testid="button-viewport-desktop"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={viewport === 'tablet' ? 'default' : 'ghost'}
                onClick={() => setViewport('tablet')}
                data-testid="button-viewport-tablet"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={viewport === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setViewport('mobile')}
                data-testid="button-viewport-mobile"
              >
                <Smartphone className="h-4 w-4" />
              </Button>

              {editMode && (
                <div className="flex items-center gap-1 border-l pl-2 ml-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => execCommand('bold')}
                    data-testid="button-format-bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => execCommand('italic')}
                    data-testid="button-format-italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => execCommand('underline')}
                    data-testid="button-format-underline"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {editMode && highlightedCount > 0 && (
                <Badge variant="secondary">
                  <Type className="h-3 w-3 mr-1" />
                  {highlightedCount} {isHe ? 'שדות ניתנים לעריכה' : 'editable fields'}
                </Badge>
              )}
              {editingKey && (
                <Badge variant="outline">
                  {editingKey}
                </Badge>
              )}
            </div>
          </div>

          {editMode && (
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground flex items-start gap-2 shrink-0">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                {isHe
                  ? 'לחצו על טקסט מודגש בירוק כדי לערוך. Enter לשמירה, Escape לביטול. שינויים נשמרים ב"שמור הכל".'
                  : 'Click on green-highlighted text to edit. Enter to confirm, Escape to cancel. Changes are saved via "Save All".'}
              </span>
            </div>
          )}

          <div
            className={cn(
              "border rounded-md overflow-hidden bg-white dark:bg-neutral-900 flex justify-center",
              !isFullscreen && "min-height-[600px]",
              isFullscreen && "flex-1"
            )}
          >
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              onLoad={handleIframeLoad}
              style={{
                width: VIEWPORT_WIDTHS[viewport],
                maxWidth: '100%',
                height: isFullscreen ? '100%' : '75vh',
                border: 'none',
                transition: 'width 0.3s ease',
              }}
              title={isHe ? 'תצוגה מקדימה של האתר' : 'Site preview'}
              data-testid="iframe-visual-editor"
            />
          </div>
        </CardContent>
      </Card>

      {pendingEdits.length > 0 && (
        <Card className={cn(isFullscreen && "fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[1001] shadow-2xl")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">
                  {isHe ? `שינויים ממתינים (${pendingEdits.length})` : `Pending Changes (${pendingEdits.length})`}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscardAll}
                  data-testid="button-discard-all"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  {isHe ? 'בטל הכל' : 'Discard All'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAll}
                  disabled={saving}
                  data-testid="button-save-all-edits"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving
                    ? (isHe ? 'שומר...' : 'Saving...')
                    : (isHe ? 'שמור הכל' : 'Save All')}
                </Button>
              </div>
            </div>
          </CardHeader>
          {!isFullscreen && (
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingEdits.map((edit) => (
                  <div
                    key={edit.key}
                    className="flex items-start gap-3 p-3 rounded-md bg-muted/30 text-sm"
                    data-testid={`pending-edit-${edit.key}`}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {edit.key}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="line-through truncate max-w-[200px]">{edit.oldValue}</span>
                        <Check className="h-3 w-3 text-green-600 shrink-0" />
                        <span className="truncate max-w-[200px] text-foreground font-medium">{edit.newValue}</span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveEdit(edit.key)}
                      data-testid={`button-remove-edit-${edit.key}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
