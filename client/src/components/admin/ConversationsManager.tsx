import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient, apiRequest } from '@/lib/queryClient'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Mail, Phone, User, ChevronDown, ChevronUp, CheckCircle, Bot, Trash2 } from 'lucide-react'

interface Conversation {
  id: number
  visitorName: string
  visitorEmail: string
  visitorPhone: string | null
  title: string
  reviewed: boolean
  createdAt: string
}

interface Message {
  id: number
  conversationId: number
  role: string
  content: string
  createdAt: string
}

const ConversationsManager = () => {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  })

  const { data: expandedMessages = [] } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${expandedId}/messages`],
    enabled: expandedId !== null,
  })

  const markReviewed = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/conversations/${id}/reviewed`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/conversations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      setExpandedId(null)
    },
  })

  const unreviewedCount = conversations.filter(c => !c.reviewed).length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          {isHe ? 'טוען שיחות...' : 'Loading conversations...'}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>
              {isHe ? 'שיחות צ׳אט' : 'Chat Conversations'}
              {unreviewedCount > 0 && (
                <Badge variant="secondary" className="ms-2">{unreviewedCount}</Badge>
              )}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            {isHe ? 'אין שיחות עדיין' : 'No conversations yet'}
          </p>
        ) : (
          <div className="space-y-3">
            {conversations.map(conv => {
              const isExpanded = expandedId === conv.id
              return (
                <div key={conv.id} className="border rounded-md overflow-visible" data-testid={`conversation-${conv.id}`}>
                  <div
                    className="flex items-center justify-between gap-2 p-3 cursor-pointer hover-elevate"
                    onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{conv.visitorName}</span>
                          {!conv.reviewed && (
                            <Badge variant="default" className="text-xs">
                              {isHe ? 'חדש' : 'New'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {conv.visitorEmail}
                          </span>
                          {conv.visitorPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {conv.visitorPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {new Date(conv.createdAt).toLocaleDateString('he-IL')}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t p-3 space-y-3">
                      <div className="max-h-64 overflow-y-auto space-y-2 bg-muted/30 rounded-md p-3">
                        {expandedMessages.length === 0 ? (
                          <p className="text-center text-muted-foreground text-xs py-4">
                            {isHe ? 'אין הודעות בשיחה זו' : 'No messages in this conversation'}
                          </p>
                        ) : (
                          expandedMessages.map(msg => (
                            <div
                              key={msg.id}
                              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              data-testid={`msg-${msg.id}`}
                            >
                              {msg.role === 'assistant' && (
                                <div className="shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                  <Bot className="h-3 w-3 text-primary" />
                                </div>
                              )}
                              <div
                                className={`rounded-lg px-3 py-1.5 max-w-[80%] text-xs whitespace-pre-wrap ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background border'
                                }`}
                              >
                                {msg.content}
                              </div>
                              {msg.role === 'user' && (
                                <div className="shrink-0 h-5 w-5 rounded-full bg-muted flex items-center justify-center mt-1">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {!conv.reviewed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markReviewed.mutate(conv.id)}
                            disabled={markReviewed.isPending}
                            data-testid={`button-review-${conv.id}`}
                          >
                            <CheckCircle className="h-4 w-4 me-1" />
                            {isHe ? 'סמן כנקרא' : 'Mark as Reviewed'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30"
                          onClick={() => {
                            if (window.confirm(isHe ? `למחוק את השיחה עם ${conv.visitorName}?` : `Delete conversation with ${conv.visitorName}?`)) {
                              deleteMutation.mutate(conv.id)
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-conversation-${conv.id}`}
                        >
                          <Trash2 className="h-4 w-4 me-1" />
                          {isHe ? 'מחק' : 'Delete'}
                        </Button>
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
