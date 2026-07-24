import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { MessageSquare, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'

export default function ContactFormSettings() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const [requireMessage, setRequireMessage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/settings/contact-form', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data.requireMessage === 'boolean') setRequireMessage(data.requireMessage)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiRequest('PUT', '/api/settings/contact-form', { requireMessage })
      toast({
        title: isHe ? 'ההגדרות נשמרו' : 'Settings saved',
        description: isHe ? 'הגדרות טופס יצירת הקשר עודכנו.' : 'Contact form settings updated.',
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'טופס יצירת קשר' : 'Contact Form'}</CardTitle>
        </div>
        <CardDescription>
          {isHe ? 'שליטה האם הודעת הטקסט בטופס יצירת הקשר היא שדה חובה.' : 'Control whether the contact form message field is required.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 p-3 rounded-md border">
          <div className="min-w-0">
            <Label htmlFor="contact-require-message" className="text-sm font-medium cursor-pointer">
              {isHe ? 'דרוש הודעה' : 'Require message'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isHe ? 'כאשר מופעל, מבקרים חייבים למלא את תיבת ההודעה לפני שליחת הטופס.' : 'When enabled, visitors must fill in the message box before submitting the form.'}
            </p>
          </div>
          <Switch
            id="contact-require-message"
            checked={requireMessage}
            onCheckedChange={setRequireMessage}
            data-testid="switch-require-message"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !loaded}
          className="w-full"
          data-testid="button-save-contact-form-settings"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving
            ? (isHe ? 'שומר...' : 'Saving...')
            : (isHe ? 'שמירת הגדרות טופס' : 'Save Contact Form Settings')}
        </Button>
      </CardContent>
    </Card>
  )
}
