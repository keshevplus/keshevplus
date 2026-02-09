import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/hooks/useLanguage'
import { useLocation } from 'wouter'
import { cn } from '@/lib/utils'
import { Shield, Info } from 'lucide-react'

const STORAGE_KEY = 'kp_cookies_accepted'

const CookiesBanner = () => {
  const { language, isRTL } = useLanguage()
  const isHe = language === 'he'
  const [location] = useLocation()
  const [accepted, setAccepted] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setAccepted(false)
      }
    } catch {
      setAccepted(false)
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {}
    setAccepted(true)
  }

  if (accepted || location.startsWith('/admin')) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4"
      dir={isHe ? 'rtl' : 'ltr'}
      data-testid="cookies-banner"
    >
      <Card className="max-w-4xl mx-auto p-4 sm:p-5 shadow-lg border">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm leading-relaxed">
                {isHe
                  ? 'אתר זה משתמש בעוגיות (cookies) לשיפור חווית הגלישה ולמטרות סטטיסטיות. בהמשך הגלישה באתר, הנך מסכים/ה לשימוש בעוגיות בהתאם למדיניות הפרטיות שלנו.'
                  : 'This website uses cookies to improve your browsing experience and for statistical purposes. By continuing to browse the site, you agree to the use of cookies in accordance with our privacy policy.'}
              </p>
              {showDetails && (
                <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
                  <p>
                    {isHe
                      ? 'העוגיות המשמשות באתר זה כוללות:'
                      : 'The cookies used on this site include:'}
                  </p>
                  <ul className={cn("list-disc space-y-0.5", isHe ? "pr-4" : "pl-4")}>
                    <li>
                      {isHe
                        ? 'עוגיות הכרחיות - לתפקוד תקין של האתר'
                        : 'Essential cookies - for proper site functionality'}
                    </li>
                    <li>
                      {isHe
                        ? 'עוגיות סטטיסטיות - לניתוח שימוש ושיפור השירות'
                        : 'Statistical cookies - for usage analysis and service improvement'}
                    </li>
                    <li>
                      {isHe
                        ? 'עוגיות העדפות - לשמירת העדפות המשתמש'
                        : 'Preference cookies - to save user preferences'}
                    </li>
                  </ul>
                  <p>
                    {isHe
                      ? 'בהתאם לחוק הגנת הפרטיות, אנו מיידעים אותך על השימוש בעוגיות ומבקשים את הסכמתך.'
                      : 'In accordance with the Privacy Protection Act, we inform you about the use of cookies and request your consent.'}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className={cn("flex items-center gap-2 flex-wrap", isHe ? "justify-start" : "justify-end")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              data-testid="button-cookies-more-info"
            >
              <Info className="h-4 w-4" />
              <span className="ms-1">
                {showDetails
                  ? (isHe ? 'הסתר פרטים' : 'Hide Details')
                  : (isHe ? 'מידע נוסף' : 'More Info')}
              </span>
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              data-testid="button-cookies-accept"
            >
              {isHe ? 'אני מסכים/ה' : 'Accept'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CookiesBanner
