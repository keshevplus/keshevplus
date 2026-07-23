import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FlaskConical, RefreshCcw, ShieldAlert, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/useLanguage'
import { apiRequest, queryClient } from '@/lib/queryClient'

const BATCH_SIZE = 2000
const RESET_CONFIRMATION = 'DELETE TEST DATA'

interface LoadTestStats {
  totalSeeded: number
  leadCount: number
  clientCount: number
  oldestCreatedAt: string | null
  newestCreatedAt: string | null
}

interface SyntheticClientSample {
  id: number
  leadNumber: number | null
  clientNumber: number | null
  name: string
  email: string | null
  phone: string | null
  status: 'lead' | 'client' | string
  createdAt: string
}

const emptyStats: LoadTestStats = {
  totalSeeded: 0,
  leadCount: 0,
  clientCount: 0,
  oldestCreatedAt: null,
  newestCreatedAt: null,
}

export default function LoadTestDataSettings() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const [stats, setStats] = useState<LoadTestStats>(emptyStats)
  const [sample, setSample] = useState<SyntheticClientSample[]>([])
  const [target, setTarget] = useState(10000)
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const count = stats.totalSeeded

  const formatDate = (value: string | null) => {
    if (!value) return isHe ? 'אין נתונים' : 'No data'
    return new Intl.DateTimeFormat(isHe ? 'he-IL' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value))
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/seed-load-test-leads/count', { credentials: 'include' })
      if (res.ok) setStats({ ...emptyStats, ...(await res.json()) })
    } catch { /* ignore */ }
  }

  const fetchSample = async () => {
    try {
      const res = await fetch('/api/admin/seed-load-test-leads/sample?limit=8', { credentials: 'include' })
      if (res.ok) setSample(await res.json())
    } catch { /* ignore */ }
  }

  const refreshLoadTestData = () => {
    fetchStats()
    fetchSample()
  }

  useEffect(() => { refreshLoadTestData() }, [])

  const refreshClientLists = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/clients'] })
    queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
  }

  const handleGenerate = async () => {
    setBusy(true)
    setProgress(0)
    try {
      let total = count
      const goal = count + target
      while (total < goal) {
        const batch = Math.min(BATCH_SIZE, goal - total)
        const res = await apiRequest('POST', '/api/admin/seed-load-test-leads', { count: batch })
        const data = await res.json()
        total = data.totalSeeded
        setProgress(total)
        setStats({
          totalSeeded: data.totalSeeded ?? total,
          leadCount: data.leadCount ?? 0,
          clientCount: data.clientCount ?? 0,
          oldestCreatedAt: data.oldestCreatedAt ?? null,
          newestCreatedAt: data.newestCreatedAt ?? null,
        })
      }
      refreshLoadTestData()
      refreshClientLists()
      toast({
        title: isHe ? 'הושלם' : 'Done',
        description: isHe ? `${target} רשומות בדיקה נוצרו.` : `${target} test records generated.`,
      })
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'יצירת נתוני הבדיקה נכשלה.' : 'Failed to generate test data.',
        variant: 'destructive',
      })
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const handleReset = async () => {
    const confirmation = window.prompt(
      isHe
        ? `פעולה זו מוחקת רק נתוני בדיקת עומס שמסומנים כמקור seed_loadtest. כדי לאשר, הקלד: ${RESET_CONFIRMATION}`
        : `This deletes only load-test records tagged source=seed_loadtest. To confirm, type: ${RESET_CONFIRMATION}`
    )

    if (confirmation !== RESET_CONFIRMATION) {
      toast({
        title: isHe ? 'האיפוס בוטל' : 'Reset cancelled',
        description: isHe ? 'לא הוקלד אישור מדויק, ולכן לא נמחקו נתונים.' : 'The confirmation text did not match, so no data was deleted.',
      })
      return
    }

    setBusy(true)
    try {
      const res = await apiRequest('DELETE', '/api/admin/seed-load-test-leads')
      const data = await res.json()
      setStats(emptyStats)
      setSample([])
      refreshClientLists()
      toast({
        title: isHe ? 'האיפוס הושלם' : 'Reset complete',
        description: isHe ? `${data.deleted} רשומות בדיקה נמחקו.` : `${data.deleted} test records removed.`,
      })
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'איפוס נתוני הבדיקה נכשל.' : 'Failed to reset test data.',
        variant: 'destructive',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'נתוני בדיקת עומס' : 'Load Test Data'}</CardTitle>
        </div>
        <CardDescription>
          {isHe
            ? 'יצירה ואיפוס של לידים ולקוחות סינתטיים לבדיקת ביצועים. הרשומות מופרדות מרשימות העבודה הרגילות ומנוהלות כאן בלבד.'
            : 'Generate and reset synthetic leads and clients for performance testing. These records are separated from normal work queues and managed here only.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3" data-testid="text-loadtest-count">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{isHe ? 'סה"כ רשומות בדיקה' : 'Total test records'}</p>
            <p className="text-2xl font-semibold">{count.toLocaleString()}</p>
            {progress !== null && <p className="text-xs text-muted-foreground">{progress.toLocaleString()}...</p>}
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{isHe ? 'לידים' : 'Leads'}</p>
            <p className="text-2xl font-semibold">{stats.leadCount.toLocaleString()}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{isHe ? 'לקוחות' : 'Clients'}</p>
            <p className="text-2xl font-semibold">{stats.clientCount.toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              {isHe
                ? 'נתוני בדיקת עומס לא יופיעו ברשימות הלידים והלקוחות האמיתיות. השתמש בטבלה כאן כדי לוודא שהם נוצרים ונמחקים.'
                : 'Load-test data will not appear in real lead and client lists. Use the table here to verify that records are being created and removed.'}
            </p>
          </div>
        </div>
        <div className="flex items-end gap-2 flex-wrap">
          <div className="space-y-1.5">
            <Label htmlFor="loadtest-target" className="text-xs">{isHe ? 'כמות להוספה' : 'Amount to add'}</Label>
            <Input
              id="loadtest-target"
              type="number"
              min={1}
              max={200000}
              value={target}
              onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 0))}
              className="w-32"
              data-testid="input-loadtest-target"
            />
          </div>
          <Button onClick={handleGenerate} disabled={busy} data-testid="button-generate-loadtest">
            {busy && progress !== null
              ? (isHe ? 'יוצר...' : 'Generating...')
              : (isHe ? 'יצירת נתוני בדיקה' : 'Generate Test Data')}
          </Button>
          <Button variant="outline" onClick={refreshLoadTestData} disabled={busy} data-testid="button-refresh-loadtest">
            <RefreshCcw className="h-4 w-4 mr-1.5" />
            {isHe ? 'רענון' : 'Refresh'}
          </Button>
          <Button variant="destructive" onClick={handleReset} disabled={busy || count === 0} data-testid="button-reset-loadtest">
            <Trash2 className="h-4 w-4 mr-1.5" />
            {isHe ? 'איפוס הכל' : 'Reset All'}
          </Button>
        </div>
        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <p>{isHe ? 'רשומה ראשונה:' : 'Oldest record:'} {formatDate(stats.oldestCreatedAt)}</p>
          <p>{isHe ? 'רשומה אחרונה:' : 'Newest record:'} {formatDate(stats.newestCreatedAt)}</p>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{isHe ? 'שם' : 'Name'}</th>
                <th className="px-3 py-2 text-start font-medium">{isHe ? 'סטטוס' : 'Status'}</th>
                <th className="px-3 py-2 text-start font-medium">{isHe ? 'מספר ליד' : 'Lead #'}</th>
                <th className="px-3 py-2 text-start font-medium">{isHe ? 'טלפון' : 'Phone'}</th>
                <th className="px-3 py-2 text-start font-medium">{isHe ? 'נוצר' : 'Created'}</th>
              </tr>
            </thead>
            <tbody>
              {sample.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-center text-muted-foreground" colSpan={5}>
                    {isHe ? 'אין נתוני בדיקה להצגה.' : 'No test data to display.'}
                  </td>
                </tr>
              ) : sample.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.status === 'client' ? (isHe ? 'לקוח' : 'Client') : (isHe ? 'ליד' : 'Lead')}</td>
                  <td className="px-3 py-2">{item.leadNumber ?? '-'}</td>
                  <td className="px-3 py-2">{item.phone ?? '-'}</td>
                  <td className="px-3 py-2">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
