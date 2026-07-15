import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react'

type ViewMode = 'login' | 'forgot' | 'reset'

const AdminLogin = () => {
  const params = new URLSearchParams(window.location.search)
  const initialMode: ViewMode = window.location.pathname === '/admin/reset-password' ? 'reset' : 'login'
  const initialEmail = params.get('email') || ''
  const resetToken = params.get('token') || ''
  const [mode, setMode] = useState<ViewMode>(initialMode)
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const resetFeedback = () => {
    setError('')
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetFeedback()

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    }
    
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetFeedback()

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not send reset link')
      } else {
        setMessage(data.message || 'If the email exists, a reset link was sent.')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetFeedback()

    if (!resetToken) {
      setError('Reset link is missing a token. Please request a new link.')
      setLoading(false)
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: resetToken, newPassword: password }),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not reset password')
      } else {
        window.history.replaceState(null, '', '/admin')
        setPassword('')
        setConfirmPassword('')
        setMode('login')
        setMessage('Password updated. You can sign in now.')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const goToLogin = () => {
    window.history.replaceState(null, '', '/admin')
    setMode('login')
    setPassword('')
    setConfirmPassword('')
    resetFeedback()
  }

  const icon = mode === 'login' ? <Lock className="w-6 h-6 text-primary" /> : <KeyRound className="w-6 h-6 text-primary" />
  const title = mode === 'login' ? 'Admin Login' : mode === 'forgot' ? 'Reset Password' : 'Choose New Password'
  const description = mode === 'login'
    ? 'Sign in to access the admin dashboard'
    : mode === 'forgot'
      ? 'Enter your admin email and we will send a secure reset link.'
      : 'Enter your admin email and new password.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {icon}
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={mode === 'login' ? handleSubmit : mode === 'forgot' ? handleForgotPassword : handleResetPassword}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-admin-email"
                />
              </div>
            </div>
            
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'reset' ? 'New password' : 'Password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={mode === 'reset' ? 8 : undefined}
                    data-testid="input-admin-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    data-testid="button-toggle-admin-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                    data-testid="input-admin-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    data-testid="button-toggle-admin-confirm-password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              data-testid={mode === 'login' ? 'button-admin-login' : mode === 'forgot' ? 'button-forgot-password-submit' : 'button-reset-password-submit'}
            >
              {loading
                ? (mode === 'login' ? 'Signing in...' : mode === 'forgot' ? 'Sending...' : 'Updating...')
                : (mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Send Reset Link' : 'Update Password')}
            </Button>

            {mode === 'login' ? (
              <button
                type="button"
                className="w-full text-sm text-primary hover:underline"
                onClick={() => {
                  setMode('forgot')
                  setPassword('')
                  resetFeedback()
                }}
                data-testid="button-forgot-password"
              >
                Forgot password?
              </button>
            ) : (
              <button
                type="button"
                className="mx-auto flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={goToLogin}
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLogin
