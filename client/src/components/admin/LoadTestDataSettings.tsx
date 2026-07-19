import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FlaskConical, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/useLanguage'
import { apiRequest, queryClient } from '@/lib/queryClient'

const BATCH_SIZE = 2000

export default function LoadTestDataSettings() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const [count, setCount] = useState(0)
  const [target, setTarget] = useState(10000)
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const fetchCount = async () => {
    try {
      const res = await fetch('/api/admin/seed-load-test-leads/count', { credentials: 'include' })
      if (res.ok) setCount((await res.json()).totalSeeded)
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchCount() }, [])

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
        setCount(total)
      }
      refreshClientLists()
      toast({
        title: isHe ? 'הושלם' : 'Done',
        description: isHe ? `${target} לידים לבדיקה נוצרו.` : `${target} test leads generated.`,
      })
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'יצירת לידים לבדיקה נכשלה.' : 'Failed to generate test leads.',
        variant: 'destructive',
      })
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const handleReset = async () => {
    setBusy(true)
    try {
      const res = await apiRequest('DELETE', '/api/admin/seed-load-test-leads')
      const data = await res.json()
      setCount(0)
      refreshClientLists()
      toast({
        title: isHe ? 'אופס בהצלחה' : 'Reset complete',
        description: isHe ? `${data.deleted} לידים לבדיקה נמחקו.` : `${data.deleted} test leads removed.`,
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
            ? 'יצירה ואיפוס של לידים סינתטיים לבדיקת ביצועים. כל הרשומות מסומנות ואינן משפיעות על נתונים אמיתיים.'
            : 'Generate and reset synthetic leads for performance testing. All records are tagged and never touch real data.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" data-testid="text-loadtest-count">
          {isHe ? `לידים סינתטיים כרגע: ${count.toLocaleString()}` : `Current synthetic leads: ${count.toLocaleString()}`}
          {progress !== null && ` (${progress.toLocaleString()}...)`}
        </p>
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
              : (isHe ? 'יצירת לידים' : 'Generate Leads')}
          </Button>
          <Button variant="destructive" onClick={handleReset} disabled={busy || count === 0} data-testid="button-reset-loadtest">
            <Trash2 className="h-4 w-4 mr-1.5" />
            {isHe ? 'איפוס הכל' : 'Reset All'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
