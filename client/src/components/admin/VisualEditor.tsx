import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/hooks/useLanguage'
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
  X,
  Type,
  MousePointer,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { ViewportSwitcher, DeviceFrame, type PreviewViewport } from './DevicePreviewFrame'
import { useInlineTextEditor } from '@/hooks/useInlineTextEditor'

const languageCodeClass = "inline-flex w-6 shrink-0 justify-center font-sans text-sm font-semibold leading-none text-muted-foreground"
const languageNameClass = "font-sans text-sm leading-none"

export default function VisualEditor() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [editLang, setEditLang] = useState<SupportedLanguage>(language)
  const [viewport, setViewport] = useState<PreviewViewport>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const {
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
  } = useInlineTextEditor(iframeRef, editLang, isHe)

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

  const handleIframeLoad = () => {
    onIframeLoad()

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
    `
    doc.head.appendChild(hideAdmin)
  }

  // Computed once (not on every render) — the query string only needs to
  // change when we explicitly want a reload, which handleSaveAll already
  // does by reassigning iframeRef.current.src directly. Recomputing this on
  // every render (the previous bug) made React treat the iframe's `src` as
  // changed on nearly every interaction, reloading it mid-edit.
  const [iframeSrc] = useState(() => `/?visualEditor=true&_t=${Date.now()}`)

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
                        <span className={languageCodeClass} aria-hidden="true">{lang.flag}</span>
                        <span className={languageNameClass}>{lang.nativeName}</span>
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
              <ViewportSwitcher viewport={viewport} onChange={setViewport} isHe={isHe} />

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

          <div className={cn("rounded-md overflow-hidden", isFullscreen && "flex-1")}>
            <DeviceFrame
              viewport={viewport}
              iframeRef={iframeRef}
              src={iframeSrc}
              onLoad={handleIframeLoad}
              title={isHe ? 'תצוגה מקדימה של האתר' : 'Site preview'}
              maxWidth={isFullscreen ? 1400 : 880}
              maxHeight={isFullscreen ? 900 : 560}
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
