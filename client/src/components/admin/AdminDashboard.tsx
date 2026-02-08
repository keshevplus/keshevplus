import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useLanguage } from '@/hooks/useLanguage'
import { LanguageSelector } from '../LanguageSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogOut, Users, FileText, Settings, BarChart3, Globe, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { ALL_LANGUAGES, type LanguageSettings, type SupportedLanguage, DEFAULT_LANGUAGE_SETTINGS, BILINGUAL_CODES, MULTILINGUAL_CODES } from '@/i18n/config'
import TranslationManager from './TranslationManager'
import QuestionnaireSubmissions from './QuestionnaireSubmissions'

const AdminDashboard = () => {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [langSettings, setLangSettings] = useState<LanguageSettings>(DEFAULT_LANGUAGE_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/settings/language', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setLangSettings(data)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleSaveLanguageSettings = async () => {
    setSaving(true)
    try {
      await apiRequest('PUT', '/api/settings/language', langSettings)
      toast({ title: 'Settings saved', description: 'Language settings have been updated successfully.' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save language settings.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const availableCodes = langSettings.mode === 'bilingual' ? BILINGUAL_CODES : MULTILINGUAL_CODES
  const availableForDefault = ALL_LANGUAGES.filter(l => availableCodes.includes(l.code))

  useEffect(() => {
    if (!availableCodes.includes(langSettings.defaultLanguage)) {
      setLangSettings(prev => ({ ...prev, defaultLanguage: 'he' }))
    }
  }, [langSettings.mode, langSettings.defaultLanguage, availableCodes])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Button variant="outline" onClick={handleSignOut} data-testid="button-signout">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-users">1,234</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-appointments">56</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-revenue">{"\u20aa"}45,231</div>
              <p className="text-xs text-muted-foreground">+8.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-sessions">24</div>
              <p className="text-xs text-muted-foreground">+3 from yesterday</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Language Settings</CardTitle>
              </div>
              <CardDescription>Control the multilingual experience on your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="multilingual-toggle" className="text-sm font-medium">
                    Multilingual Support
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show the language selector on the website
                  </p>
                </div>
                <Switch
                  id="multilingual-toggle"
                  checked={langSettings.enabled}
                  onCheckedChange={(checked) =>
                    setLangSettings(prev => ({ ...prev, enabled: checked }))
                  }
                  data-testid="switch-multilingual"
                />
              </div>

              {langSettings.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="language-mode" className="text-sm font-medium">Language Mode</Label>
                    <Select
                      value={langSettings.mode}
                      onValueChange={(value: 'bilingual' | 'multilingual') =>
                        setLangSettings(prev => ({ ...prev, mode: value }))
                      }
                    >
                      <SelectTrigger id="language-mode" data-testid="select-language-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bilingual" data-testid="option-bilingual">
                          Bilingual (Hebrew / English)
                        </SelectItem>
                        <SelectItem value="multilingual" data-testid="option-multilingual">
                          Multilingual (All 9 languages)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-language" className="text-sm font-medium">Default Language</Label>
                    <Select
                      value={langSettings.defaultLanguage}
                      onValueChange={(value: string) =>
                        setLangSettings(prev => ({ ...prev, defaultLanguage: value as SupportedLanguage }))
                      }
                    >
                      <SelectTrigger id="default-language" data-testid="select-default-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableForDefault.map(lang => (
                          <SelectItem key={lang.code} value={lang.code} data-testid={`option-default-${lang.code}`}>
                            <span className="flex items-center gap-2">
                              <span role="img" aria-hidden="true">{lang.flag}</span>
                              <span>{lang.nativeName}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {langSettings.mode === 'bilingual'
                        ? 'Users will be able to switch between Hebrew and English.'
                        : 'Users will be able to choose from 9 languages: Hebrew, English, French, Spanish, German, Russian, Amharic, Arabic, and Yiddish.'}
                    </p>
                  </div>
                </>
              )}

              <Button
                onClick={handleSaveLanguageSettings}
                disabled={saving || !loaded}
                className="w-full"
                data-testid="button-save-language"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Language Settings'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" data-testid="button-manage-users">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-view-appointments">
                <FileText className="w-4 h-4 mr-2" />
                View Appointments
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-system-settings">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <QuestionnaireSubmissions />
        </div>

        <div className="mt-6">
          <TranslationManager />
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
