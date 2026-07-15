import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Phone, Mail, User, Trash2, Filter, CheckSquare, ChevronDown, ChevronUp, CheckCircle, Bot } from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/useLanguage'
import { apiRequest, queryClient } from '@/lib/queryClient'
import type { Appointment } from '@shared/schema'

function formatWhatsAppUrl(phone: string, message?: string) {
  const cleaned = phone.replace(/[^0-9+]/g, '').replace(/^0/, '972')
  const params = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleaned}${params}`
}

const STATUS_CONFIG: Record<string, { he: string; en: string; color: string }> = {
  pending: { he: 'ממתינה', en: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  confirmed: { he: 'מאושרת', en: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  cancelled: { he: 'בוטלה', en: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  completed: { he: 'הושלמה', en: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
}

type ConversationFilter = 'all' | 'new'

interface ConversationsManagerProps {
  initialFilter?: ConversationFilter
}

const ConversationsManager = ({ initialFilter = 'all' }: ConversationsManagerProps) => {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [filter, setFilter] = useState<ConversationFilter>(initialFilter)

  useEffect(() => {
    setFilter(initialFilter)
  }, [initialFilter])

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  })

  const visibleConversations = useMemo(() => {
    if (filter === 'new') return conversations.filter(c => !c.reviewed)
    return conversations
  }, [conversations, filter])

  useEffect(() => {
    setSelectedIds(prev => {
      const visibleIds = new Set(visibleConversations.map(c => c.id))
      return new Set([...prev].filter(id => visibleIds.has(id)))
    })
  }, [visibleConversations])

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest('PATCH', `/api/conversations/${id}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
      toast({
        title: isHe ? 'הסטטוס עודכן' : 'Status updated',
        description: isHe ? 'סטטוס השיחה עודכן בהצלחה.' : 'Conversation status has been updated successfully.',
      })
    },
    onError: () => {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'עדכון הסטטוס נכשל.' : 'Failed to update status.',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/conversations/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
      toast({
        title: isHe ? 'השיחה נמחקה' : 'Conversation deleted',
        description: isHe ? 'השיחה נמחקה בהצלחה.' : 'Conversation has been deleted successfully.',
      })
    },
  })

  const markUnreviewed = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/conversations/${id}/unreviewed`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
      setSelectedIds(new Set())
    },
  })

  const parseDateOnly = (date: string) => {
    const [year, month, day] = date.split('-').map(Number)
    if (year && month && day) {
      return new Date(year, month - 1, day)
    }
    return null
  }

  const formatAppointmentDate = (date: string) => {
    const d = parseDateOnly(date)
    return d.toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAppointmentTime = (time: string) => {
    return time ? time.slice(0, 5) : ''
  }

  const getAppointmentStart = (appointment: Appointment) => {
    const [year, month, day] = appointment.date.split('-').map(Number)
    const [hour = 0, minute = 0] = appointment.time.split(':').map(Number)
    if (year && month && day) {
      return new Date(year, month - 1, day, hour, minute)
    }
    return null
  }

  const toggleSelect = (id: number) => {
    return new Date(appointment.date)
  }

  const next = new Set(selectedIds)
  if (next.has(id)) next.delete(id)

  const formatTimestamp = (date?: string | Date | null) => {
    if (!date) return isHe ? 'לא תועד' : 'Not recorded'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return isHe ? 'לא תועד' : 'Not recorded'

    return d.toLocaleString(isHe ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    const msg = isHe
      ? `האם אתה בטוח שברצונך למחוק ${selectedIds.size} שיחות?`
      : `Are you sure you want to delete ${selectedIds.size} conversations?`
    if (window.confirm(msg)) {
      deleteMutation.mutate(Array.from(selectedIds))
    }
  }

  const upcomingAppointments = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    return allAppointments
      .filter(appointment => {
        if (!['pending', 'confirmed'].includes(appointment.status)) return false
        return getAppointmentStart(appointment) >= startOfToday
      })
      .sort((a, b) => getAppointmentStart(a).getTime() - getAppointmentStart(b).getTime())
  }, [allAppointments])

  const groupedUpcomingAppointments = useMemo(() => {
    return upcomingAppointments.reduce<Record<string, Appointment[]>>((groups, appointment) => {
      const key = appointment.date
      groups[key] = groups[key] || []
      groups[key].push(appointment)
      return groups
    }, {})
  }, [upcomingAppointments])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? 'ניהול פגישות' : 'Appointment Manager'}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={value => setFilter(value as ConversationFilter)}>
              <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-appointment-filter">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder={isHe ? 'סינון' : 'Filter'} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHe ? 'הכל' : 'All'}</SelectItem>
                <SelectItem value="new">{isHe ? 'חדשות בלבד' : 'New only'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>{isHe ? 'צפייה וניהול פגישות עם לקוחות' : 'View and manage client appointments'}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 text-center text-muted-foreground">
        {selectMode && visibleConversations.length > 0 && (
          <div className="flex items-center gap-3 mb-3 p-2 border rounded-md bg-muted/30 flex-wrap">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.size === visibleConversations.length && visibleConversations.length > 0}
                onCheckedChange={toggleSelectAll}
                data-testid="checkbox-select-all-conversations"
              />
              <span className="text-sm">{isHe ? 'בחר הכל' : 'Select All'}</span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={deleteMutation.isPending}
              className="text-destructive border-destructive/30"
            >
              <Trash2 className="h-4 w-4 me-1" />
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {isHe ? 'אין פגישות קרובות למחיקה.' : 'No upcoming appointments to delete.'}
                </p>
              ) : (
                <>
                  {isHe ? `מחק (${selectedIds.size})` : `Delete (${selectedIds.size})`}
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(groupedUpcomingAppointments).map(([date, items]) => (
                      <div key={date} className="rounded-md border bg-background p-3">
                        <div className="font-medium text-sm text-foreground">{formatAppointmentDate(date)}</div>
                        {items.length === 0 ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-muted-foreground">{isHe ? 'אין פרטים להצגה' : 'No details to display'}</p>
                          </div>
                        ) : (
                          items.map(appointment => {
                            const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending
                            return (
                              <div key={appointment.id} className="rounded-md bg-muted/50 p-2 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="flex items-center gap-1 font-semibold text-foreground">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    {formatAppointmentTime(appointment.time)}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={`no-default-hover-elevate no-default-active-elevate ${statusInfo.color}`}
                                  >
                                    {isHe ? statusInfo.he : statusInfo.en}
                                  </Badge>
                                </div>
                                <div className="mt-1 font-medium text-foreground">{appointment.clientName}</div>
                                <div className="text-xs text-muted-foreground">{appointment.type}</div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Button>
          </div>
        )}

        {visibleConversations.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            {isHe ? 'אין שיחות להצגה' : 'No conversations to display'}
          </p>
        ) : (
          <div className="space-y-3">
            {visibleConversations.map(conv => {
              const statusInfo = STATUS_CONFIG[conv.status] || STATUS_CONFIG.pending
              return (
                <div
                  key={conv.id}
                  className={`rounded-md overflow-visible cursor-pointer ${
                    selectedIds.has(conv.id) ? 'ring-2 ring-primary/40' : ''
                  }`}
                  onClick={() => {
                    if (selectMode) {
                      setSelectedIds(prev => {
                        const next = new Set(prev)
                        if (next.has(conv.id)) next.delete(conv.id)
                        else next.add(conv.id)
                        return next
                      })
                    } else {
                      setExpandedId(expandedId === conv.id ? null : conv.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{conv.visitorName}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="no-default-hover-elevate no-default-active-elevate"
                        data-testid={`badge-status-${conv.id}`}
                      >
                        {isHe ? statusInfo.he : statusInfo.en}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap"
                        onClick={e => {
                          e.stopPropagation()
                          const url = formatWhatsAppUrl(conv.visitorPhone, isHe ? 'שלום, איך אפשר לעזור?' : 'Hello, how can I help?')
                          window.open(url, '_blank')
                        }}
                      >
                        <SiWhatsapp className="h-4 w-4 me-1" />
                        {isHe ? 'צור קשר' : 'Contact'}
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={e => {
                          e.stopPropagation()
                          setExpandedId(expandedId === conv.id ? null : conv.id)
                        }}
                      >
                        {expandedId === conv.id ? (
                          <>
                            <ChevronUp className="h-4 w-4 me-1" />
                            {isHe ? 'סגור פרטים' : 'Close details'}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 me-1" />
                            {isHe ? 'הצג פרטים' : 'Show details'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {expandedId === conv.id && (
                    <div className="border-t border-muted py-3 px-4 text-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{conv.visitorPhone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{conv.visitorEmail}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={e => {
                              e.stopPropagation()
                              const url = formatWhatsAppUrl(conv.visitorPhone, isHe ? 'שלום, איך אפשר לעזור?' : 'Hello, how can I help?')
                              window.open(url, '_blank')
                            }}
                          >
                            <SiWhatsapp className="h-4 w-4 me-1" />
                            {isHe ? 'שלח הודעה' : 'Send message'}
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={e => {
                              e.stopPropagation()
                              if (window.confirm(isHe ? 'האם אתה בטוח שברצונך למחוק שיחה זו?' : 'Are you sure you want to delete this conversation?')) {
                                deleteMutation.mutate(conv.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 me-1" />
                            {isHe ? 'מחק שיחה' : 'Delete conversation'}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">{isHe ? 'סטטוס:' : 'Status:'}</div>
                          <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate">
                            {isHe ? statusInfo.he : statusInfo.en}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">{isHe ? 'תאריך יצירה:' : 'Creation date:'}</div>
                          <div className="font-medium text-foreground">
                            {formatTimestamp(conv.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">{isHe ? 'תאריך עדכון:' : 'Update date:'}</div>
                          <div className="font-medium text-foreground">
                            {formatTimestamp(conv.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ConversationsManager
