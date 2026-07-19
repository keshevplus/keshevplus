import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { apiRequest, queryClient } from '@/lib/queryClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserCog, UserPlus, Trash2, Mail } from 'lucide-react'

interface AdminUser {
  id: number
  email: string
  role: string
  mustChangePassword: boolean
}

const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-purple-600 text-white hover:bg-purple-700',
  admin: 'bg-blue-600 text-white hover:bg-blue-700',
  manager: 'bg-teal-600 text-white hover:bg-teal-700',
  billing: 'bg-amber-600 text-white hover:bg-amber-700',
  user: 'bg-muted text-muted-foreground',
}

const ROLE_LABEL: Record<string, { he: string; en: string }> = {
  owner: { he: 'בעלים', en: 'Owner' },
  admin: { he: 'מנהל מערכת', en: 'Admin' },
  manager: { he: 'מנהל', en: 'Manager' },
  billing: { he: 'הנהלת חשבונות', en: 'Billing' },
  user: { he: 'משתמש', en: 'User' },
}

export default function UsersManager() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'billing' | 'user'>('user')
  const [error, setError] = useState('')

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/users', { email, password, role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] })
      setEmail('')
      setPassword('')
      setRole('user')
      setError('')
      toast({
        title: isHe ? 'המשתמש נוסף' : 'User added',
        description: isHe ? 'המשתמש החדש נוצר בהצלחה.' : 'The new user has been created successfully.',
      })
    },
    onError: (err: any) => {
      const raw = typeof err?.message === 'string' ? err.message : ''
      const isDuplicate = raw.includes('already exists')
      setError(
        isDuplicate
          ? (isHe ? 'קיים כבר משתמש עם אימייל זה' : 'A user with this email already exists')
          : (isHe ? 'הוספת המשתמש נכשלה' : 'Failed to add user')
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest('DELETE', `/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] })
      toast({
        title: isHe ? 'המשתמש הוסר' : 'User removed',
        description: isHe ? 'המשתמש הוסר בהצלחה.' : 'The user has been removed successfully.',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || password.length < 6) {
      setError(isHe ? 'יש להזין אימייל וסיסמה בת 6 תווים לפחות' : 'Enter an email and a password of at least 6 characters')
      return
    }
    createMutation.mutate()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'ניהול משתמשים' : 'User Management'}</CardTitle>
        </div>
        <CardDescription>
          {isHe ? 'רשימת כל המשתמשים במערכת והוספת משתמשים חדשים' : 'All system users and adding new ones'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
          <div className="space-y-1">
            <Label htmlFor="new-user-email">{isHe ? 'אימייל' : 'Email'}</Label>
            <Input
              id="new-user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@keshevplus.co.il"
              data-testid="input-new-user-email"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-user-password">{isHe ? 'סיסמה זמנית' : 'Temporary password'}</Label>
            <Input
              id="new-user-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isHe ? 'לפחות 6 תווים' : 'At least 6 characters'}
              data-testid="input-new-user-password"
            />
          </div>
          <div className="space-y-1">
            <Label>{isHe ? 'תפקיד' : 'Role'}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger className="w-[130px]" data-testid="select-new-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin" data-testid="option-role-admin">{isHe ? ROLE_LABEL.admin.he : ROLE_LABEL.admin.en}</SelectItem>
                <SelectItem value="manager" data-testid="option-role-manager">{isHe ? ROLE_LABEL.manager.he : ROLE_LABEL.manager.en}</SelectItem>
                <SelectItem value="billing" data-testid="option-role-billing">{isHe ? ROLE_LABEL.billing.he : ROLE_LABEL.billing.en}</SelectItem>
                <SelectItem value="user" data-testid="option-role-user">{isHe ? ROLE_LABEL.user.he : ROLE_LABEL.user.en}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={createMutation.isPending} data-testid="button-add-user">
            <UserPlus className="h-4 w-4 me-1" />
            {isHe ? 'הוסף' : 'Add'}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-destructive" data-testid="text-new-user-error">{error}</p>
        )}

        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{isHe ? 'טוען...' : 'Loading...'}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">{isHe ? 'אין משתמשים להצגה' : 'No users to display'}</p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-2 rounded-md border p-2"
                data-testid={`row-user-${u.id}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate text-sm">{u.email}</span>
                  {u.mustChangePassword && (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {isHe ? 'ממתין להחלפת סיסמה' : 'Pending password change'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={ROLE_BADGE[u.role] || ROLE_BADGE.user}>
                    {isHe ? (ROLE_LABEL[u.role]?.he || u.role) : (ROLE_LABEL[u.role]?.en || u.role)}
                  </Badge>
                  {u.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (window.confirm(isHe ? 'האם למחוק משתמש זה?' : 'Delete this user?')) {
                          deleteMutation.mutate(u.id)
                        }
                      }}
                      data-testid={`button-delete-user-${u.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
