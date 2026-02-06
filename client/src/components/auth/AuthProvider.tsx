import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface AuthUser {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@keshevplus.co.il'

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json()
        return null
      })
      .then(data => {
        if (data) setUser(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json()
        return { error: { message: data.error || 'Login failed' } }
      }
      const data = await res.json()
      setUser(data)
      return { error: null }
    } catch (err) {
      return { error: { message: 'Network error' } }
    }
  }

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
