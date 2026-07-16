import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { APPOINTMENT_TYPES, APPOINTMENT_TIME_SLOTS, type AppointmentTypeHoursConfig } from '@/lib/appointmentAvailability'

const DEFAULT_START = APPOINTMENT_TIME_SLOTS[0]
const DEFAULT_END = "19:00"
const END_TIME_OPTIONS = [...APPOINTMENT_TIME_SLOTS.slice(1), "19:00"]

export default function AppointmentHoursSettings() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const [config, setConfig] = useState<AppointmentTypeHoursConfig>({})
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/appointment-type-hours', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setConfig(data) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiRequest('PUT', '/api/appointment-type-hours', config)
      toast({
        title: isHe ? 'ההגדרות נשמרו' : 'Settings saved',
        description: isHe ? 'שעות הפגישות לפי סוג עודכנו.' : 'Appointment hours by type have been updated.',
      })
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'שמירת ההגדרות נכשלה.' : 'Failed to save settings.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateType = (value: string, field: 'startTime' | 'endTime', time: string) => {
    setConfig(prev => ({
      ...prev,
      [value]: {
        startTime: field === 'startTime' ? time : (prev[value]?.startTime ?? DEFAULT_START),
        endTime: field === 'endTime' ? time : (prev[value]?.endTime ?? DEFAULT_END),
      },
    }))
  }

  const resetType = (value: string) => {
    setConfig(prev => {
      const next = { ...prev }
      delete next[value]
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'שעות פגישות לפי סוג' : 'Appointment Hours by Type'}</CardTitle>
        </div>
        <CardDescription>
          {isHe
            ? 'הגבילו שעות זמינות לסוגי פגישות ספציפיים, לדוגמה בדיקות MOXO בבוקר בלבד ואבחונים אחר הצהריים בלבד'
            : 'Restrict available hours for specific appointment types, e.g. MOXO tests mornings only, diagnoses afternoons only'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {APPOINTMENT_TYPES.map(type => {
          const hours = config[type.value]
          return (
            <div key={type.value} className="flex items-center justify-between gap-4 p-3 rounded-md border flex-wrap" data-testid={`row-hours-${type.value}`}>
              <div className="min-w-0">
                <Label className="text-sm font-medium">{isHe ? type.he : type.en}</Label>
                <p className="text-xs text-muted-foreground">
                  {hours
                    ? (isHe ? 'שעות מותאמות' : 'Custom hours')
                    : (isHe ? `ברירת מחדל (${DEFAULT_START}-${DEFAULT_END})` : `Default (${DEFAULT_START}-${DEFAULT_END})`)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={hours?.startTime ?? DEFAULT_START}
                  onValueChange={(time) => updateType(type.value, 'startTime', time)}
                >
                  <SelectTrigger className="h-8 text-xs w-[90px]" data-testid={`select-start-${type.value}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TIME_SLOTS.map(slot => (
                      <SelectItem key={slot} value={slot} className="text-xs">{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-xs">{isHe ? 'עד' : 'to'}</span>
                <Select
                  value={hours?.endTime ?? DEFAULT_END}
                  onValueChange={(time) => updateType(type.value, 'endTime', time)}
                >
                  <SelectTrigger className="h-8 text-xs w-[90px]" data-testid={`select-end-${type.value}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {END_TIME_OPTIONS.map(slot => (
                      <SelectItem key={slot} value={slot} className="text-xs">{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hours && (
                  <Button size="sm" variant="ghost" onClick={() => resetType(type.value)} data-testid={`button-reset-${type.value}`}>
                    {isHe ? 'איפוס' : 'Reset'}
                  </Button>
                )}
              </div>
            </div>
          )
        })}

        <Button
          onClick={handleSave}
          disabled={saving || !loaded}
          className="w-full"
          data-testid="button-save-appointment-hours"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving
            ? (isHe ? 'שומר...' : 'Saving...')
            : (isHe ? 'שמירת שעות פגישות' : 'Save Appointment Hours')}
        </Button>
      </CardContent>
    </Card>
  )
}
