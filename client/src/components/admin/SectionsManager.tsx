import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, ChevronUp, ChevronDown, Pencil, Save, LayoutGrid } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { invalidateTranslationCache, useLanguage } from '@/hooks/useLanguage'
import { ALL_LANGUAGES, type SupportedLanguage } from '@/i18n/config'
import { LEGACY_SECTION_TYPES, type HomeSection, type HomeSectionType } from '@shared/schema'
import { GENERIC_SECTION_TYPES, CARD_ICON_OPTIONS, sectionTypeLabel, createDefaultSection, createDefaultItem } from '@/lib/sectionRegistry'
import { ImageSlotUploader } from './ImageSlotUploader'

const isLegacyType = (type: HomeSectionType) => (LEGACY_SECTION_TYPES as readonly HomeSectionType[]).includes(type)

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
  const items: Array<{ id: string; icon?: string }> = Array.isArray(section.config?.items) ? section.config.items : []

  const addItem = () => updateConfig({ ...section.config, items: [...items, createDefaultItem()] })
  const removeItem = (itemId: string) => updateConfig({ ...section.config, items: items.filter((i) => i.id !== itemId) })
  const setIcon = (itemId: string, icon: string) => updateConfig({ ...section.config, items: items.map((i) => (i.id === itemId ? { ...i, icon } : i)) })

  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Field label={isHe ? 'כותרת משנה' : 'Subtitle'} value={texts[`section.${id}.subtitle`] ?? ''} onChange={(v) => setText(`section.${id}.subtitle`, v)} />
      <Separator />
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className="rounded-md border p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{isHe ? `כרטיס ${idx + 1}` : `Card ${idx + 1}`}</span>
              <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} data-testid={`button-remove-card-item-${item.id}`}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
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
  const items: Array<{ id: string }> = Array.isArray(section.config?.items) ? section.config.items : []

  const addItem = () => updateConfig({ ...section.config, items: [...items, createDefaultItem()] })
  const removeItem = (itemId: string) => updateConfig({ ...section.config, items: items.filter((i) => i.id !== itemId) })

  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Separator />
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className="rounded-md border p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{isHe ? `שאלה ${idx + 1}` : `Question ${idx + 1}`}</span>
              <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
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
  const items: Array<{ id: string }> = Array.isArray(section.config?.items) ? section.config.items : []

  const addItem = () => updateConfig({ ...section.config, items: [...items, createDefaultItem()] })
  const removeItem = (itemId: string) => updateConfig({ ...section.config, items: items.filter((i) => i.id !== itemId) })

  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Separator />
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className="rounded-md border p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{isHe ? `המלצה ${idx + 1}` : `Testimonial ${idx + 1}`}</span>
              <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
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
  const items: Array<{ id: string }> = Array.isArray(section.config?.items) ? section.config.items : []

  const addItem = () => updateConfig({ ...section.config, items: [...items, createDefaultItem()] })
  const removeItem = (itemId: string) => updateConfig({ ...section.config, items: items.filter((i) => i.id !== itemId) })

  return (
    <div className="space-y-3">
      <Field label={isHe ? 'כותרת' : 'Heading'} value={texts[`section.${id}.heading`] ?? ''} onChange={(v) => setText(`section.${id}.heading`, v)} />
      <Separator />
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div key={item.id} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{isHe ? `תמונה ${idx + 1}` : `Image ${idx + 1}`}</span>
              <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
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

function sectionTextKeys(section: HomeSection): string[] {
  const id = section.id
  const items: Array<{ id: string }> = Array.isArray(section.config?.items) ? section.config.items : []
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editLang, setEditLang] = useState<SupportedLanguage>(language)
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [addingType, setAddingType] = useState<string>('')
  const [savingContent, setSavingContent] = useState(false)

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
    if (expandedId) fetchTexts(editLang)
  }, [expandedId, editLang, fetchTexts])

  const updateSections = (next: HomeSection[]) => {
    setSections(next)
    setDirty(true)
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    try {
      await apiRequest('PUT', '/api/admin/home-sections', sections)
      setDirty(false)
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
    if (expandedId === id) setExpandedId(null)
  }

  const addSection = () => {
    if (!addingType) return
    const section = createDefaultSection(addingType as HomeSectionType)
    updateSections([...sections, section])
    setExpandedId(section.id)
    setAddingType('')
  }

  const updateConfig = (id: string, config: Record<string, any>) => {
    updateSections(sections.map((s) => (s.id === id ? { ...s, config } : s)))
  }

  const setText = (key: string, value: string) => {
    setTexts((prev) => ({ ...prev, [key]: value }))
  }

  const saveContent = async (section: HomeSection) => {
    setSavingContent(true)
    try {
      const keys = sectionTextKeys(section)
      const items = keys.map((key) => ({ key, language: editLang, value: texts[key] ?? '' }))
      await apiRequest('PUT', '/api/translations/bulk', { items })
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
            ? 'הוספה, הסתרה וסידור מחדש של מקטעי דף הבית. מקטעים "מובנים" עורכים את תוכנם דרך לשוניות תרגומים / עורך ויזואלי.'
            : 'Add, hide, and reorder the sections shown on the home page. "Built-in" sections still get edited via the Translations / Visual Editor tabs.'}
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
          <Button size="sm" onClick={handleSaveOrder} disabled={!dirty || saving} data-testid="button-save-sections">
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? (isHe ? 'שומר...' : 'Saving...') : (isHe ? 'שמירת סדר ומצב' : 'Save Order & Visibility')}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => {
              const legacy = isLegacyType(section.type)
              const expanded = expandedId === section.id
              return (
                <Card key={section.id} className={!section.enabled ? 'opacity-60' : undefined}>
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="flex flex-col">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(index, -1)} disabled={index === 0} data-testid={`button-move-up-${section.id}`}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(index, 1)} disabled={index === sections.length - 1} data-testid={`button-move-down-${section.id}`}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{sectionTypeLabel(section.type, isHe)}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{section.id}</p>
                    </div>
                    <Switch checked={section.enabled} onCheckedChange={() => toggleEnabled(section.id)} data-testid={`switch-enabled-${section.id}`} />
                    {!legacy && (
                      <Button size="icon" variant="ghost" onClick={() => setExpandedId(expanded ? null : section.id)} data-testid={`button-edit-section-${section.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {!legacy && (
                      <Button size="icon" variant="ghost" onClick={() => removeSection(section.id)} data-testid={`button-delete-section-${section.id}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </CardContent>
                  {expanded && !legacy && (
                    <CardContent className="border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between gap-2">
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
                      {renderEditor({
                        section,
                        texts,
                        setText,
                        updateConfig: (config) => updateConfig(section.id, config),
                        isHe,
                      })}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SectionsManager
