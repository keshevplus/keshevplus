import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database, Search, Save, Trash2, Upload, Languages, ChevronLeft, ChevronRight, Pencil, X, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { ALL_LANGUAGES, type SupportedLanguage } from '@/i18n/config'
import { invalidateTranslationCache, useLanguage } from '@/hooks/useLanguage'

const PAGE_SIZE = 20

interface TranslationRow {
  key: string
  translations: Record<string, string>
}

const TranslationManager = () => {
  const { toast } = useToast()
  const { language } = useLanguage()
  const isHe = language === 'he'
  const [allTranslations, setAllTranslations] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLang, setFilterLang] = useState<string>('all')
  const [filterSection, setFilterSection] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [editingCell, setEditingCell] = useState<{ key: string; lang: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [savingCell, setSavingCell] = useState(false)

  const fetchTranslations = useCallback(async () => {
    try {
      const res = await fetch('/api/translations', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAllTranslations(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTranslations()
  }, [fetchTranslations])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await apiRequest('POST', '/api/translations/seed')
      const data = await res.json()
      toast({
        title: isHe ? 'תרגומים נטענו' : 'Translations seeded',
        description: isHe ? `${data.seeded} רשומות תרגום נטענו למסד הנתונים.` : `${data.seeded} translation entries loaded into the database.`
      })
      invalidateTranslationCache()
      await fetchTranslations()
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'טעינת תרגומים נכשלה.' : 'Failed to seed translations.',
        variant: 'destructive'
      })
    } finally {
      setSeeding(false)
    }
  }

  const rows = useMemo((): TranslationRow[] => {
    return Object.entries(allTranslations).map(([key, langs]) => ({
      key,
      translations: langs,
    }))
  }, [allTranslations])

  const sections = useMemo(() => {
    const s = new Set<string>()
    rows.forEach(r => {
      const dot = r.key.indexOf('.')
      if (dot > 0) s.add(r.key.substring(0, dot))
    })
    return Array.from(s).sort()
  }, [rows])

  const filteredRows = useMemo(() => {
    let result = rows
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(r =>
        r.key.toLowerCase().includes(q) ||
        Object.values(r.translations).some(v => v.toLowerCase().includes(q))
      )
    }
    if (filterSection !== 'all') {
      result = result.filter(r => r.key.startsWith(filterSection + '.'))
    }
    if (filterLang !== 'all') {
      result = result.filter(r => r.translations[filterLang])
    }
    return result
  }, [rows, searchQuery, filterSection, filterLang])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const pageRows = filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  useEffect(() => {
    setPage(0)
  }, [searchQuery, filterSection, filterLang])

  const visibleLangs: SupportedLanguage[] = filterLang === 'all'
    ? ALL_LANGUAGES.map(l => l.code)
    : [filterLang as SupportedLanguage]

  const startEdit = (key: string, lang: string, currentValue: string) => {
    setEditingCell({ key, lang })
    setEditValue(currentValue || '')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const saveEdit = async () => {
    if (!editingCell) return
    setSavingCell(true)
    try {
      await apiRequest('PUT', '/api/translations', {
        key: editingCell.key,
        language: editingCell.lang,
        value: editValue,
      })
      setAllTranslations(prev => ({
        ...prev,
        [editingCell.key]: {
          ...prev[editingCell.key],
          [editingCell.lang]: editValue,
        },
      }))
      invalidateTranslationCache(editingCell.lang)
      setEditingCell(null)
      setEditValue('')
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'שמירת התרגום נכשלה.' : 'Failed to save translation.',
        variant: 'destructive'
      })
    } finally {
      setSavingCell(false)
    }
  }

  const handleDeleteKey = async (key: string) => {
    try {
      await apiRequest('DELETE', `/api/translations/${encodeURIComponent(key)}`)
      setAllTranslations(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      invalidateTranslationCache()
      toast({
        title: isHe ? 'נמחק' : 'Deleted',
        description: isHe ? `מפתח תרגום "${key}" הוסר.` : `Translation key "${key}" removed.`
      })
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'מחיקת מפתח התרגום נכשלה.' : 'Failed to delete translation key.',
        variant: 'destructive'
      })
    }
  }

  const totalKeys = rows.length
  const isEmpty = totalKeys === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'ניהול תרגומים' : 'Translation Manager'}</CardTitle>
        </div>
        <CardDescription>
          {isHe
            ? `ניהול כל תרגומי האתר ממסד הנתונים (${totalKeys} מפתחות)`
            : `Manage all website translations from the database (${totalKeys} keys)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEmpty && !loading && (
          <div className="rounded-md bg-muted/50 p-4 text-center space-y-3">
            <Database className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isHe
                ? 'אין תרגומים במסד הנתונים עדיין. טענו אותם מקבצי השפה המובנים כדי להתחיל.'
                : 'No translations in the database yet. Seed them from the built-in locale files to get started.'}
            </p>
            <Button onClick={handleSeed} disabled={seeding} data-testid="button-seed-translations">
              <Upload className="w-4 h-4 mr-2" />
              {seeding
                ? (isHe ? 'טוען...' : 'Seeding...')
                : (isHe ? 'טעינת תרגומים מקבצי שפה' : 'Seed Translations from Locale Files')}
            </Button>
          </div>
        )}

        {!isEmpty && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="search-translations" className="sr-only">
                  {isHe ? 'חיפוש' : 'Search'}
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-translations"
                    placeholder={isHe ? 'חיפוש מפתחות או ערכים...' : 'Search keys or values...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-translations"
                  />
                </div>
              </div>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger className="w-full sm:w-40" data-testid="select-filter-section">
                  <SelectValue placeholder={isHe ? 'מקטע' : 'Section'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isHe ? 'כל המקטעים' : 'All Sections'}</SelectItem>
                  {sections.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLang} onValueChange={setFilterLang}>
                <SelectTrigger className="w-full sm:w-40" data-testid="select-filter-lang">
                  <SelectValue placeholder={isHe ? 'שפה' : 'Language'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isHe ? 'כל השפות' : 'All Languages'}</SelectItem>
                  {ALL_LANGUAGES.map(l => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.flag} {l.nativeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground">
                {isHe
                  ? `מציג ${filteredRows.length} מתוך ${totalKeys} מפתחות`
                  : `Showing ${filteredRows.length} of ${totalKeys} keys`}
              </p>
              <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding} data-testid="button-reseed">
                <Upload className="w-3 h-3 mr-1" />
                {seeding
                  ? (isHe ? 'טוען...' : 'Seeding...')
                  : (isHe ? 'טעינה מחדש מקבצים' : 'Re-seed from Files')}
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-2 font-medium min-w-[200px]">{isHe ? 'מפתח' : 'Key'}</th>
                    {visibleLangs.map(lang => {
                      const info = ALL_LANGUAGES.find(l => l.code === lang)
                      return (
                        <th key={lang} className="text-left p-2 font-medium min-w-[200px]">
                          {info?.flag} {info?.nativeName || lang}
                        </th>
                      )
                    })}
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map(row => (
                    <tr key={row.key} className="border-b last:border-b-0">
                      <td className="p-2 font-mono text-xs text-muted-foreground break-all" data-testid={`text-key-${row.key}`}>
                        {row.key}
                      </td>
                      {visibleLangs.map(lang => {
                        const isEditing = editingCell?.key === row.key && editingCell?.lang === lang
                        const val = row.translations[lang] || ''
                        return (
                          <td key={lang} className="p-2">
                            {isEditing ? (
                              <div className="flex flex-col gap-1">
                                <Textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="text-xs min-h-[60px]"
                                  autoFocus
                                  data-testid={`textarea-edit-${row.key}-${lang}`}
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" onClick={saveEdit} disabled={savingCell} data-testid={`button-save-${row.key}-${lang}`}>
                                    <Check className="w-3 h-3 mr-1" />
                                    {savingCell ? '...' : (isHe ? 'שמור' : 'Save')}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEdit} data-testid={`button-cancel-${row.key}-${lang}`}>
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="group cursor-pointer rounded p-1 hover-elevate min-h-[24px]"
                                onClick={() => startEdit(row.key, lang, val)}
                                data-testid={`cell-${row.key}-${lang}`}
                              >
                                <span className="text-xs break-words">
                                  {val || <span className="text-muted-foreground italic">{isHe ? 'ריק' : 'empty'}</span>}
                                </span>
                                <Pencil className="w-3 h-3 text-muted-foreground invisible group-hover:visible inline ml-1" />
                              </div>
                            )}
                          </td>
                        )
                      })}
                      <td className="p-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteKey(row.key)}
                          data-testid={`button-delete-${row.key}`}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={visibleLangs.length + 2} className="p-6 text-center text-muted-foreground text-sm">
                        {isHe ? 'אין תרגומים התואמים את הסינון' : 'No translations match your filters'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {isHe ? `עמוד ${page + 1} מתוך ${totalPages}` : `Page ${page + 1} of ${totalPages}`}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TranslationManager
