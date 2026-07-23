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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserCog, UserPlus, Trash2, Mail, Phone, Save } from 'lucide-react'
import { isOfficeProtectedUserEmail, normalizeAdminEmail } from '@shared/adminAccess'
import { useAuth } from '../auth/AuthProvider'

interface AdminUser {
  id: number
  email: string
  role: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  profileImageUrl: string | null
  createdAt: string | null
  mustChangePassword: boolean
}

const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-purple-600 text-white hover:bg-purple-700',
  superadmin: 'bg-purple-600 text-white hover:bg-purple-700',
  admin: 'bg-blue-600 text-white hover:bg-blue-700',
  manager: 'bg-teal-600 text-white hover:bg-teal-700',
  billing: 'bg-amber-600 text-white hover:bg-amber-700',
  user: 'bg-muted text-muted-foreground',
}

const ROLE_LABEL: Record<string, { he: string; en: string }> = {
  owner: { he: 'בעלים', en: 'Owner' },
  superadmin: { he: 'סופר אדמין', en: 'Superadmin' },
  admin: { he: 'מנהל מערכת', en: 'Admin' },
  manager: { he: 'מנהל', en: 'Manager' },
  billing: { he: 'הנהלת חשבונות', en: 'Billing' },
  user: { he: 'משתמש', en: 'User' },
}

export default function UsersManager() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isHe = language === 'he'
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'billing' | 'user'>('user')
  const [error, setError] = useState('')

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/users', {
        email,
        password,
        role,
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        phone: phone.trim() || null,
        profileImageUrl: profileImageUrl.trim() || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] })
      setEmail('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setPhone('')
      setProfileImageUrl('')
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

  const updateMutation = useMutation({
    mutationFn: async (target: AdminUser) => apiRequest('PATCH', `/api/admin/users/${target.id}`, {
      firstName: target.firstName,
      lastName: target.lastName,
      phone: target.phone,
      profileImageUrl: target.profileImageUrl,
      role: target.role,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] })
      toast({
        title: isHe ? 'המשתמש עודכן' : 'User updated',
        description: isHe ? 'פרטי המשתמש נשמרו.' : 'User profile details were saved.',
      })
    },
    onError: () => {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'שמירת פרטי המשתמש נכשלה' : 'Failed to save user details',
        variant: 'destructive',
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

  const canDeleteUser = (target: AdminUser) => {
    if (!user) return false
    const currentEmail = normalizeAdminEmail(user.email)
    const targetEmail = normalizeAdminEmail(target.email)
    if (target.id === user.id || currentEmail === targetEmail) return false
    if (targetEmail === 'dr@keshevplus.co.il') return false
    if (currentEmail === 'office@keshevplus.co.il' && isOfficeProtectedUserEmail(targetEmail)) return false
    return target.role !== 'owner'
  }

  const formatDate = (value: string | null) => {
    if (!value) return isHe ? 'לא ידוע' : 'Unknown'
    return new Date(value).toLocaleDateString(isHe ? 'he-IL' : 'en-US')
  }

  const initialsFor = (u: AdminUser) => {
    const initials = [u.firstName, u.lastName].filter(Boolean).map((part) => part!.trim()[0]).join('')
    return initials || u.email.slice(0, 2).toUpperCase()
  }

  const displayNameFor = (u: AdminUser) => [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email

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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end">
          <div className="space-y-1">
            <Label htmlFor="new-user-first-name">{isHe ? 'שם פרטי' : 'First name'}</Label>
            <Input
              id="new-user-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              data-testid="input-new-user-first-name"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-user-last-name">{isHe ? 'שם משפחה' : 'Last name'}</Label>
            <Input
              id="new-user-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              data-testid="input-new-user-last-name"
            />
          </div>
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
            <Label htmlFor="new-user-phone">{isHe ? 'טלפון' : 'Phone'}</Label>
            <Input
              id="new-user-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="055-27-399-27"
              data-testid="input-new-user-phone"
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
            <Label htmlFor="new-user-profile-image">{isHe ? 'תמונת פרופיל' : 'Profile image URL'}</Label>
            <Input
              id="new-user-profile-image"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="https://..."
              data-testid="input-new-user-profile-image"
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
          <Button type="submit" disabled={createMutation.isPending} data-testid="button-add-user" className="lg:self-end">
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
              <UserRow
                key={u.id}
                user={u}
                isHe={isHe}
                canDelete={canDeleteUser(u)}
                displayName={displayNameFor(u)}
                initials={initialsFor(u)}
                registeredAt={formatDate(u.createdAt)}
                onSave={(next) => updateMutation.mutate(next)}
                onDelete={() => {
                  if (window.confirm(isHe ? 'האם למחוק משתמש זה?' : 'Delete this user?')) {
                    deleteMutation.mutate(u.id)
                  }
                }}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function UserRow({
  user,
  isHe,
  canDelete,
  displayName,
  initials,
  registeredAt,
  onSave,
  onDelete,
}: {
  user: AdminUser
  isHe: boolean
  canDelete: boolean
  displayName: string
  initials: string
  registeredAt: string
  onSave: (user: AdminUser) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState(user)

  return (
    <div className="rounded-md border p-3 space-y-3" data-testid={`row-user-${user.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={draft.profileImageUrl || undefined} alt={displayName} />
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="h-3 w-3" />
              {user.email}
            </p>
            {draft.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <Phone className="h-3 w-3" />
                {draft.phone}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={ROLE_BADGE[draft.role] || ROLE_BADGE.user}>
            {isHe ? (ROLE_LABEL[draft.role]?.he || draft.role) : (ROLE_LABEL[draft.role]?.en || draft.role)}
          </Badge>
          {user.mustChangePassword && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              {isHe ? 'ממתין להחלפת סיסמה' : 'Pending password change'}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        <Input value={draft.firstName || ''} onChange={(e) => setDraft((p) => ({ ...p, firstName: e.target.value }))} placeholder={isHe ? 'שם פרטי' : 'First name'} />
        <Input value={draft.lastName || ''} onChange={(e) => setDraft((p) => ({ ...p, lastName: e.target.value }))} placeholder={isHe ? 'שם משפחה' : 'Last name'} />
        <Input value={draft.phone || ''} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} placeholder={isHe ? 'טלפון' : 'Phone'} />
        <Input value={draft.profileImageUrl || ''} onChange={(e) => setDraft((p) => ({ ...p, profileImageUrl: e.target.value }))} placeholder={isHe ? 'קישור לתמונה' : 'Image URL'} />
        <Select value={draft.role} onValueChange={(role) => setDraft((p) => ({ ...p, role }))}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">{isHe ? ROLE_LABEL.admin.he : ROLE_LABEL.admin.en}</SelectItem>
            <SelectItem value="manager">{isHe ? ROLE_LABEL.manager.he : ROLE_LABEL.manager.en}</SelectItem>
            <SelectItem value="billing">{isHe ? ROLE_LABEL.billing.he : ROLE_LABEL.billing.en}</SelectItem>
            <SelectItem value="user">{isHe ? ROLE_LABEL.user.he : ROLE_LABEL.user.en}</SelectItem>
            {draft.role === 'owner' && <SelectItem value="owner">{isHe ? ROLE_LABEL.owner.he : ROLE_LABEL.owner.en}</SelectItem>}
            {draft.role === 'superadmin' && <SelectItem value="superadmin">{isHe ? ROLE_LABEL.superadmin.he : ROLE_LABEL.superadmin.en}</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {isHe ? 'נרשם בתאריך' : 'Registered'}: {registeredAt}
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onSave(draft)} data-testid={`button-save-user-${user.id}`}>
            <Save className="h-4 w-4 me-1" />
            {isHe ? 'שמור' : 'Save'}
          </Button>
          {canDelete && (
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete} data-testid={`button-delete-user-${user.id}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
