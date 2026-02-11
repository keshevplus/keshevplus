import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Bot, User, ArrowRight } from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'
import { useLanguage } from '@/hooks/useLanguage'
import { useLocation } from 'wouter'
import { cn } from '@/lib/utils'

const CLINIC_WHATSAPP = '972552739927'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface VisitorInfo {
  name: string
  email: string
  phone: string
}

type BubbleState = 'bar' | 'icon'

const VISITOR_STORAGE_KEY = 'kp_visitor_info'
const VISITOR_COOKIE_NAME = 'kp_visitor'

function setVisitorCookie(info: VisitorInfo) {
  try {
    const value = encodeURIComponent(JSON.stringify(info))
    const maxAge = 90 * 24 * 60 * 60
    document.cookie = `${VISITOR_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
  } catch {}
}

function clearVisitorCookie() {
  document.cookie = `${VISITOR_COOKIE_NAME}=; path=/; max-age=0`
}

const ChatWidget = () => {
  const { language, isRTL } = useLanguage()
  const isHe = language === 'he'
  const [location] = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null)
  const [infoForm, setInfoForm] = useState<VisitorInfo>({ name: '', email: '', phone: '' })
  const [submittingInfo, setSubmittingInfo] = useState(false)
  const [restoredVisitor, setRestoredVisitor] = useState(false)
  const [bubbleState, setBubbleState] = useState<BubbleState>(() => {
    try {
      const saved = localStorage.getItem('kp_chat_bubble')
      if (saved === 'icon') return saved
    } catch {}
    return 'bar'
  })
  const [barVisible, setBarVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VISITOR_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as VisitorInfo
        if (parsed.name && parsed.email) {
          setInfoForm(parsed)
          setRestoredVisitor(true)
          setVisitorInfo(parsed)
          setVisitorCookie(parsed)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setBarVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open && visitorInfo && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open, visitorInfo])

  const handleDismiss = () => {
    if (bubbleState === 'bar') {
      setBubbleState('icon')
      try { localStorage.setItem('kp_chat_bubble', 'icon') } catch {}
    }
  }

  const handleClearVisitor = () => {
    try {
      localStorage.removeItem(VISITOR_STORAGE_KEY)
      clearVisitorCookie()
    } catch {}
    setVisitorInfo(null)
    setRestoredVisitor(false)
    setInfoForm({ name: '', email: '', phone: '' })
    setConversationId(null)
    setMessages([])
  }

  const startConversation = async () => {
    if (!infoForm.name.trim() || !infoForm.email.trim()) return
    setSubmittingInfo(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: infoForm.name.trim(),
          visitorEmail: infoForm.email.trim(),
          visitorPhone: infoForm.phone.trim(),
        }),
      })
      if (!res.ok) throw new Error('Failed to start conversation')
      const conversation = await res.json()
      setConversationId(conversation.id)
      setVisitorInfo(infoForm)
      try {
        localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(infoForm))
        setVisitorCookie(infoForm)
        setRestoredVisitor(true)
      } catch {}
    } catch {
      setVisitorInfo(infoForm)
    } finally {
      setSubmittingInfo(false)
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      let currentConversationId = conversationId;

      // If no conversation ID yet (returning visitor who hasn't sent a message this session)
      if (!currentConversationId && visitorInfo) {
        try {
          const convRes = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visitorName: visitorInfo.name.trim(),
              visitorEmail: visitorInfo.email.trim(),
              visitorPhone: visitorInfo.phone?.trim() || '',
            }),
          });
          if (convRes.ok) {
            const conversation = await convRes.json();
            currentConversationId = conversation.id;
            setConversationId(currentConversationId);
          }
        } catch (e) {
          console.error("Failed to auto-create conversation on first message:", e);
        }
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          language,
          conversationId: currentConversationId,
        }),
      })

      if (!res.ok) throw new Error('Chat failed')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let buffer = ''
      let assistantContent = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              assistantContent += data.content
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: isHe
            ? 'שירות הצ\'אט אינו זמין כרגע. ניתן ליצור קשר עם המרפאה בטלפון 055-27-399-27 או דרך טופס יצירת הקשר באתר.'
            : 'Chat service is currently unavailable. Please contact the clinic at 055-27-399-27 or use the contact form on the website.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInfoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      startConversation()
    }
  }

  const isInIframe = () => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  if (location.startsWith('/admin') || isInIframe()) return null

  if (!open) {
    const whatsAppUrl = `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(isHe ? 'שלום, אשמח לקבל מידע על אבחון ADHD' : 'Hello, I would like information about ADHD diagnosis')}`
    return (
      <div
        className={cn(
          "fixed bottom-5 z-[9998] flex items-center gap-0",
          isRTL ? "left-20 flex-row" : "right-5 flex-row"
        )}
        style={{
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          opacity: barVisible ? 1 : 0,
          transform: barVisible ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        {bubbleState === 'bar' && (
          <div
            className={cn(
              "flex items-center gap-2 bg-background border border-border rounded-full py-2 px-4 shadow-md cursor-pointer",
              "transition-all duration-300",
              isRTL ? "ml-[-8px] pl-6" : "mr-[-8px] pr-6"
            )}
            onClick={() => setOpen(true)}
            data-testid="chat-attention-bar"
          >
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {isHe ? 'איך אוכל לעזור?' : 'How can I help?'}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleDismiss() }}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5"
              aria-label={isHe ? 'סגור' : 'Close'}
              data-testid="button-close-chat-bar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 items-center">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "h-11 w-11 rounded-full flex items-center justify-center",
              "bg-[#25D366] border-2 border-[#128C7E]",
              "shadow-[0_2px_8px_rgba(37,211,102,0.35)]",
              "transition-transform duration-200 hover:scale-105",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
            )}
            aria-label="WhatsApp"
            data-testid="button-open-whatsapp"
          >
            <SiWhatsapp className="h-5 w-5 text-white" />
          </a>
          <button
            onClick={() => setOpen(true)}
            className={cn(
              "relative z-10 h-14 w-14 rounded-full flex items-center justify-center",
              "bg-[#F97316] border-2 border-[#16a34a]",
              "shadow-[0_2px_12px_rgba(249,115,22,0.35)]",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
            )}
            aria-label={isHe ? 'פתח צ׳אט' : 'Open chat'}
            data-testid="button-open-chat"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      data-testid="chat-modal-overlay"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "relative z-10 bg-background rounded-xl shadow-2xl flex flex-col",
          "w-full max-w-lg h-[85vh] max-h-[700px]"
        )}
        dir={isHe ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between gap-2 p-4 border-b bg-primary text-primary-foreground rounded-t-xl">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {isHe ? 'עוזר וירטואלי - קשב פלוס' : 'KeshevPlus Assistant'}
              </span>
              {restoredVisitor && visitorInfo && (
                <button
                  onClick={handleClearVisitor}
                  className="text-xs text-primary-foreground/70 hover:text-primary-foreground underline text-start"
                  data-testid="button-not-you"
                >
                  {isHe ? `${visitorInfo.name} - לא אני` : `Not ${visitorInfo.name}?`}
                </button>
              )}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-primary-foreground hover:text-primary-foreground/80"
            onClick={() => setOpen(false)}
            data-testid="button-close-chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!visitorInfo ? (
          <div className="flex-1 flex flex-col justify-center p-6 space-y-3">
            <div className="text-center space-y-2 mb-2">
              <Bot className="h-12 w-12 mx-auto text-primary/50" />
              <p className="text-sm text-muted-foreground">
                {isHe
                  ? 'לפני שנתחיל, אנא מלאו את הפרטים הבאים:'
                  : 'Before we start, please fill in your details:'}
              </p>
            </div>
            <Input
              value={infoForm.name}
              onChange={(e) => setInfoForm(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={handleInfoKeyDown}
              placeholder={isHe ? 'שם מלא *' : 'Full name *'}
              data-testid="input-chat-name"
            />
            <Input
              value={infoForm.email}
              onChange={(e) => setInfoForm(prev => ({ ...prev, email: e.target.value }))}
              onKeyDown={handleInfoKeyDown}
              placeholder={isHe ? 'אימייל *' : 'Email *'}
              type="email"
              data-testid="input-chat-email"
            />
            <Input
              value={infoForm.phone}
              onChange={(e) => setInfoForm(prev => ({ ...prev, phone: e.target.value }))}
              onKeyDown={handleInfoKeyDown}
              placeholder={isHe ? 'טלפון (אופציונלי)' : 'Phone (optional)'}
              type="tel"
              data-testid="input-chat-phone"
            />
            <Button
              onClick={startConversation}
              disabled={!infoForm.name.trim() || !infoForm.email.trim() || submittingInfo}
              className="w-full"
              data-testid="button-start-chat"
            >
              {submittingInfo
                ? (isHe ? 'מתחיל...' : 'Starting...')
                : (isHe ? 'התחל שיחה' : 'Start Chat')}
              <ArrowRight className="h-4 w-4 ms-2" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm pt-8 space-y-2">
                  <Bot className="h-12 w-12 mx-auto text-primary/50" />
                  <p>
                    {isHe
                      ? `שלום ${visitorInfo.name}! אני העוזר הווירטואלי של קשב פלוס. איך אוכל לעזור לכם?`
                      : `Hello ${visitorInfo.name}! I'm the KeshevPlus virtual assistant. How can I help you?`}
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`chat-message-${msg.role}-${i}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%] text-sm whitespace-pre-wrap",
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
                  </div>
                  {msg.role === 'user' && (
                    <div className="shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isHe ? 'הקלידו הודעה...' : 'Type a message...'}
                  disabled={loading}
                  data-testid="input-chat-message"
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  data-testid="button-send-chat"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatWidget
