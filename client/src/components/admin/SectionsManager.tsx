import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, ChevronUp, ChevronDown, Save, LayoutGrid, Eye, EyeOff, Monitor, Pencil, Bold, Italic, Underline, Type } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { apiRequest, queryClient } from '@/lib/queryClient'
import { invalidateTranslationCache, useLanguage } from '@/hooks/useLanguage'
import { ALL_LANGUAGES, type SupportedLanguage } from '@/i18n/config'
import { LEGACY_SECTION_TYPES, type HomeSection, type HomeSectionType } from '@shared/schema'
import { GENERIC_SECTION_TYPES, CARD_ICON_OPTIONS, sectionTypeLabel, createDefaultSection, createDefaultItem } from '@/lib/sectionRegistry'
import { LEGACY_SECTION_CONFIG } from '@/lib/legacySectionFields'
import { ImageSlotUploader } from './ImageSlotUploader'
import { ViewportSwitcher, DeviceFrame, type PreviewViewport } from './DevicePreviewFrame'
import { useInlineTextEditor } from '@/hooks/useInlineTextEditor'

const isLegacyType = (type: HomeSectionType) => (LEGACY_SECTION_TYPES as readonly HomeSectionType[]).includes(type)

// The rendered <section id="..."> in the live preview doesn't always match
// the HomeSection.id 1:1 (legacy ADHD info section renders id="adhd" while
// its HomeSection.id is "adhd-info") — this resolves that one exception.
function domIdForSection(section: HomeSection): string {
  return section.type === 'legacy:adhdInfo' ? 'adhd' : section.id
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  )
}

interface EditorProps {
  section: HomeSection
  texts: Record<string, string>
  setText: (key: string, value: string) => void
  updateConfig: (config: Record<string, any>) => void
  isHe: boolean
}

function RichTextEditor({ section, texts, setText, updateConfig, isHe }: EditorProps) {
  const id = section.id
  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Field label={isHe ? 'כותרת משנה' : 'Subtitle'} value={texts[`section.${id}.subtitle`] ?? ''} onChange={(v) => setText(`section.${id}.subtitle`, v)} />
      <Field label={isHe ? 'תוכן' : 'Body'} multiline value={texts[`section.${id}.body`] ?? ''} onChange={(v) => setText(`section.${id}.body`, v)} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label={isHe ? 'טקסט כפתור' : 'Button label'} value={texts[`section.${id}.ctaLabel`] ?? ''} onChange={(v) => setText(`section.${id}.ctaLabel`, v)} />
        <Field label={isHe ? 'קישור כפתור (למשל #contact)' : 'Button link (e.g. #contact)'} value={section.config?.ctaHref ?? ''} onChange={(v) => updateConfig({ ...section.config, ctaHref: v })} />
      </div>
      <ImageSlotUploader slot={`section.${id}.image`} label={isHe ? 'תמונת המקטע' : 'Section image'} />
    </div>
  )
}

function CardsEditor({ section, texts, setText, updateConfig, isHe }: EditorProps) {
  const id = section.id
  const items: Array<{ id: string; icon?: string; hidden?: boolean }> = Array.isArray(section.config?.items) ? section.config.items : []

  const addItem = () => updateConfig({ ...section.config, items: [...items, createDefaultItem()] })
  const removeItem = (itemId: string) => updateConfig({ ...section.config, items: items.filter((i) => i.id !== itemId) })
  const setIcon = (itemId: string, icon: string) => updateConfig({ ...section.config, items: items.map((i) => (i.id === itemId ? { ...i, icon } : i)) })
  const toggleHidden = (itemId: string) => updateConfig({ ...section.config, items: items.map((i) => (i.id === itemId ? { ...i, hidden: !i.hidden } : i)) })

  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Field label={isHe ? 'כותרת משנה' : 'Subtitle'} value={texts[`section.${id}.subtitle`] ?? ''} onChange={(v) => setText(`section.${id}.subtitle`, v)} />
      <Separator />
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className={cn('rounded-md border p-3 space-y-3', item.hidden && 'opacity-50')}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-medium text-muted-foreground">{isHe ? `כרטיס ${idx + 1}` : `Card ${idx + 1}`}</span>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{`section.${id}.items.${item.id}`}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => toggleHidden(item.id)} data-testid={`button-hide-card-item-${item.id}`}>
                  {item.hidden ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} data-testid={`button-remove-card-item-${item.id}`}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isHe ? 'אייקון' : 'Icon'}</Label>
              <Select value={item.icon || 'Star'} onValueChange={(v) => setIcon(item.id, v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARD_ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field label={isHe ? 'כותרת' : 'Title'} value={texts[`section.${id}.items.${item.id}.title`] ?? ''} onChange={(v) => setText(`section.${id}.items.${item.id}.title`, v)} />
            <Field label={isHe ? 'תיאור' : 'Body'} multiline value={texts[`section.${id}.items.${item.id}.body`] ?? ''} onChange={(v) => setText(`section.${id}.items.${item.id}.body`, v)} />
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={addItem}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        {isHe ? 'הוספת כרטיס' : 'Add card'}
      </Button>
    </div>
  )
}

function FaqEditor({ section, texts, setText, updateConfig, isHe }: EditorProps) {
  const id = section.id
  const items: Array<{ id: string; hidden?: boolean }> = Array.isArray(section.config?.items) ? section.config.items : []

  const addItem = () => updateConfig({ ...section.config, items: [...items, createDefaultItem()] })
  const removeItem = (itemId: string) => updateConfig({ ...section.config, items: items.filter((i) => i.id !== itemId) })
  const toggleHidden = (itemId: string) => updateConfig({ ...section.config, items: items.map((i) => (i.id === itemId ? { ...i, hidden: !i.hidden } : i)) })

  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Separator />
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className={cn('rounded-md border p-3 space-y-3', item.hidden && 'opacity-50')}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-medium text-muted-foreground">{isHe ? `שאלה ${idx + 1}` : `Question ${idx + 1}`}</span>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{`section.${id}.items.${item.id}`}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => toggleHidden(item.id)} data-testid={`button-hide-faq-item-${item.id}`}>
                  {item.hidden ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
            <Field label={isHe ? 'שאלה' : 'Question'} value={texts[`section.${id}.items.${item.id}.question`] ?? ''} onChange={(v) => setText(`section.${id}.items.${item.id}.question`, v)} />
            <Field label={isHe ? 'תשובה' : 'Answer'} multiline value={texts[`section.${id}.items.${item.id}.answer`] ?? ''} onChange={(v) => setText(`section.${id}.items.${item.id}.answer`, v)} />
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={addItem}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        {isHe ? 'הוספת שאלה' : 'Add question'}
      </Button>
    </div>
  )
}

function TestimonialsEditor({ section, texts, setText, updateConfig, isHe }: EditorProps) {
  const id = section.id
  const items: Array<{ id: string; hidden?: boolean }> = Array.isArray(section.config?.items) ? section.config.items : []

  const addItem = () => updateConfig({ ...section.config, items: [...items, createDefaultItem()] })
  const removeItem = (itemId: string) => updateConfig({ ...section.config, items: items.filter((i) => i.id !== itemId) })
  const toggleHidden = (itemId: string) => updateConfig({ ...section.config, items: items.map((i) => (i.id === itemId ? { ...i, hidden: !i.hidden } : i)) })

  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Separator />
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className={cn('rounded-md border p-3 space-y-3', item.hidden && 'opacity-50')}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-medium text-muted-foreground">{isHe ? `המלצה ${idx + 1}` : `Testimonial ${idx + 1}`}</span>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{`section.${id}.items.${item.id}`}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => toggleHidden(item.id)} data-testid={`button-hide-testimonial-item-${item.id}`}>
                  {item.hidden ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
            <Field label={isHe ? 'ציטוט' : 'Quote'} multiline value={texts[`section.${id}.items.${item.id}.quote`] ?? ''} onChange={(v) => setText(`section.${id}.items.${item.id}.quote`, v)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={isHe ? 'שם' : 'Name'} value={texts[`section.${id}.items.${item.id}.name`] ?? ''} onChange={(v) => setText(`section.${id}.items.${item.id}.name`, v)} />
              <Field label={isHe ? 'תפקיד' : 'Role'} value={texts[`section.${id}.items.${item.id}.role`] ?? ''} onChange={(v) => setText(`section.${id}.items.${item.id}.role`, v)} />
            </div>
            <ImageSlotUploader slot={`section.${id}.items.${item.id}.image`} label={isHe ? 'תמונה' : 'Photo'} />
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={addItem}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        {isHe ? 'הוספת המלצה' : 'Add testimonial'}
      </Button>
    </div>
  )
}

function GalleryEditor({ section, texts, setText, updateConfig, isHe }: EditorProps) {
  const id = section.id
  const items: Array<{ id: string; hidden?: boolean }> = Array.isArray(section.config?.items) ? section.config.items : []

  const addItem = () => updateConfig({ ...section.config, items: [...items, createDefaultItem()] })
  const removeItem = (itemId: string) => updateConfig({ ...section.config, items: items.filter((i) => i.id !== itemId) })
  const toggleHidden = (itemId: string) => updateConfig({ ...section.config, items: items.map((i) => (i.id === itemId ? { ...i, hidden: !i.hidden } : i)) })

  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Separator />
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div key={item.id} className={cn('rounded-md border p-3 space-y-2', item.hidden && 'opacity-50')}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-medium text-muted-foreground">{isHe ? `תמונה ${idx + 1}` : `Image ${idx + 1}`}</span>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{`section.${id}.items.${item.id}`}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => toggleHidden(item.id)} data-testid={`button-hide-gallery-item-${item.id}`}>
                  {item.hidden ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
            <ImageSlotUploader slot={`section.${id}.items.${item.id}.image`} label={isHe ? 'תמונה' : 'Image'} />
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={addItem}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        {isHe ? 'הוספת תמונה' : 'Add image'}
      </Button>
    </div>
  )
}

function CtaEditor({ section, texts, setText, updateConfig, isHe }: EditorProps) {
  const id = section.id
  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Field label={isHe ? 'כותרת משנה' : 'Subtitle'} value={texts[`section.${id}.subtitle`] ?? ''} onChange={(v) => setText(`section.${id}.subtitle`, v)} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label={isHe ? 'טקסט כפתור' : 'Button label'} value={texts[`section.${id}.buttonLabel`] ?? ''} onChange={(v) => setText(`section.${id}.buttonLabel`, v)} />
        <Field label={isHe ? 'קישור כפתור' : 'Button link'} value={section.config?.ctaHref ?? ''} onChange={(v) => updateConfig({ ...section.config, ctaHref: v })} />
      </div>
    </div>
  )
}

function LegacyFieldsEditor({ section, texts, setText, isHe }: EditorProps) {
  const config = LEGACY_SECTION_CONFIG[section.type]
  if (!config) return null
  return (
    <div className="space-y-3">
      {config.images && config.images.length > 0 && (
        <>
          {config.images.map((img) => (
            <ImageSlotUploader key={img.slot} slot={img.slot} label={isHe ? img.labelHe : img.labelEn} />
          ))}
          <Separator />
        </>
      )}
      {config.fields.map((f) => (
        <Field
          key={f.key}
          label={isHe ? f.labelHe : f.labelEn}
          multiline={f.multiline}
          value={texts[f.key] ?? ''}
          onChange={(v) => setText(f.key, v)}
        />
      ))}
    </div>
  )
}

function sectionTextKeys(section: HomeSection): string[] {
  const id = section.id
  const items: Array<{ id: string }> = Array.isArray(section.config?.items) ? section.config.items : []
  const legacyConfig = LEGACY_SECTION_CONFIG[section.type]
  if (legacyConfig) return legacyConfig.fields.map((f) => f.key)
  switch (section.type) {
    case 'richText':
      return [`section.${id}.heading`, `section.${id}.subtitle`, `section.${id}.body`, `section.${id}.ctaLabel`]
    case 'cta':
      return [`section.${id}.heading`, `section.${id}.subtitle`, `section.${id}.buttonLabel`]
    case 'cards':
      return [`section.${id}.heading`, `section.${id}.subtitle`, ...items.flatMap((i) => [`section.${id}.items.${i.id}.title`, `section.${id}.items.${i.id}.body`])]
    case 'faq':
      return [`section.${id}.heading`, ...items.flatMap((i) => [`section.${id}.items.${i.id}.question`, `section.${id}.items.${i.id}.answer`])]
    case 'testimonials':
      return [`section.${id}.heading`, ...items.flatMap((i) => [`section.${id}.items.${i.id}.quote`, `section.${id}.items.${i.id}.name`, `section.${id}.items.${i.id}.role`])]
    case 'gallery':
      return [`section.${id}.heading`]
    default:
      return []
  }
}

function renderEditor(props: EditorProps) {
  if (isLegacyType(props.section.type)) return <LegacyFieldsEditor {...props} />
  switch (props.section.type) {
    case 'richText': return <RichTextEditor {...props} />
    case 'cards': return <CardsEditor {...props} />
    case 'faq': return <FaqEditor {...props} />
    case 'testimonials': return <TestimonialsEditor {...props} />
    case 'gallery': return <GalleryEditor {...props} />
    case 'cta': return <CtaEditor {...props} />
    default: return null
  }
}

const SectionsManager = () => {
  const { toast } = useToast()
  const { language } = useLanguage()
  const isHe = language === 'he'
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editLang, setEditLang] = useState<SupportedLanguage>(language)
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [addingType, setAddingType] = useState<string>('')
  const [savingContent, setSavingContent] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>('desktop')
  const [previewSrc] = useState(() => `/?visualEditor=true&_t=${Date.now()}`)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const sectionsRef = useRef<HomeSection[]>([])
  const clickListenerRef = useRef<{ doc: Document; handler: (e: MouseEvent) => void } | null>(null)

  const {
    editMode: textEditMode,
    setEditMode: setTextEditMode,
    pendingEdits: pendingTextEdits,
    saving: savingTextEdits,
    highlightedCount: editableTextCount,
    onIframeLoad: onTextEditorIframeLoad,
    handleSaveAll: saveTextEdits,
    handleDiscardAll: discardTextEdits,
    execCommand,
  } = useInlineTextEditor(iframeRef, editLang, isHe)

  useEffect(() => {
    sectionsRef.current = sections
  }, [sections])

  const fetchSections = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/home-sections', { credentials: 'include' })
      if (res.ok) setSections(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSections() }, [fetchSections])

  const fetchTexts = useCallback(async (lang: string) => {
    try {
      const res = await fetch(`/api/translations?lang=${lang}`, { credentials: 'include' })
      if (res.ok) setTexts(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (selectedId) fetchTexts(editLang)
  }, [selectedId, editLang, fetchTexts])

  const updateSections = (next: HomeSection[]) => {
    setSections(next)
    setDirty(true)
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    try {
      await apiRequest('PUT', '/api/admin/home-sections', sections)
      setDirty(false)
      queryClient.invalidateQueries({ queryKey: ['/api/home-sections'] })
      toast({ title: isHe ? 'נשמר בהצלחה' : 'Saved successfully' })
    } catch {
      toast({ title: isHe ? 'שגיאה' : 'Error', description: isHe ? 'שמירת המקטעים נכשלה' : 'Failed to save sections', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    ;[next[index], next[target]] = [next[target], next[index]]
    updateSections(next)
  }

  const toggleEnabled = (id: string) => {
    updateSections(sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  const removeSection = (id: string) => {
    updateSections(sections.filter((s) => s.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const addSection = () => {
    if (!addingType) return
    const section = createDefaultSection(addingType as HomeSectionType)
    updateSections([...sections, section])
    setSelectedId(section.id)
    setAddingType('')
  }

  const updateConfig = (id: string, config: Record<string, any>) => {
    updateSections(sections.map((s) => (s.id === id ? { ...s, config } : s)))
  }

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    const doc = iframe.contentDocument

    const style = doc.createElement('style')
    style.textContent = `
      [data-cms-section] { cursor: pointer; transition: outline-color 0.15s; }
      [data-cms-section]:hover { outline: 3px dashed rgba(34, 197, 94, 0.7); outline-offset: -3px; }
    `
    doc.head.appendChild(style)

    if (clickListenerRef.current) {
      const prev = clickListenerRef.current
      prev.doc.removeEventListener('click', prev.handler, true)
    }

    doc.querySelectorAll('section[id]').forEach((el) => el.setAttribute('data-cms-section', 'true'))

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const sectionEl = target.closest('section[id]') as HTMLElement | null
      e.preventDefault()
      e.stopPropagation()
      if (!sectionEl) return
      const domId = sectionEl.id
      const match = sectionsRef.current.find((s) => domIdForSection(s) === domId)
      if (match) setSelectedId(match.id)
    }

    doc.addEventListener('click', clickHandler, true)
    clickListenerRef.current = { doc, handler: clickHandler }

    onTextEditorIframeLoad()
  }, [onTextEditorIframeLoad])

  useEffect(() => {
    return () => {
      if (clickListenerRef.current) {
        const prev = clickListenerRef.current
        try { prev.doc.removeEventListener('click', prev.handler, true) } catch { /* iframe already gone */ }
      }
    }
  }, [])

  const setText = (key: string, value: string) => {
    setTexts((prev) => ({ ...prev, [key]: value }))
  }

  const saveContent = async (section: HomeSection) => {
    setSavingContent(true)
    try {
      const keys = sectionTextKeys(section)
      const items = keys.map((key) => ({ key, language: editLang, value: texts[key] ?? '' }))
      await apiRequest('PUT', '/api/translations/bulk', items)
      invalidateTranslationCache(editLang)
      toast({ title: isHe ? 'התוכן נשמר' : 'Content saved' })
    } catch {
      toast({ title: isHe ? 'שגיאה' : 'Error', description: isHe ? 'שמירת התוכן נכשלה' : 'Failed to save content', variant: 'destructive' })
    } finally {
      setSavingContent(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'מקטעי דף הבית' : 'Home Page Sections'}</CardTitle>
        </div>
        <CardDescription>
          {isHe
            ? 'הוספה, הסתרה, סידור מחדש ועריכת התוכן של מקטעי דף הבית - כולל טקסט ותמונות.'
            : 'Add, hide, reorder, and directly edit the content — text and images — of every home page section.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Select value={addingType} onValueChange={setAddingType}>
              <SelectTrigger className="w-[220px]" data-testid="select-add-section-type">
                <SelectValue placeholder={isHe ? 'בחר סוג מקטע להוספה' : 'Choose a section type to add'} />
              </SelectTrigger>
              <SelectContent>
                {GENERIC_SECTION_TYPES.map((t) => (
                  <SelectItem key={t.type} value={t.type}>{isHe ? t.labelHe : t.labelEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={addSection} disabled={!addingType} data-testid="button-add-section">
              <Plus className="h-4 w-4 mr-1.5" />
              {isHe ? 'הוספת מקטע' : 'Add Section'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowPreview((v) => !v)} data-testid="button-toggle-preview">
              <Monitor className="h-4 w-4 mr-1.5" />
              {showPreview
                ? (isHe ? 'הסתרת תצוגה מקדימה' : 'Hide Live Preview')
                : (isHe ? 'הצגת תצוגה מקדימה' : 'Show Live Preview')}
            </Button>
            <Button size="sm" onClick={handleSaveOrder} disabled={!dirty || saving} data-testid="button-save-sections">
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? (isHe ? 'שומר...' : 'Saving...') : (isHe ? 'שמירת סדר ומצב' : 'Save Order & Visibility')}
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="border rounded-md overflow-hidden">
            <div className="flex items-center justify-between gap-2 flex-wrap bg-muted/50 px-3 py-2 border-b">
              <p className="text-xs text-muted-foreground">
                {textEditMode
                  ? (isHe ? 'לחצו על טקסט מודגש בירוק כדי לערוך אותו ישירות.' : 'Click green-highlighted text to edit it directly.')
                  : (isHe ? 'לחצו על מקטע בתצוגה כדי לפתוח את עורך התוכן שלו.' : 'Click a section in the preview to open its content editor.')}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {textEditMode && (
                  <div className="flex items-center gap-1 border-l pl-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => execCommand('bold')} data-testid="button-preview-format-bold">
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => execCommand('italic')} data-testid="button-preview-format-italic">
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => execCommand('underline')} data-testid="button-preview-format-underline">
                      <Underline className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                {textEditMode && editableTextCount > 0 && (
                  <Badge variant="secondary">
                    <Type className="h-3 w-3 mr-1" />
                    {editableTextCount} {isHe ? 'שדות ניתנים לעריכה' : 'editable fields'}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant={textEditMode ? 'default' : 'outline'}
                  onClick={() => setTextEditMode((v) => !v)}
                  data-testid="button-toggle-text-edit-mode"
                >
                  <Pencil className="h-4 w-4 mr-1.5" />
                  {textEditMode
                    ? (isHe ? 'מצב עריכה פעיל' : 'Editing Active')
                    : (isHe ? 'הפעל עריכה ויזואלית' : 'Enable Visual Editing')}
                </Button>
                <ViewportSwitcher viewport={previewViewport} onChange={setPreviewViewport} isHe={isHe} />
              </div>
            </div>
            <DeviceFrame
              viewport={previewViewport}
              iframeRef={iframeRef}
              src={previewSrc}
              onLoad={handleIframeLoad}
              title={isHe ? 'תצוגה מקדימה של האתר' : 'Site preview'}
            />
            {pendingTextEdits.length > 0 && (
              <div className="flex items-center justify-between gap-2 flex-wrap bg-muted/50 px-3 py-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {isHe ? `${pendingTextEdits.length} שינויי טקסט ממתינים` : `${pendingTextEdits.length} pending text changes`}
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={discardTextEdits} data-testid="button-discard-preview-text-edits">
                    {isHe ? 'בטל הכל' : 'Discard All'}
                  </Button>
                  <Button size="sm" onClick={saveTextEdits} disabled={savingTextEdits} data-testid="button-save-preview-text-edits">
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    {savingTextEdits ? (isHe ? 'שומר...' : 'Saving...') : (isHe ? 'שמירת שינויי טקסט' : 'Save Text Edits')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(240px,340px)_1fr] gap-4 items-start">
            <div className="space-y-2">
              {sections.map((section, index) => {
                const legacy = isLegacyType(section.type)
                const selected = selectedId === section.id
                return (
                  <Card
                    key={section.id}
                    className={cn(!section.enabled && 'opacity-60', selected && 'border-primary ring-1 ring-primary', 'cursor-pointer')}
                    onClick={() => setSelectedId(section.id)}
                    data-testid={`card-section-${section.id}`}
                  >
                    <CardContent className="p-3 flex items-center gap-2">
                      <div className="flex flex-col">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); move(index, -1) }} disabled={index === 0} data-testid={`button-move-up-${section.id}`}>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); move(index, 1) }} disabled={index === sections.length - 1} data-testid={`button-move-down-${section.id}`}>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{sectionTypeLabel(section.type, isHe)}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{section.id}</p>
                      </div>
                      <Switch checked={section.enabled} onCheckedChange={() => toggleEnabled(section.id)} onClick={(e) => e.stopPropagation()} data-testid={`switch-enabled-${section.id}`} />
                      {!legacy && (
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); removeSection(section.id) }} data-testid={`button-delete-section-${section.id}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card className="lg:sticky lg:top-4">
              <CardContent className="p-4">
                {(() => {
                  const section = sections.find((s) => s.id === selectedId)
                  if (!section) {
                    return (
                      <p className="text-sm text-muted-foreground p-4 text-center">
                        {isHe ? 'בחרו מקטע כדי לערוך את תוכנו' : 'Select a section to edit its content'}
                      </p>
                    )
                  }
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-medium text-sm">{sectionTypeLabel(section.type, isHe)}</p>
                          <p className="text-xs text-muted-foreground font-mono">{section.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={editLang} onValueChange={(v) => setEditLang(v as SupportedLanguage)}>
                            <SelectTrigger className="w-[160px]" data-testid="select-section-edit-language">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_LANGUAGES.map((l) => (
                                <SelectItem key={l.code} value={l.code}>{l.flag} {l.nativeName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => saveContent(section)} disabled={savingContent} data-testid={`button-save-content-${section.id}`}>
                            <Save className="h-3.5 w-3.5 mr-1.5" />
                            {savingContent ? (isHe ? 'שומר...' : 'Saving...') : (isHe ? 'שמירת תוכן' : 'Save Content')}
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      {renderEditor({
                        section,
                        texts,
                        setText,
                        updateConfig: (config) => updateConfig(section.id, config),
                        isHe,
                      })}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SectionsManager
