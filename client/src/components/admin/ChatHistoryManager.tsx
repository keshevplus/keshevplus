import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, Phone, Mail, User, Trash2, Filter, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/useLanguage'
import { apiRequest, queryClient } from '@/lib/queryClient'
import type { Conversation, Message } from '@shared/schema'
import { useAdminUndo } from '@/hooks/useAdminUndo'

function formatWhatsAppUrl(phone: string, message?: string) {
  const cleaned = phone.replace(/[^0-9+]/g, '').replace(/^0/, '972')
  const params = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleaned}${params}`
}

interface WhatsAppConversation {
  phone: string
  clientId: number | null
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface WhatsAppMessage {
  id: number
  clientId: number | null
  waMessageId: string | null
  phone: string
  direction: 'inbound' | 'outbound'
  content: string
  mediaUrl: string | null
  status: string
  rawPayload: any
  createdAt: string
}

type ChatThread =
  | { channel: 'website'; key: string; date: Date; conv: Conversation }
  | { channel: 'whatsapp'; key: string; date: Date; wa: WhatsAppConversation }

type ChatFilter = 'all' | 'new'

interface ChatHistoryManagerProps {
  initialFilter?: ChatFilter
}

function WebsiteMessages({ conversationId, isHe }: { conversationId: number; isHe: boolean }) {
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${conversationId}/messages`],
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-xs py-4">
        {isHe ? 'אין הודעות בשיחה זו' : 'No messages in this conversation'}
      </p>
    )
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto rounded-md border bg-muted/10 p-3" data-testid="website-thread-messages">
      {messages.map(msg => {
        const isVisitor = msg.role === 'user'
        const alignEnd = isHe ? !isVisitor : isVisitor
        return (
          <div
            key={msg.id}
            className={`flex flex-col gap-0.5 ${alignEnd ? 'items-end' : 'items-start'}`}
            data-testid={`conversation-msg-${msg.id}`}
          >
            <div
              className={`rounded-lg px-3 py-1.5 max-w-[85%] text-sm whitespace-pre-wrap ${
                isVisitor ? 'bg-muted' : 'bg-primary text-primary-foreground'
              }`}
            >
              {msg.content}
            </div>
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs text-muted-foreground">
                {new Date(msg.createdAt).toLocaleString(isHe ? 'he-IL' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-xs text-muted-foreground">
                {isVisitor ? (isHe ? 'מבקר' : 'Visitor') : (isHe ? 'בוט' : 'Bot')}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WhatsAppThread({ phone, isHe }: { phone: string; isHe: boolean }) {
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages = [] } = useQuery<WhatsAppMessage[]>({
    queryKey: ['/api/whatsapp/messages', phone],
    queryFn: async () => {
      const res = await fetch(`/api/whatsapp/messages/${encodeURIComponent(phone)}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json()
    },
  })

  const sendMutation = useMutation({
    mutationFn: (body: { phone: string; message: string }) =>
      apiRequest('POST', '/api/whatsapp/send', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/messages', phone] })
      setMessageText('')
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!messageText.trim()) return
    sendMutation.mutate({ phone, message: messageText.trim() })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-2 max-h-80 overflow-y-auto rounded-md border bg-muted/10 p-3" data-testid="whatsapp-thread-messages">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-xs py-4">
            {isHe ? 'אין הודעות בשיחה זו' : 'No messages in this conversation'}
          </p>
        ) : (
          messages.map(msg => {
            const isInbound = msg.direction === 'inbound'
            const alignEnd = isHe ? !isInbound : isInbound
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${alignEnd ? 'items-end' : 'items-start'}`}
                data-testid={`whatsapp-msg-${msg.id}`}
              >
                <div
                  className={`rounded-lg px-3 py-1.5 max-w-[85%] text-sm whitespace-pre-wrap ${
                    isInbound ? 'bg-muted' : 'bg-green-600 dark:bg-green-700 text-white'
                  }`}
                >
                  {msg.content}
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString(isHe ? 'he-IL' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isInbound ? (isHe ? 'נכנסת' : 'Inbound') : (isHe ? 'יוצאת' : 'Outbound')}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isHe ? 'הקלד הודעה...' : 'Type a message...'}
          className="flex-1"
          dir={isHe ? 'rtl' : 'ltr'}
          data-testid="input-whatsapp-reply"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!messageText.trim() || sendMutation.isPending}
          data-testid="button-send-whatsapp-reply"
        >
          <Send className="h-4 w-4 me-1" />
          {isHe ? 'שלח' : 'Send'}
        </Button>
      </div>
    </div>
  )
}

const ChatHistoryManager = ({ initialFilter = 'all' }: ChatHistoryManagerProps) => {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const showUndo = useAdminUndo()
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [filter, setFilter] = useState<ChatFilter>(initialFilter)
  const [includeTest, setIncludeTest] = useState(false)

  useEffect(() => {
    setFilter(initialFilter)
  }, [initialFilter])

  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations', includeTest],
    queryFn: async () => {
      const res = await fetch(includeTest ? '/api/conversations?includeTest=true' : '/api/conversations', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch conversations')
      return res.json()
    },
  })

  const { data: waConversations = [], isLoading: loadingWhatsapp } = useQuery<WhatsAppConversation[]>({
    queryKey: ['/api/whatsapp/conversations'],
  })

  const isLoading = loadingConversations || loadingWhatsapp

  const threads = useMemo<ChatThread[]>(() => {
    const websiteThreads: ChatThread[] = conversations.map(conv => ({
      channel: 'website',
      key: `web-${conv.id}`,
      date: new Date(conv.createdAt),
      conv,
    }))
    const waThreads: ChatThread[] = waConversations.map(wa => ({
      channel: 'whatsapp',
      key: `wa-${wa.phone}`,
      date: new Date(wa.lastMessageAt),
      wa,
    }))
    return [...websiteThreads, ...waThreads].sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [conversations, waConversations])

  const visibleThreads = useMemo(() => {
    if (filter === 'new') {
      return threads.filter(t => (t.channel === 'website' ? !t.conv.reviewed : t.wa.unreadCount > 0))
    }
    return threads
  }, [threads, filter])

  const visibleWebsiteIds = useMemo(
    () => visibleThreads.filter((t): t is Extract<ChatThread, { channel: 'website' }> => t.channel === 'website').map(t => t.conv.id),
    [visibleThreads]
  )

  useEffect(() => {
    setSelectedIds(prev => {
      if (prev.size === 0) return prev
      const visibleIds = new Set(visibleWebsiteIds)
      const next = new Set([...prev].filter(id => visibleIds.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [visibleWebsiteIds])

  const markReviewed = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/conversations/${id}/reviewed`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
      showUndo({
        title: isHe ? 'השיחה סומנה כטופלה' : 'Conversation marked reviewed',
        description: isHe ? 'אפשר לבטל עם Ctrl+Z.' : 'Press Ctrl+Z to undo.',
        undoLabel: isHe ? 'בטל' : 'Undo',
        undoSuccessTitle: isHe ? 'השינוי בוטל' : 'Change undone',
        undoErrorTitle: isHe ? 'הביטול נכשל' : 'Undo failed',
        onUndo: async () => {
          await apiRequest('PATCH', `/api/conversations/${id}/unreviewed`)
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
          queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
        },
      })
    },
  })

  const markUnreviewed = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/conversations/${id}/unreviewed`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
      setSelectedIds(new Set())
      showUndo({
        title: isHe ? 'השיחה סומנה כחדשה' : 'Conversation marked unreviewed',
        description: isHe ? 'אפשר לבטל עם Ctrl+Z.' : 'Press Ctrl+Z to undo.',
        undoLabel: isHe ? 'בטל' : 'Undo',
        undoSuccessTitle: isHe ? 'השינוי בוטל' : 'Change undone',
        undoErrorTitle: isHe ? 'הביטול נכשל' : 'Undo failed',
        onUndo: async () => {
          await apiRequest('PATCH', `/api/conversations/${id}/reviewed`)
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
          queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
        },
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/conversations/${id}`)
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
      showUndo({
        title: isHe ? 'השיחה הועברה לסל' : 'Conversation moved to bin',
        description: isHe ? 'אפשר לשחזר מיד עם Ctrl+Z.' : 'Press Ctrl+Z to restore it.',
        undoLabel: isHe ? 'שחזר' : 'Restore',
        undoSuccessTitle: isHe ? 'השיחה שוחזרה' : 'Conversation restored',
        undoErrorTitle: isHe ? 'השחזור נכשל' : 'Restore failed',
        onUndo: async () => {
          await apiRequest('POST', `/api/admin/bin/conversation/${id}/restore`)
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
          queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
        },
      })
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await apiRequest('POST', '/api/conversations/bulk-delete', { ids })
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
      setSelectedIds(new Set())
      showUndo({
        title: isHe ? 'השיחות הועברו לסל' : 'Conversations moved to bin',
        description: isHe ? 'אפשר לשחזר את כולן עם Ctrl+Z.' : 'Press Ctrl+Z to restore them.',
        undoLabel: isHe ? 'שחזר' : 'Restore',
        undoSuccessTitle: isHe ? 'השיחות שוחזרו' : 'Conversations restored',
        undoErrorTitle: isHe ? 'השחזור נכשל' : 'Restore failed',
        onUndo: async () => {
          await Promise.all(ids.map((id) => apiRequest('POST', `/api/admin/bin/conversation/${id}/restore`)))
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
          queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
        },
      })
    },
  })

  const markTestMutation = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/conversations/${id}/mark-test`, { isTest: true }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
      showUndo({
        title: isHe ? 'סומן כבדיקה' : 'Marked as test',
        description: isHe ? 'אפשר להחזיר לרשימה הרגילה עם Ctrl+Z.' : 'Press Ctrl+Z to return it to normal data.',
        undoLabel: isHe ? 'בטל' : 'Undo',
        undoSuccessTitle: isHe ? 'סימון הבדיקה בוטל' : 'Test mark removed',
        undoErrorTitle: isHe ? 'הביטול נכשל' : 'Undo failed',
        onUndo: async () => {
          await apiRequest('PATCH', `/api/conversations/${id}/mark-test`, { isTest: false })
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
          queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
        },
      })
    },
  })

  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.size === visibleWebsiteIds.length ? new Set() : new Set(visibleWebsiteIds)
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
            <CardTitle>{isHe ? 'היסטוריית צ׳אט' : 'Chat History'}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={value => setFilter(value as ChatFilter)}>
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
            <label className="flex h-8 items-center gap-2 rounded-md border px-2 text-xs">
              <Checkbox
                checked={includeTest}
                onCheckedChange={(checked) => setIncludeTest(checked === true)}
                data-testid="checkbox-include-test-conversations"
              />
              {isHe ? 'כולל QA' : 'Include QA'}
            </label>
            {visibleWebsiteIds.length > 0 && (
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
        <CardDescription>
          {isHe ? 'צפייה וניהול שיחות מהאתר ומוואטסאפ במקום אחד' : 'View and manage website and WhatsApp conversations in one place'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 text-center text-muted-foreground">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {selectMode && visibleWebsiteIds.length > 0 && (
              <div className="flex items-center gap-3 mb-3 p-2 border rounded-md bg-muted/30 flex-wrap">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIds.size === visibleWebsiteIds.length && visibleWebsiteIds.length > 0}
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

            {visibleThreads.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                {isHe ? 'אין שיחות להצגה' : 'No conversations to display'}
              </p>
            ) : (
              <div className="space-y-3">
                {visibleThreads.map(thread => {
                  if (thread.channel === 'website') {
                    const conv = thread.conv
                    return (
                      <div
                        key={thread.key}
                        className={`rounded-md overflow-visible cursor-pointer border ${
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
                            setExpandedKey(expandedKey === thread.key ? null : thread.key)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 p-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate shrink-0 text-blue-700 border-blue-300 dark:text-blue-300 dark:border-blue-700">
                              <MessageCircle className="h-3 w-3 me-1" />
                              {isHe ? 'אתר' : 'Website'}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">{conv.visitorName}</span>
                            </div>
                            <Badge
                              variant={conv.reviewed ? 'outline' : 'destructive'}
                              className="no-default-hover-elevate no-default-active-elevate"
                              data-testid={`badge-status-web-${conv.id}`}
                            >
                              {conv.reviewed ? (isHe ? 'נסקר' : 'Reviewed') : (isHe ? 'חדש' : 'New')}
                            </Badge>
                            {conv.isTest && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-none">
                                QA
                              </Badge>
                            )}
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
                                setExpandedKey(expandedKey === thread.key ? null : thread.key)
                              }}
                            >
                              {expandedKey === thread.key ? (
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
                        {expandedKey === thread.key && (
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
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                  size="sm"
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
                                  size="sm"
                                  variant="outline"
                                  onClick={e => {
                                    e.stopPropagation()
                                    markTestMutation.mutate(conv.id)
                                  }}
                                  data-testid={`button-mark-test-conversation-${conv.id}`}
                                >
                                  {isHe ? 'סמן כבדיקה' : 'Mark as test'}
                                </Button>
                                <Button
                                  size="sm"
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
                            <div className="mt-2 flex items-center gap-2">
                              <div className="text-xs text-muted-foreground">{isHe ? 'תאריך יצירה:' : 'Creation date:'}</div>
                              <div className="font-medium text-foreground">{formatTimestamp(conv.createdAt)}</div>
                            </div>
                            <div className="mt-3">
                              <div className="text-xs text-muted-foreground mb-1">{isHe ? 'הודעות:' : 'Messages:'}</div>
                              <WebsiteMessages conversationId={conv.id} isHe={isHe} />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }

                  const wa = thread.wa
                  return (
                    <div
                      key={thread.key}
                      className="rounded-md overflow-visible cursor-pointer border"
                      onClick={() => setExpandedKey(expandedKey === thread.key ? null : thread.key)}
                      data-testid={`whatsapp-thread-${wa.phone}`}
                    >
                      <div className="flex items-center justify-between gap-2 p-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="no-default-hover-elevate no-default-active-elevate shrink-0 bg-green-600 dark:bg-green-500 text-white">
                            <SiWhatsapp className="h-3 w-3 me-1" />
                            WhatsApp
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-foreground">{wa.phone}</span>
                          </div>
                          {wa.clientId && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {isHe ? `לקוח #${wa.clientId}` : `Client #${wa.clientId}`}
                            </span>
                          )}
                          {wa.unreadCount > 0 && (
                            <Badge variant="destructive" className="no-default-hover-elevate no-default-active-elevate">
                              {wa.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground truncate max-w-[220px]">{wa.lastMessage}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={e => {
                            e.stopPropagation()
                            setExpandedKey(expandedKey === thread.key ? null : thread.key)
                          }}
                        >
                          {expandedKey === thread.key ? (
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
                      {expandedKey === thread.key && (
                        <div className="border-t border-muted py-3 px-4 text-sm" onClick={e => e.stopPropagation()}>
                          <div className="mb-2 text-xs text-muted-foreground">
                            {isHe ? 'עודכן לאחרונה:' : 'Last updated:'} {formatTimestamp(wa.lastMessageAt)}
                          </div>
                          <WhatsAppThread phone={wa.phone} isHe={isHe} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ChatHistoryManager
