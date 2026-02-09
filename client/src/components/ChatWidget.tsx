import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MessageCircle, X, Send, Bot, User, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface VisitorInfo {
  name: string
  email: string
  phone: string
}

type BubbleState = 'bar' | 'icon' | 'hidden'

const ChatWidget = () => {
  const { language, isRTL } = useLanguage()
  const isHe = language === 'he'
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null)
  const [infoForm, setInfoForm] = useState<VisitorInfo>({ name: '', email: '', phone: '' })
  const [submittingInfo, setSubmittingInfo] = useState(false)
  const [bubbleState, setBubbleState] = useState<BubbleState>(() => {
    try {
      const saved = localStorage.getItem('kp_chat_bubble')
      if (saved === 'icon' || saved === 'hidden') return saved
    } catch {}
    return 'bar'
  })
  const [barVisible, setBarVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    } else if (bubbleState === 'icon') {
      setBubbleState('hidden')
      try { localStorage.setItem('kp_chat_bubble', 'hidden') } catch {}
    }
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          language,
          conversationId,
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
            ? 'מצטער, אירעה שגיאה. אנא נסו שוב.'
            : 'Sorry, an error occurred. Please try again.',
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

  if (bubbleState === 'hidden' && !open) return null

  if (!open) {
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

        <div className="relative">
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

          {bubbleState === 'icon' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDismiss() }}
              className={cn(
                "absolute -top-1 z-20 h-5 w-5 rounded-full",
                "bg-muted border border-border",
                "flex items-center justify-center",
                "text-muted-foreground hover:text-foreground transition-colors",
                isRTL ? "-right-1" : "-right-1"
              )}
              aria-label={isHe ? 'הסתר צ׳אט' : 'Hide chat'}
              data-testid="button-hide-chat-icon"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "fixed z-[9998] w-80 sm:w-96 h-[28rem] flex flex-col shadow-xl",
        isRTL ? "left-5" : "right-5"
      )}
      style={{ bottom: '5rem' }}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between gap-2 p-3 border-b bg-primary text-primary-foreground rounded-t-md">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-medium text-sm">
            {isHe ? 'עוזר וירטואלי - קשב פלוס' : 'KeshevPlus Assistant'}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-primary-foreground hover:text-primary-foreground/80"
          onClick={() => setOpen(false)}
          data-testid="button-close-chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!visitorInfo ? (
        <div className="flex-1 flex flex-col justify-center p-4 space-y-3">
          <div className="text-center space-y-2 mb-2">
            <Bot className="h-10 w-10 mx-auto text-primary/50" />
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
            className="text-sm"
            data-testid="input-chat-name"
          />
          <Input
            value={infoForm.email}
            onChange={(e) => setInfoForm(prev => ({ ...prev, email: e.target.value }))}
            onKeyDown={handleInfoKeyDown}
            placeholder={isHe ? 'אימייל *' : 'Email *'}
            type="email"
            className="text-sm"
            data-testid="input-chat-email"
          />
          <Input
            value={infoForm.phone}
            onChange={(e) => setInfoForm(prev => ({ ...prev, phone: e.target.value }))}
            onKeyDown={handleInfoKeyDown}
            placeholder={isHe ? 'טלפון (אופציונלי)' : 'Phone (optional)'}
            type="tel"
            className="text-sm"
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
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm pt-8 space-y-2">
                <Bot className="h-10 w-10 mx-auto text-primary/50" />
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
                  <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[75%] text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
                </div>
                {msg.role === 'user' && (
                  <div className="shrink-0 h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isHe ? 'הקלידו הודעה...' : 'Type a message...'}
                disabled={loading}
                className="text-sm"
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
    </Card>
  )
}

export default ChatWidget
