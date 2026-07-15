import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, Phone, Mail, User, Trash2, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/useLanguage'
import { apiRequest, queryClient } from '@/lib/queryClient'
import type { Conversation } from '@shared/schema'

function formatWhatsAppUrl(phone: string, message?: string) {
  const cleaned = phone.replace(/[^0-9+]/g, '').replace(/^0/, '972')
  const params = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleaned}${params}`
}

type ConversationFilter = 'all' | 'new'

interface ConversationsManagerProps {
  initialFilter?: ConversationFilter
}

const ConversationsManager = ({ initialFilter = 'all' }: ConversationsManagerProps) => {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
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

  const markReviewed = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/conversations/${id}/reviewed`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await apiRequest('POST', '/api/conversations/bulk-delete', { ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
      setSelectedIds(new Set())
      toast({
        title: isHe ? 'השיחות נמחקו' : 'Conversations deleted',
        description: isHe ? 'השיחות שנבחרו נמחקו בהצלחה.' : 'Selected conversations have been deleted successfully.',
      })
    },
  })

  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.size === visibleConversations.length
        ? new Set()
        : new Set(visibleConversations.map(c => c.id))
    )
  }

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
      bulkDeleteMutation.mutate(Array.from(selectedIds))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? 'שיחות צ׳אט' : 'Conversations'}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={value => setFilter(value as ConversationFilter)}>
              <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-conversation-filter">
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
            {visibleConversations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectMode(!selectMode)
                  if (selectMode) setSelectedIds(new Set())
                }}
                data-testid="button-toggle-select-conversations"
              >
                {selectMode ? (isHe ? 'ביטול' : 'Cancel') : (isHe ? 'בחירה מרובה' : 'Multi-Select')}
              </Button>
            )}
          </div>
        </div>
        <CardDescription>{isHe ? 'צפייה וניהול שיחות צ׳אט' : 'View and manage chat conversations'}</CardDescription>
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
              disabled={bulkDeleteMutation.isPending || selectedIds.size === 0}
              className="text-destructive border-destructive/30"
            >
              <Trash2 className="h-4 w-4 me-1" />
              {isHe ? `מחק (${selectedIds.size})` : `Delete (${selectedIds.size})`}
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
                        variant={conv.reviewed ? 'outline' : 'destructive'}
                        className="no-default-hover-elevate no-default-active-elevate"
                        data-testid={`badge-status-${conv.id}`}
                      >
                        {conv.reviewed ? (isHe ? 'נסקר' : 'Reviewed') : (isHe ? 'חדש' : 'New')}
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
                            variant="outline"
                            onClick={e => {
                              e.stopPropagation()
                              if (conv.reviewed) markUnreviewed.mutate(conv.id)
                              else markReviewed.mutate(conv.id)
                            }}
                          >
                            {conv.reviewed ? (isHe ? 'סמן כלא נסקר' : 'Mark unreviewed') : (isHe ? 'סמן כנסקר' : 'Mark reviewed')}
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
                          <Badge variant={conv.reviewed ? 'outline' : 'destructive'} className="no-default-hover-elevate no-default-active-elevate">
                            {conv.reviewed ? (isHe ? 'נסקר' : 'Reviewed') : (isHe ? 'חדש' : 'New')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">{isHe ? 'תאריך יצירה:' : 'Creation date:'}</div>
                          <div className="font-medium text-foreground">
                            {formatTimestamp(conv.createdAt)}
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
