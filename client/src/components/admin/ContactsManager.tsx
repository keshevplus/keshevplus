import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, User, Clock, Eye, EyeOff, ChevronDown, ChevronUp, Inbox } from 'lucide-react'
import { apiRequest, queryClient } from '@/lib/queryClient'
import type { Contact } from '@shared/schema'

export default function ContactsManager() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/contacts/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] })
    },
  })

  const unreadCount = contacts.filter(c => !c.read).length

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? 'פניות באתר' : 'Contact Submissions'}</CardTitle>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" data-testid="badge-unread-count">
              {unreadCount} {isHe ? 'חדשות' : 'new'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {isHe ? 'טוען...' : 'Loading...'}
          </p>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {isHe ? 'אין פניות עדיין' : 'No submissions yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => {
              const isExpanded = expandedId === contact.id
              return (
                <div
                  key={contact.id}
                  className={`border rounded-md transition-colors ${
                    !contact.read ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                  data-testid={`contact-row-${contact.id}`}
                >
                  <button
                    className="w-full flex items-center justify-between gap-3 p-3 text-start"
                    onClick={() => setExpandedId(isExpanded ? null : contact.id)}
                    data-testid={`button-toggle-contact-${contact.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {!contact.read ? (
                        <EyeOff className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium truncate ${!contact.read ? 'text-primary' : ''}`}>
                            {contact.name}
                          </span>
                          {!contact.read && (
                            <Badge variant="secondary" className="text-xs">
                              {isHe ? 'חדש' : 'New'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.message.substring(0, 80)}{contact.message.length > 80 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {formatDate(contact.createdAt)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 border-t space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">{contact.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a href={`tel:${contact.phone}`} className="text-sm text-primary">
                            {contact.phone}
                          </a>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            <a href={`mailto:${contact.email}`} className="text-sm text-primary">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground">{formatDate(contact.createdAt)}</span>
                        </div>
                      </div>

                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
                      </div>

                      {!contact.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markReadMutation.mutate(contact.id)}
                          disabled={markReadMutation.isPending}
                          data-testid={`button-mark-read-${contact.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {isHe ? 'סמן כנקרא' : 'Mark as Read'}
                        </Button>
                      )}
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
