import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useLanguage } from '@/hooks/useLanguage'
import { LanguageSelector } from '../LanguageSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, Users, Settings, BarChart3, Globe, Save, Calendar, ClipboardList, Languages, Inbox, Bell } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { ALL_LANGUAGES, type LanguageSettings, type SupportedLanguage, DEFAULT_LANGUAGE_SETTINGS, BILINGUAL_CODES, MULTILINGUAL_CODES } from '@/i18n/config'
import TranslationManager from './TranslationManager'
import QuestionnaireSubmissions from './QuestionnaireSubmissions'
import AppointmentsManager from './AppointmentsManager'
import ClientsManager from './ClientsManager'
import ContactsManager from './ContactsManager'
import EmailNotificationSettings from './EmailNotificationSettings'

const AdminDashboard = () => {
  const { user, signOut } = useAuth()
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const [langSettings, setLangSettings] = useState<LanguageSettings>(DEFAULT_LANGUAGE_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

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
      toast({
        title: isHe ? 'ההגדרות נשמרו' : 'Settings saved',
        description: isHe ? 'הגדרות השפה עודכנו בהצלחה.' : 'Language settings have been updated successfully.'
      })
    } catch (error) {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'שמירת הגדרות השפה נכשלה.' : 'Failed to save language settings.',
        variant: 'destructive'
      })
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

  const tabs = [
    { value: 'overview', icon: BarChart3, he: 'סקירה כללית', en: 'Overview' },
    { value: 'contacts', icon: Inbox, he: 'פניות באתר', en: 'Contacts' },
    { value: 'appointments', icon: Calendar, he: 'פגישות', en: 'Appointments' },
    { value: 'clients', icon: Users, he: 'לקוחות', en: 'Clients' },
    { value: 'questionnaires', icon: ClipboardList, he: 'שאלונים', en: 'Questionnaires' },
    { value: 'translations', icon: Languages, he: 'תרגומים', en: 'Translations' },
    { value: 'settings', icon: Settings, he: 'הגדרות', en: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold">{isHe ? 'לוח בקרה' : 'Admin Dashboard'}</h1>
                <p className="text-sm text-muted-foreground">
                  {isHe ? `ברוך הבא, ${user?.email}` : `Welcome back, ${user?.email}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <LanguageSelector />
              <Button variant="outline" onClick={handleSignOut} data-testid="button-signout">
                <LogOut className="w-4 h-4 mr-2" />
                {isHe ? 'התנתקות' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} dir={isHe ? 'rtl' : 'ltr'}>
          <TabsList className="w-full justify-start gap-1 overflow-x-auto flex-nowrap bg-muted/50 p-1 mb-6 h-auto flex-wrap">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap"
                data-testid={`tab-${tab.value}`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{isHe ? tab.he : tab.en}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveTab('contacts')} data-testid="card-contacts">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{isHe ? 'פניות באתר' : 'Contacts'}</CardTitle>
                  <Inbox className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{isHe ? 'צפייה בפניות מהאתר' : 'View contact submissions'}</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveTab('appointments')} data-testid="card-appointments">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{isHe ? 'פגישות' : 'Appointments'}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{isHe ? 'צפייה וניהול פגישות' : 'View & manage appointments'}</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveTab('clients')} data-testid="card-total-users">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{isHe ? 'לקוחות' : 'Clients'}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{isHe ? 'ניהול לקוחות ופעילויות' : 'Manage clients & activities'}</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveTab('questionnaires')} data-testid="card-questionnaires">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{isHe ? 'שאלונים' : 'Questionnaires'}</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{isHe ? 'צפייה בהגשות שאלונים' : 'View questionnaire submissions'}</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer" onClick={() => setActiveTab('settings')} data-testid="card-settings">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{isHe ? 'הגדרות' : 'Settings'}</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{isHe ? 'שפה והתראות' : 'Language & notifications'}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContactsManager />
              <AppointmentsManager />
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="mt-0">
            <ContactsManager />
          </TabsContent>

          <TabsContent value="appointments" className="mt-0">
            <AppointmentsManager />
          </TabsContent>

          <TabsContent value="clients" className="mt-0">
            <ClientsManager />
          </TabsContent>

          <TabsContent value="questionnaires" className="mt-0">
            <QuestionnaireSubmissions />
          </TabsContent>

          <TabsContent value="translations" className="mt-0">
            <TranslationManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>{isHe ? 'הגדרות שפה' : 'Language Settings'}</CardTitle>
                  </div>
                  <CardDescription>{isHe ? 'שליטה בחוויה הרב-לשונית באתר' : 'Control the multilingual experience on your website'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="multilingual-toggle" className="text-sm font-medium">
                        {isHe ? 'תמיכה רב-לשונית' : 'Multilingual Support'}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {isHe ? 'הצגת בורר שפות באתר' : 'Show the language selector on the website'}
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
                        <Label htmlFor="language-mode" className="text-sm font-medium">
                          {isHe ? 'מצב שפה' : 'Language Mode'}
                        </Label>
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
                              {isHe ? 'דו-לשוני (עברית / אנגלית)' : 'Bilingual (Hebrew / English)'}
                            </SelectItem>
                            <SelectItem value="multilingual" data-testid="option-multilingual">
                              {isHe ? 'רב-לשוני (כל 9 השפות)' : 'Multilingual (All 9 languages)'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="default-language" className="text-sm font-medium">
                          {isHe ? 'שפת ברירת מחדל' : 'Default Language'}
                        </Label>
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
                            ? (isHe ? 'המשתמשים יוכלו לעבור בין עברית לאנגלית.' : 'Users will be able to switch between Hebrew and English.')
                            : (isHe ? 'המשתמשים יוכלו לבחור מתוך 9 שפות: עברית, אנגלית, צרפתית, ספרדית, גרמנית, רוסית, אמהרית, ערבית ויידיש.' : 'Users will be able to choose from 9 languages: Hebrew, English, French, Spanish, German, Russian, Amharic, Arabic, and Yiddish.')}
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
                    {saving
                      ? (isHe ? 'שומר...' : 'Saving...')
                      : (isHe ? 'שמירת הגדרות שפה' : 'Save Language Settings')}
                  </Button>
                </CardContent>
              </Card>

              <EmailNotificationSettings />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default AdminDashboard
