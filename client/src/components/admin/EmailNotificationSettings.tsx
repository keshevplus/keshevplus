import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, Save, Mail, Calendar, ClipboardList } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'

interface NotifSettings {
  contactForm: boolean
  appointments: boolean
  questionnaires: boolean
}

export default function EmailNotificationSettings() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const [settings, setSettings] = useState<NotifSettings>({
    contactForm: true,
    appointments: true,
    questionnaires: true,
  })
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/settings/email-notifications', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setSettings(data)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiRequest('PUT', '/api/settings/email-notifications', settings)
      toast({
        title: isHe ? 'ההגדרות נשמרו' : 'Settings saved',
        description: isHe ? 'הגדרות התראות האימייל עודכנו.' : 'Email notification settings updated.',
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

  const items = [
    {
      key: 'contactForm' as const,
      icon: Mail,
      he: 'פניות מטופס יצירת קשר',
      en: 'Contact form submissions',
      descHe: 'קבלת אימייל כאשר מישהו שולח פנייה מהאתר',
      descEn: 'Receive email when someone submits the contact form',
    },
    {
      key: 'appointments' as const,
      icon: Calendar,
      he: 'פגישות חדשות',
      en: 'New appointments',
      descHe: 'קבלת אימייל כאשר נקבעת פגישה חדשה',
      descEn: 'Receive email when a new appointment is scheduled',
    },
    {
      key: 'questionnaires' as const,
      icon: ClipboardList,
      he: 'שאלונים שהוגשו',
      en: 'Questionnaire submissions',
      descHe: 'קבלת אימייל כאשר מישהו ממלא שאלון',
      descEn: 'Receive email when someone fills out a questionnaire',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'התראות אימייל' : 'Email Notifications'}</CardTitle>
        </div>
        <CardDescription>
          {isHe ? 'בחרו אילו התראות תקבלו למייל' : 'Choose which notifications to receive by email'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between gap-4 p-3 rounded-md border">
            <div className="flex items-center gap-3 min-w-0">
              <item.icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <Label htmlFor={`notif-${item.key}`} className="text-sm font-medium cursor-pointer">
                  {isHe ? item.he : item.en}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isHe ? item.descHe : item.descEn}
                </p>
              </div>
            </div>
            <Switch
              id={`notif-${item.key}`}
              checked={settings[item.key]}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, [item.key]: checked }))
              }
              data-testid={`switch-notif-${item.key}`}
            />
          </div>
        ))}

        <Button
          onClick={handleSave}
          disabled={saving || !loaded}
          className="w-full"
          data-testid="button-save-notifications"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving
            ? (isHe ? 'שומר...' : 'Saving...')
            : (isHe ? 'שמירת הגדרות התראות' : 'Save Notification Settings')}
        </Button>
      </CardContent>
    </Card>
  )
}
