import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useLanguage } from '@/hooks/useLanguage'
import { LanguageSelector } from '../LanguageSelector'
import { ThemeToggle } from '../ThemeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { LogOut, Users, Settings, BarChart3, Globe, Save, Calendar, ClipboardList, Languages, Inbox, Bell, MessageCircle, Eye, Phone, UserCog, Archive } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { ALL_LANGUAGES, type LanguageSettings, type SupportedLanguage, DEFAULT_LANGUAGE_SETTINGS, BILINGUAL_CODES, getEnabledLanguageCodes } from '@/i18n/config'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import type { WidgetSettings } from '@shared/schema'
import TranslationManager from './TranslationManager'
import QuestionnaireSubmissions from './QuestionnaireSubmissions'
import AppointmentsManager from './AppointmentsManager'
import ClientsManager from './ClientsManager'
import ContactsManager from './ContactsManager'
import ConversationsManager from './ConversationsManager'
import EmailNotificationSettings from './EmailNotificationSettings'
import ChangePasswordSettings from './ChangePasswordSettings'
import UsersManager from './UsersManager'
import BinManager from './BinManager'
import VisualEditor from './VisualEditor'
import WhatsAppManager from './WhatsAppManager'
import OverviewWidgetGrid from './OverviewWidgetGrid'

const languageCodeClass = "inline-flex w-6 shrink-0 justify-center font-sans text-sm font-semibold leading-none text-muted-foreground"
const languageNameClass = "font-sans text-sm leading-none"

type FilterableTab = 'contacts' | 'appointments' | 'conversations' | 'questionnaires'

const isFilterableTab = (tab: string): tab is FilterableTab =>
  tab === 'contacts' || tab === 'appointments' || tab === 'conversations' || tab === 'questionnaires'

const fetchAdminBadges = async () => {
  const res = await apiRequest('GET', '/api/admin/badge-counts')
  return res.json()
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth()
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const [langSettings, setLangSettings] = useState<LanguageSettings>(DEFAULT_LANGUAGE_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [focusedClientId, setFocusedClientId] = useState<number | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [tabInitialFilters, setTabInitialFilters] = useState<
    Partial<Record<FilterableTab, 'all' | 'new'>>
  >({})

  interface BadgeCounts {
    unreadContacts: number
    pendingAppointments: number
    unreviewedQuestionnaires: number
    unreviewedConversations: number
    newLeads: number
    newLeadItems: Array<{
      id: number
      name: string
      email: string | null
      phone: string | null
      leadNumber: number | null
    }>
  }

  const { data: badgeCounts } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: fetchAdminBadges,
    refetchInterval: 15000, // keep header in sync
    refetchOnWindowFocus: true,
  })

  const leadBadgeCount = badgeCounts?.newLeads ?? 0
  const newLeadItems = badgeCounts?.newLeadItems ?? []
  const openLead = (clientId: number) => {
    setFocusedClientId(clientId)
    setActiveTab('clients')
  }

  const openFromNotification = (tab: FilterableTab) => {
    setTabInitialFilters(prev => ({ ...prev, [tab]: 'new' }))
    setActiveTab(tab)
    setNotificationsOpen(false)
  }

  const tabBadgeMap: Record<string, number> = {
    contacts: badgeCounts?.unreadContacts ?? 0,
    appointments: badgeCounts?.pendingAppointments ?? 0,
    clients: leadBadgeCount,
    conversations: badgeCounts?.unreviewedConversations ?? 0,
    questionnaires: badgeCounts?.unreviewedQuestionnaires ?? 0,
  }

  const totalBadges = (badgeCounts?.unreadContacts ?? 0)
    + (badgeCounts?.pendingAppointments ?? 0)
    + (badgeCounts?.unreviewedConversations ?? 0)
    + (badgeCounts?.unreviewedQuestionnaires ?? 0)
    + (badgeCounts?.newLeads ?? 0)

  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({ showChat: true, showAccessibility: true, showWhatsApp: true })

  useEffect(() => {
    fetch('/api/settings/widgets')
      .then(res => res.json())
      .then(data => setWidgetSettings(data))
      .catch(() => {})
  }, [])

  const handleSaveWidgetSettings = async () => {
    try {
      await apiRequest('PUT', '/api/settings/widgets', widgetSettings)
      toast({ title: isHe ? 'ההגדרות נשמרו' : 'Settings saved' })
    } catch {
      toast({ title: isHe ? 'שגיאה' : 'Error', variant: 'destructive' })
    }
  }

  useEffect(() => {
    fetch('/api/settings/language', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const enabledLanguages = getEnabledLanguageCodes(data)
          const defaultLanguage = enabledLanguages.includes(data.defaultLanguage)
            ? data.defaultLanguage
            : enabledLanguages[0]
          setLangSettings({ ...DEFAULT_LANGUAGE_SETTINGS, ...data, enabledLanguages, defaultLanguage })
        }
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
      const enabledLanguages = getEnabledLanguageCodes(langSettings)
      const payload: LanguageSettings = {
        ...langSettings,
        enabledLanguages,
        mode: isBilingualSelection(enabledLanguages) ? 'bilingual' : 'multilingual',
        defaultLanguage: enabledLanguages.includes(langSettings.defaultLanguage)
          ? langSettings.defaultLanguage
          : enabledLanguages[0],
      }
      await apiRequest('PUT', '/api/settings/language', payload)
      setLangSettings(payload)
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

  const availableCodes = getEnabledLanguageCodes(langSettings)
  const availableForDefault = ALL_LANGUAGES.filter(l => availableCodes.includes(l.code))

  useEffect(() => {
    if (!availableCodes.includes(langSettings.defaultLanguage)) {
      setLangSettings(prev => ({ ...prev, defaultLanguage: availableCodes[0] ?? 'he' }))
    }
  }, [langSettings.defaultLanguage, availableCodes])

  const handleToggleDisplayLanguage = (code: SupportedLanguage, checked: boolean) => {
    setLangSettings(prev => {
      const current = getEnabledLanguageCodes(prev)
      const next = checked
        ? Array.from(new Set([...current, code]))
        : current.filter(item => item !== code)

      if (!next.length) return prev

      return {
        ...prev,
        enabledLanguages: next,
        mode: isBilingualSelection(next) ? 'bilingual' : 'multilingual',
        defaultLanguage: next.includes(prev.defaultLanguage) ? prev.defaultLanguage : next[0],
      }
    })
  }

  const isBilingualSelection = (codes: SupportedLanguage[]) => {
    return codes.length === BILINGUAL_CODES.length && BILINGUAL_CODES.every(code => codes.includes(code))
  }

  const tabs = [
    { value: 'overview', icon: BarChart3, he: 'סקירה כללית', en: 'Overview', heDesc: '', enDesc: '' },
    { value: 'contacts', icon: Inbox, he: 'פניות באתר', en: 'Contacts', heDesc: 'צפייה בפניות מהאתר', enDesc: 'View contact submissions' },
    { value: 'appointments', icon: Calendar, he: 'פגישות', en: 'Appointments', heDesc: 'צפייה וניהול פגישות', enDesc: 'View & manage appointments' },
    { value: 'clients', icon: Users, he: 'לידים ולקוחות', en: 'Leads & Clients', heDesc: 'ניהול לידים ולקוחות', enDesc: 'Manage leads & clients' },
    { value: 'conversations', icon: MessageCircle, he: 'שיחות צ׳אט', en: 'Conversations', heDesc: 'צפייה בשיחות צ׳אט', enDesc: 'View chat conversations' },
    { value: 'whatsapp', icon: Phone, he: 'וואטסאפ', en: 'WhatsApp', heDesc: 'צפייה בשיחות וואטסאפ', enDesc: 'View WhatsApp conversations' },
    { value: 'questionnaires', icon: ClipboardList, he: 'שאלונים', en: 'Questionnaires', heDesc: 'צפייה בהגשות שאלונים', enDesc: 'View questionnaire submissions' },
    { value: 'visual-editor', icon: Eye, he: 'עורך ויזואלי', en: 'Visual Editor', heDesc: 'עריכת תוכן העמודים באתר', enDesc: 'Edit site page content visually' },
    { value: 'translations', icon: Languages, he: 'תרגומים', en: 'Translations', heDesc: 'ניהול תרגומים לאתר', enDesc: 'Manage site translations' },
    { value: 'settings', icon: Settings, he: 'הגדרות', en: 'Settings', heDesc: 'שפה והתראות', enDesc: 'Language & notifications' },
    ...(user?.email === 'dr@keshevplus.co.il'
      ? [
          { value: 'users', icon: UserCog, he: 'משתמשים', en: 'Users', heDesc: 'ניהול משתמשי מערכת', enDesc: 'Manage system users' },
          { value: 'bin', icon: Archive, he: 'סל מיחזור', en: 'Recycle Bin', heDesc: 'פריטים שנמחקו', enDesc: 'Deleted items' },
        ]
      : []),
  ]

  const overviewWidgets = tabs.filter(tab => !['overview', 'users', 'bin'].includes(tab.value))

  const previousTabRef = useRef(activeTab)

  useEffect(() => {
    const prevTab = previousTabRef.current

    if (prevTab !== activeTab && isFilterableTab(prevTab)) {
      setTabInitialFilters((prev) => {
        if (prev[prevTab] !== 'new') return prev
        return { ...prev, [prevTab]: 'all' }
      })
    }

    previousTabRef.current = activeTab
  }, [activeTab])

  return (
    <SidebarProvider defaultOpen={false} className="bg-gradient-to-br from-background to-muted/20">
      <Sidebar collapsible="icon" data-testid="admin-sidebar">
        <SidebarHeader className="flex flex-row items-center justify-between gap-2">
          <span className="px-1 text-sm font-semibold truncate group-data-[collapsible=icon]:hidden">
            {isHe ? 'קשב פלוס' : 'KeshevPlus'}
          </span>
          <SidebarTrigger data-testid="button-sidebar-toggle" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {tabs.map(tab => {
              const count = tabBadgeMap[tab.value] ?? 0
              return (
                <SidebarMenuItem key={tab.value} className="relative">
                  <SidebarMenuButton
                    isActive={activeTab === tab.value}
                    tooltip={isHe ? tab.he : tab.en}
                    onClick={() => setActiveTab(tab.value)}
                    data-testid={`tab-${tab.value}`}
                  >
                    <span className="relative inline-flex shrink-0">
                      <tab.icon className="h-4 w-4" />
                      {count > 0 && tab.value !== 'clients' && (
                        <span
                          className="absolute -top-1.5 -end-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-medium leading-none text-destructive-foreground"
                          data-testid={`badge-tab-${tab.value}`}
                        >
                          {count > 9 ? '9+' : count}
                        </span>
                      )}
                    </span>
                    <span>{isHe ? tab.he : tab.en}</span>
                  </SidebarMenuButton>
                  {tab.value === 'clients' && count > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute -top-1 end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-0.5 text-[9px] font-medium leading-none text-white"
                          data-testid={`badge-tab-${tab.value}`}
                        >
                          {count > 9 ? '9+' : count}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" side="right" align="start">
                        <p className="text-sm font-semibold mb-2">{isHe ? 'לידים ולקוחות' : 'Leads & Clients'}</p>
                        <div className="space-y-1.5">
                          {newLeadItems.map((lead) => (
                            <button
                              key={lead.id}
                              type="button"
                              className="w-full rounded-md border p-2 text-start transition hover:bg-muted"
                              onClick={() => openLead(lead.id)}
                            >
                              <span className="block text-sm font-medium">#{lead.leadNumber ?? lead.id} {lead.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">{lead.email || lead.phone || ''}</span>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:h-16 sm:py-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" data-testid="button-mobile-menu" />
              <div>
                <h1 className="text-xl font-semibold">{isHe ? 'לוח בקרה' : 'Admin Dashboard'}</h1>
                <p className="text-sm text-muted-foreground">
                  {isHe ? `ברוך הבא, ${user?.email}` : `Welcome back, ${user?.email}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 rounded-full border border-transparent bg-muted/70 px-2 py-1 text-sm transition hover:bg-muted">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={totalBadges > 0 ? 'destructive' : 'outline'}
                      className={totalBadges === 0 ? 'border-destructive/40 text-destructive' : ''}
                    >
                      {totalBadges}
                    </Badge>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-72">
                  <p className="text-sm font-semibold mb-2">{isHe ? 'התראות' : 'Notifications'}</p>
                  <ul className="space-y-1.5 text-sm">
                    <li>
                      <button
                        type="button"
                        onClick={() => openFromNotification('contacts')}
                        disabled={(badgeCounts?.unreadContacts ?? 0) === 0}
                        className="w-full rounded-md border p-2 text-start transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isHe ? `פניות חדשות: ${badgeCounts?.unreadContacts ?? 0}` : `New contacts: ${badgeCounts?.unreadContacts ?? 0}`}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => openFromNotification('appointments')}
                        disabled={(badgeCounts?.pendingAppointments ?? 0) === 0}
                        className="w-full rounded-md border p-2 text-start transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isHe ? `פגישות ממתינות: ${badgeCounts?.pendingAppointments ?? 0}` : `Pending appointments: ${badgeCounts?.pendingAppointments ?? 0}`}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => openFromNotification('conversations')}
                        disabled={(badgeCounts?.unreviewedConversations ?? 0) === 0}
                        className="w-full rounded-md border p-2 text-start transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isHe ? `שיחות חדשות: ${badgeCounts?.unreviewedConversations ?? 0}` : `New conversations: ${badgeCounts?.unreviewedConversations ?? 0}`}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => openFromNotification('questionnaires')}
                        disabled={(badgeCounts?.unreviewedQuestionnaires ?? 0) === 0}
                        className="w-full rounded-md border p-2 text-start transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isHe ? `שאלונים חדשים: ${badgeCounts?.unreviewedQuestionnaires ?? 0}` : `New questionnaires: ${badgeCounts?.unreviewedQuestionnaires ?? 0}`}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('clients'); setNotificationsOpen(false) }}
                        disabled={(badgeCounts?.newLeads ?? 0) === 0}
                        className="w-full rounded-md border p-2 text-start transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isHe ? `לידים חדשים: ${badgeCounts?.newLeads ?? 0}` : `New leads: ${badgeCounts?.newLeads ?? 0}`}
                      </button>
                    </li>
                  </ul>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 rounded-full border border-transparent bg-muted/70 px-2 py-1 text-sm transition hover:bg-muted">
                    <Badge className={leadBadgeCount > 0 ? "bg-purple-600 text-white hover:bg-purple-700" : "border border-purple-200 bg-white text-purple-700 hover:bg-purple-50"}>
                      👥 {leadBadgeCount}
                    </Badge>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-72">
                  <p className="text-sm font-semibold mb-2">{isHe ? 'לידים חדשים' : 'New leads'}</p>
                  {leadBadgeCount === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {isHe ? 'אין לידים חדשים כרגע.' : 'No new leads right now.'}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {newLeadItems.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          className="w-full rounded-md border p-2 text-start transition hover:bg-muted"
                          onClick={() => openLead(lead.id)}
                          data-testid={`button-open-new-lead-${lead.id}`}
                        >
                          <span className="block text-sm font-medium">
                            #{lead.leadNumber ?? lead.id} {lead.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {lead.email || lead.phone || (isHe ? 'ללא פרטי קשר' : 'No contact details')}
                          </span>
                        </button>
                      ))}
                      {leadBadgeCount > newLeadItems.length && (
                        <p className="text-xs text-muted-foreground">
                          {isHe ? `ועוד ${leadBadgeCount - newLeadItems.length} לידים...` : `And ${leadBadgeCount - newLeadItems.length} more leads...`}
                        </p>
                      )}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <LanguageSelector />
              <ThemeToggle />
              <Button variant="outline" onClick={handleSignOut} data-testid="button-signout">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isHe ? 'התנתקות' : 'Sign Out'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} dir={isHe ? 'rtl' : 'ltr'}>

          <TabsContent value="overview" className="space-y-6 mt-0">
            <OverviewWidgetGrid widgets={overviewWidgets} badgeMap={tabBadgeMap} onNavigate={setActiveTab} />
          </TabsContent>

          <TabsContent value="contacts" className="mt-0">
            <ContactsManager initialFilter={tabInitialFilters.contacts ?? 'all'} />
          </TabsContent>

          <TabsContent value="appointments" className="mt-0">
            <AppointmentsManager initialFilter={tabInitialFilters.appointments ?? 'all'} />
          </TabsContent>

          <TabsContent value="clients" className="mt-0">
            <ClientsManager focusClientId={focusedClientId} onFocusHandled={() => setFocusedClientId(null)} />
          </TabsContent>

          <TabsContent value="conversations" className="mt-0">
            <ConversationsManager initialFilter={tabInitialFilters.conversations ?? 'all'} />
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-0">
            <WhatsAppManager />
          </TabsContent>

          <TabsContent value="questionnaires" className="mt-0">
            <QuestionnaireSubmissions initialFilter={tabInitialFilters.questionnaires ?? 'all'} />
          </TabsContent>

          <TabsContent value="visual-editor" className="mt-0">
            <VisualEditor />
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
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          {isHe ? 'שפות מוצגות' : 'Displayed Languages'}
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ALL_LANGUAGES.map(lang => {
                            const checked = availableCodes.includes(lang.code)
                            const isLastSelected = checked && availableCodes.length === 1

                            return (
                              <label
                                key={lang.code}
                                className="flex items-center gap-3 rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
                              >
                                <Checkbox
                                  checked={checked}
                                  disabled={isLastSelected}
                                  onCheckedChange={(value) => handleToggleDisplayLanguage(lang.code, value === true)}
                                  data-testid={`checkbox-language-${lang.code}`}
                                />
                                <span className="flex items-center gap-2">
                                  <span className={languageCodeClass} aria-hidden="true">{lang.flag}</span>
                                  <span className={languageNameClass}>{lang.nativeName}</span>
                                </span>
                              </label>
                            )
                          })}
                        </div>
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
                                  <span className={languageCodeClass} aria-hidden="true">{lang.flag}</span>
                                  <span className={languageNameClass}>{lang.nativeName}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
              
              <Card>
                <CardHeader>
                  <CardTitle>{isHe ? 'הגדרות ווידג׳טים' : 'Widget Settings'}</CardTitle>
                  <CardDescription>{isHe ? 'שליטה על הצגת אלמנטים צפים באתר' : 'Control visibility of floating site elements'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{isHe ? 'הצג צ׳אט' : 'Show Chat'}</Label>
                    <Switch checked={widgetSettings.showChat} onCheckedChange={v => setWidgetSettings(p => ({ ...p, showChat: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{isHe ? 'הצג נגישות' : 'Show Accessibility'}</Label>
                    <Switch checked={widgetSettings.showAccessibility} onCheckedChange={v => setWidgetSettings(p => ({ ...p, showAccessibility: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{isHe ? 'הצג וואטסאפ' : 'Show WhatsApp'}</Label>
                    <Switch checked={widgetSettings.showWhatsApp} onCheckedChange={v => setWidgetSettings(p => ({ ...p, showWhatsApp: v }))} />
                  </div>
                  <Button onClick={handleSaveWidgetSettings} className="w-full mt-4">
                    <Save className="w-4 h-4 mr-2" />
                    {isHe ? 'שמור הגדרות ווידג׳טים' : 'Save Widget Settings'}
                  </Button>
                </CardContent>
              </Card>

              <ChangePasswordSettings />
            </div>
          </TabsContent>

          {user?.email === 'dr@keshevplus.co.il' && (
            <>
              <TabsContent value="users" className="mt-0">
                <UsersManager />
              </TabsContent>
              <TabsContent value="bin" className="mt-0">
                <BinManager />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminDashboard
