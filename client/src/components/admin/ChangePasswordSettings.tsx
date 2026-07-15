import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ChangePasswordSettings() {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { changePassword } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword.length < 6) {
      setError(isHe ? 'הסיסמה החדשה חייבת להכיל לפחות 6 תווים' : 'New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError(isHe ? 'הסיסמאות אינן תואמות' : 'Passwords do not match')
      return
    }

    setSubmitting(true)
    const { error: submitError } = await changePassword(currentPassword, newPassword)
    setSubmitting(false)

    if (submitError) {
      setError(submitError.message)
      return
    }

    setSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'שינוי סיסמה' : 'Change Password'}</CardTitle>
        </div>
        <CardDescription>{isHe ? 'עדכון סיסמת המשתמש המנהל' : 'Update the admin account password'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="current-password">{isHe ? 'סיסמה נוכחית' : 'Current password'}</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="pr-10"
                data-testid="input-settings-current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showCurrent ? (isHe ? 'הסתר סיסמה' : 'Hide password') : (isHe ? 'הצג סיסמה' : 'Show password')}
                data-testid="button-toggle-current-password"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="new-password">{isHe ? 'סיסמה חדשה' : 'New password'}</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="pr-10"
                data-testid="input-settings-new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNew ? (isHe ? 'הסתר סיסמה' : 'Hide password') : (isHe ? 'הצג סיסמה' : 'Show password')}
                data-testid="button-toggle-new-password"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-new-password">{isHe ? 'אימות סיסמה חדשה' : 'Confirm new password'}</Label>
            <Input
              id="confirm-new-password"
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              data-testid="input-settings-confirm-password"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription data-testid="text-settings-password-error">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription data-testid="text-settings-password-success">
                {isHe ? 'הסיסמה עודכנה בהצלחה' : 'Password updated successfully'}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={submitting} className="w-full" data-testid="button-settings-change-password">
            {submitting ? (isHe ? 'מעדכן...' : 'Updating...') : (isHe ? 'עדכון סיסמה' : 'Update Password')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
