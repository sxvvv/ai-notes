import { useState, useEffect } from 'react'
import { Sparkles, X, Check, Loader2, Lightbulb, Wand2 } from 'lucide-react'
import { getWritingSuggestion } from '../lib/ai'

interface WritingAssistantProps {
  selectedText: string
  fullContent: string
  onInsert: (text: string) => void
  onClose: () => void
}

export function WritingAssistant({ selectedText: initialSelectedText, fullContent, onInsert, onClose }: WritingAssistantProps) {
  const [inputText, setInputText] = useState(initialSelectedText)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'improve' | 'expand' | 'summarize' | 'explain'>('improve')

  // 当外部传入的 selectedText 变化时更新
  useEffect(() => {
    if (initialSelectedText) {
      setInputText(initialSelectedText)
    }
  }, [initialSelectedText])

  const handleGetSuggestion = async () => {
    if (!inputText.trim()) {
      setError('请先选中要处理的文字，或直接在输入框中输入内容')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuggestion(null)

    try {
      let prompt = ''
      const context = fullContent.length > 500 ? fullContent.substring(0, 500) + '...' : fullContent

      // 直接传递模式和文本，让 API 函数处理 prompt 构建
      const response = await getWritingSuggestion(inputText, context, mode)

      if (response.error) {
        setError(response.error)
        return
      }

      // 确保 content 是字符串
      let content: any = response.content
      
      // 如果 content 是对象，尝试提取字符串
      if (content && typeof content !== 'string') {
        console.warn('content 不是字符串，尝试转换:', content)
        if (content && typeof content === 'object') {
          // 尝试从对象中提取文本
          const obj = content as any
          if (obj.text) {
            content = String(obj.text)
          } else if (obj.message) {
            content = String(obj.message)
          } else if (obj.content) {
            content = String(obj.content)
          } else {
            content = JSON.stringify(obj)
          }
        } else {
          content = String(content || '')
        }
      }
      
      // 最终确保是字符串
      const finalContent = typeof content === 'string' ? content : String(content || '')
      
      if (finalContent && finalContent.trim()) {
        setSuggestion(finalContent.trim())
      } else {
        setError('未能生成建议，API 返回的数据格式不正确')
        console.error('API 返回的 content 格式错误:', {
          originalContent: response.content,
          finalContent,
          type: typeof response.content,
          response
        })
      }
    } catch (err: any) {
      console.error('AI 写作建议错误:', err)
      setError(err.message || '获取建议失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsert = () => {
    if (suggestion) {
      onInsert(suggestion)
      onClose()
    }
  }

  const modes = [
    { id: 'improve' as const, label: '改进', icon: <Wand2 className="w-4 h-4" />, desc: '优化表达和结构' },
    { id: 'expand' as const, label: '扩展', icon: <Sparkles className="w-4 h-4" />, desc: '添加更多细节' },
    { id: 'summarize' as const, label: '总结', icon: <Check className="w-4 h-4" />, desc: '提取关键要点' },
    { id: 'explain' as const, label: '解释', icon: <Lightbulb className="w-4 h-4" />, desc: '使内容更易理解' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl border border-border-subtle w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">AI 写作助手</h3>
              <p className="text-xs text-text-muted">获取写作建议和改进意见</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-elevated rounded-lg transition-colors text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Selected Text or Input */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              {initialSelectedText ? '选中的内容（可编辑）：' : '输入要处理的内容：'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value)
                setError(null)
                setSuggestion(null)
              }}
              placeholder={initialSelectedText 
                ? "选中的内容已自动填入，你可以直接编辑或使用原内容..." 
                : "💡 提示：请先在编辑器中选中文字，然后点击 AI 写作按钮。或者直接在这里输入要处理的内容..."}
              className="w-full p-3 bg-bg-base rounded-lg border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 resize-none"
              rows={4}
              autoFocus={!initialSelectedText}
            />
            {!initialSelectedText && (
              <p className="text-xs text-text-muted mt-2">
                💡 建议：在编辑器中选中文字后点击 AI 写作按钮，这样更快捷
              </p>
            )}
          </div>

          {/* Mode Selection */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              选择功能：
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id)
                    setSuggestion(null)
                    setError(null)
                  }}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    mode === m.id
                      ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                      : 'bg-bg-base border-border-subtle text-text-secondary hover:border-border-moderate'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {m.icon}
                    <span className="text-sm font-medium">{m.label}</span>
                  </div>
                  <p className="text-xs text-text-muted">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGetSuggestion}
            disabled={!inputText.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI 正在思考...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{modes.find(m => m.id === mode)?.label}内容</span>
              </>
            )}
          </button>
          
          {!inputText.trim() && (
            <p className="text-xs text-text-muted text-center">
              💡 提示：在编辑器中选中文字后点击 AI 写作按钮，或直接在上方输入框中输入内容
            </p>
          )}

          {/* Suggestion */}
          {suggestion && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">AI 建议：</span>
              </div>
              
              <div className="p-4 bg-bg-base rounded-lg border border-border-subtle">
                <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{suggestion}</p>
              </div>

              {/* Insert Button */}
              <button
                onClick={handleInsert}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                替换选中内容
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

