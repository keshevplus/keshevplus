import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, Search } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ActivityLog } from '@shared/schema'

function displayActor(log: ActivityLog) {
  return log.actorName || log.actorEmail || 'System'
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'KP'
}

export default function ActivityLogManager() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const [query, setQuery] = useState('')

  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/admin/activity-logs'],
  })

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return logs
    return logs.filter((log) => [
      log.actorName,
      log.actorEmail,
      log.actorRole,
      log.action,
      log.entityType,
      log.entityLabel,
      log.description,
    ].some((value) => String(value || '').toLowerCase().includes(term)))
  }, [logs, query])

  const formatDate = (value: string | Date) => new Date(value).toLocaleString(isHe ? 'he-IL' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'יומן פעילות מערכת' : 'System Activity Log'}</CardTitle>
        </div>
        <CardDescription>
          {isHe
            ? 'מעקב אחר פעולות מנהלים, משתמשים, לידים, לקוחות, פגישות, צ׳אט ו-WhatsApp'
            : 'Tracks admin actions across users, leads, clients, appointments, chat, and WhatsApp'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isHe ? 'חיפוש לפי שם, אימייל, פעולה או לקוח' : 'Search by name, email, action, or client'}
            className="ps-9"
            data-testid="input-activity-log-search"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{isHe ? 'טוען...' : 'Loading...'}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">{isHe ? 'אין פעילויות להצגה' : 'No activity to show'}</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((log) => {
              const actor = displayActor(log)
              return (
                <div key={log.id} className="flex items-start gap-3 rounded-lg border bg-background p-3" data-testid={`activity-log-${log.id}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={log.actorProfileImageUrl || undefined} alt={actor} />
                    <AvatarFallback className="text-xs font-semibold">{initials(actor)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{actor}</span>
                      {log.actorRole && <Badge variant="outline" className="text-[10px]">{log.actorRole}</Badge>}
                      <Badge variant="secondary" className="text-[10px]">{log.action}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground">{log.description}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {log.entityType}
                      {log.entityId ? ` #${log.entityId}` : ''}
                      {log.entityLabel ? ` · ${log.entityLabel}` : ''}
                      {log.actorEmail ? ` · ${log.actorEmail}` : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
