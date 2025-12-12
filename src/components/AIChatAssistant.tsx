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
  const [messages, setMessages] = useState<Message[]>(() => {
    // 从localStorage恢复对话历史
    const saved = localStorage.getItem('ai-chat-messages')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('ai-chat-width')
    return saved ? parseInt(saved, 10) : 384 // 默认 384px (w-96)
  })
  const [height, setHeight] = useState(() => {
    const saved = localStorage.getItem('ai-chat-height')
    return saved ? parseInt(saved, 10) : 600 // 默认 600px
  })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeType, setResizeType] = useState<'width' | 'height' | 'both' | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 保存对话历史到localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai-chat-messages', JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // 保存尺寸到localStorage
  useEffect(() => {
    if (width) localStorage.setItem('ai-chat-width', width.toString())
  }, [width])

  useEffect(() => {
    if (height) localStorage.setItem('ai-chat-height', height.toString())
  }, [height])

  // 处理拖拽调整大小
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      if (resizeType === 'width' || resizeType === 'both') {
        // 计算宽度变化：鼠标当前位置 - 初始位置
        const deltaX = e.clientX - resizeStartPos.current.x
        const newWidth = Math.max(320, Math.min(1200, resizeStartPos.current.width + deltaX))
        setWidth(newWidth)
      }
      
      if (resizeType === 'height' || resizeType === 'both') {
        // 计算高度变化：初始位置 - 鼠标当前位置（因为从底部向上拖）
        const deltaY = resizeStartPos.current.y - e.clientY
        const newHeight = Math.max(400, Math.min(window.innerHeight - 100, resizeStartPos.current.height + deltaY))
        setHeight(newHeight)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeType(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeType])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      // 传递历史消息以支持多轮对话
      const response = await chatWithAI(userMessage, undefined, messages)
      
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
    <div 
      ref={containerRef}
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80 h-16' : ''}`}
      style={!isMinimized ? { width: `${width}px`, height: `${height}px` } : {}}
    >
      <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl border border-border-subtle shadow-2xl flex flex-col h-full overflow-hidden relative">
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
                if (confirm('确定要关闭并清空对话历史吗？')) {
                  setIsOpen(false)
                  setIsMinimized(false)
                  setMessages([])
                  localStorage.removeItem('ai-chat-messages')
                }
              }}
              className="p-1.5 hover:bg-bg-surface rounded-lg transition-colors text-text-secondary hover:text-text-primary"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 调整大小的手柄 */}
        {!isMinimized && (
          <>
            {/* 右下角调整大小 */}
            <div
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect()
                  resizeStartPos.current = {
                    x: e.clientX,
                    y: e.clientY,
                    width: rect.width,
                    height: rect.height
                  }
                }
                setIsResizing(true)
                setResizeType('both')
              }}
              className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize hover:bg-accent-primary/30 transition-colors rounded-tl-lg z-20"
              style={{ touchAction: 'none' }}
              title="拖拽调整大小"
            >
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-accent-primary/80" />
            </div>
            {/* 右侧调整宽度 - 增大拖拽区域 */}
            <div
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect()
                  resizeStartPos.current = {
                    x: e.clientX,
                    y: e.clientY,
                    width: rect.width,
                    height: rect.height
                  }
                }
                setIsResizing(true)
                setResizeType('width')
              }}
              className="absolute top-0 right-0 w-4 h-full cursor-ew-resize hover:bg-accent-primary/20 transition-colors z-20"
              style={{ touchAction: 'none' }}
              title="拖拽调整宽度"
            />
            {/* 底部调整高度 - 增大拖拽区域 */}
            <div
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect()
                  resizeStartPos.current = {
                    x: e.clientX,
                    y: e.clientY,
                    width: rect.width,
                    height: rect.height
                  }
                }
                setIsResizing(true)
                setResizeType('height')
              }}
              className="absolute bottom-0 left-0 w-full h-4 cursor-ns-resize hover:bg-accent-primary/20 transition-colors z-20"
              style={{ touchAction: 'none' }}
              title="拖拽调整高度"
            />
          </>
        )}

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
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-text-muted">
                  💡 提示：可以问我任何问题，我会尽力帮助你
                </p>
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('确定要清空对话历史吗？')) {
                        setMessages([])
                        localStorage.removeItem('ai-chat-messages')
                      }
                    }}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors"
                  >
                    清空历史
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

