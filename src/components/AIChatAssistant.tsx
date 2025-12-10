import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react'
import { chatWithAI } from '../lib/ai'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await chatWithAI(userMessage)
      
      if (response.error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `❌ 错误：${response.error}` 
        }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.content 
        }])
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ 发生错误：${error.message || '未知错误'}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        title="AI 对话助手"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-bg-base animate-pulse" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'}`}>
      <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl border border-border-subtle shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-elevated">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">AI 对话助手</h3>
              <p className="text-xs text-text-muted">随时为你解答问题</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-bg-surface rounded-lg transition-colors text-text-secondary hover:text-text-primary"
              title={isMinimized ? '展开' : '最小化'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                setIsMinimized(false)
                setMessages([])
              }}
              className="p-1.5 hover:bg-bg-surface rounded-lg transition-colors text-text-secondary hover:text-text-primary"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-12 h-12 text-text-muted mb-4 opacity-50" />
                  <p className="text-sm text-text-muted mb-2">👋 你好！我是 AI 助手</p>
                  <p className="text-xs text-text-muted">有什么问题可以随时问我</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-accent-primary text-white'
                          : 'bg-bg-base text-text-primary border border-border-subtle'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-bg-base border border-border-subtle rounded-lg px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-subtle bg-bg-elevated">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题... (Enter 发送, Shift+Enter 换行)"
                  className="flex-1 px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  title="发送 (Enter)"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-2 text-center">
                💡 提示：可以问我任何问题，我会尽力帮助你
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

