import { useQuery, useMutation } from '@tanstack/react-query'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { apiRequest, queryClient } from '@/lib/queryClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, RotateCcw, Archive } from 'lucide-react'

interface BinItem {
  type: string
  id: number
  label: string
  archived: boolean
  isTest: boolean
  createdAt: string
}

const TYPE_LABEL: Record<string, { he: string; en: string }> = {
  contact: { he: 'פנייה', en: 'Contact' },
  conversation: { he: 'שיחה', en: 'Conversation' },
  client: { he: 'ליד/לקוח', en: 'Lead/Client' },
  appointment: { he: 'פגישה', en: 'Appointment' },
  questionnaire: { he: 'שאלון', en: 'Questionnaire' },
}

export default function BinManager() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()

  const { data: items = [], isLoading } = useQuery<BinItem[]>({
    queryKey: ['/api/admin/bin'],
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/bin'] })
    queryClient.invalidateQueries({ queryKey: ['/api/contacts'] })
    queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
    queryClient.invalidateQueries({ queryKey: ['/api/clients'] })
    queryClient.invalidateQueries({ queryKey: ['/api/appointments'] })
    queryClient.invalidateQueries({ queryKey: ['/api/questionnaires'] })
    queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
  }

  const restoreMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: number }) =>
      apiRequest('POST', `/api/admin/bin/${type}/${id}/restore`),
    onSuccess: () => {
      invalidateAll()
      toast({
        title: isHe ? 'שוחזר' : 'Restored',
        description: isHe ? 'הפריט שוחזר לרשימה הרגילה.' : 'The item has been restored to the normal list.',
      })
    },
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: number }) =>
      apiRequest('DELETE', `/api/admin/bin/${type}/${id}`),
    onSuccess: () => {
      invalidateAll()
      toast({
        title: isHe ? 'נמחק לצמיתות' : 'Permanently deleted',
        description: isHe ? 'הפריט נמחק ולא ניתן לשחזור.' : 'The item has been permanently deleted and cannot be recovered.',
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'סל מיחזור' : 'Recycle Bin'}</CardTitle>
        </div>
        <CardDescription>
          {isHe
            ? 'פריטים שנמחקו על ידי מנהלים/מנהלי מערכת או שסומנו כבדיקה. ניתן לשחזר או למחוק לצמיתות.'
            : 'Items deleted by admins/managers or marked as test. Restore them or permanently delete.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{isHe ? 'טוען...' : 'Loading...'}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{isHe ? 'סל המיחזור ריק' : 'The recycle bin is empty'}</p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between gap-2 rounded-md border p-2 flex-wrap"
              data-testid={`row-bin-${item.type}-${item.id}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="shrink-0">
                  {isHe ? TYPE_LABEL[item.type]?.he || item.type : TYPE_LABEL[item.type]?.en || item.type}
                </Badge>
                <span className="truncate text-sm">{item.label}</span>
                {item.isTest && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {isHe ? 'בדיקה' : 'Test'}
                  </Badge>
                )}
                {item.archived && (
                  <Badge variant="destructive" className="shrink-0 text-[10px]">
                    {isHe ? 'הועבר לסל' : 'Archived'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restoreMutation.mutate({ type: item.type, id: item.id })}
                  disabled={restoreMutation.isPending}
                  data-testid={`button-restore-${item.type}-${item.id}`}
                >
                  <RotateCcw className="h-4 w-4 me-1" />
                  {isHe ? 'שחזר' : 'Restore'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const msg = isHe
                      ? 'למחוק לצמיתות? לא ניתן לשחזר פעולה זו.'
                      : 'Permanently delete? This cannot be undone.'
                    if (window.confirm(msg)) {
                      permanentDeleteMutation.mutate({ type: item.type, id: item.id })
                    }
                  }}
                  disabled={permanentDeleteMutation.isPending}
                  data-testid={`button-permanent-delete-${item.type}-${item.id}`}
                >
                  <Trash2 className="h-4 w-4 me-1" />
                  {isHe ? 'מחק לצמיתות' : 'Delete permanently'}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
