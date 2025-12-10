import { useState } from 'react'
import { Sparkles, X, Copy, Check, Loader2, Zap } from 'lucide-react'
import { MarkdownPreview } from './MarkdownPreview'
import { generateFormula } from '../lib/ai'

interface FormulaAssistantProps {
  onInsert: (formula: string, isBlock: boolean) => void
  onClose: () => void
}

// 示例公式模板（如果 AI API 不可用时的备选方案）
const formulaExamples: Record<string, string> = {
  '二次方程': 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
  '欧拉公式': 'e^{i\\pi} + 1 = 0',
  '勾股定理': 'a^2 + b^2 = c^2',
  '积分': '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
  '求和': '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
  '矩阵': '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
  '导数': '\\frac{d}{dx}f(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}',
  '梯度下降': '\\theta_{t+1} = \\theta_t - \\alpha \\nabla_\\theta J(\\theta_t)',
}

export function FormulaAssistant({ onInsert, onClose }: FormulaAssistantProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [isBlock, setIsBlock] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 调用 AI API 生成公式
  const handleGenerateFormula = async (description: string) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // 先尝试使用模板匹配（快速响应）
      const lowerDesc = description.toLowerCase()
      for (const [key, formula] of Object.entries(formulaExamples)) {
        if (lowerDesc.includes(key.toLowerCase()) || description.includes(key)) {
          setResult(formula)
          setIsLoading(false)
          return
        }
      }

      // 调用 AI API
      const response = await generateFormula(description)
      
      if (response.error) {
        setError(response.error)
        return
      }

      if (response.content) {
        // 清理可能的 markdown 代码块标记
        const cleanFormula = response.content
          .replace(/```latex?/g, '')
          .replace(/```/g, '')
          .replace(/^\$\$?|\$\$?$/g, '')
          .trim()
        
        if (cleanFormula) {
          setResult(cleanFormula)
        } else {
          setError('未能生成公式，请尝试更详细的描述')
        }
      } else {
        setError('未能生成公式，请尝试更详细的描述')
      }
    } catch (err: any) {
      console.error('AI 公式生成错误:', err)
      setError(err.message || '生成公式失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleGenerateFormula(input.trim())
  }

  const handleInsert = () => {
    if (result) {
      onInsert(result, isBlock)
      onClose()
    }
  }

  const handleCopy = () => {
    if (result) {
      const formula = isBlock ? `$$\n${result}\n$$` : `$${result}$`
      navigator.clipboard.writeText(formula)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl border border-border-subtle w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">AI 公式助手</h3>
              <p className="text-xs text-text-muted">用自然语言描述，AI 帮你生成 LaTeX 公式</p>
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
          {/* Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                描述你想要的公式
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例如：二次方程的求根公式、欧拉公式、梯度下降更新规则..."
                className="w-full px-4 py-3 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBlock}
                  onChange={(e) => setIsBlock(e.target.checked)}
                  className="w-4 h-4 rounded border-border-subtle text-accent-primary focus:ring-accent-primary"
                />
                <span className="text-sm text-text-secondary">块级公式（独立一行）</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI 正在生成...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>生成公式</span>
                </>
              )}
            </button>
          </form>

          {/* Examples */}
          <div>
            <p className="text-xs text-text-muted mb-2">快速示例：</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(formulaExamples).slice(0, 6).map(key => (
                <button
                  key={key}
                  onClick={() => {
                    setInput(key)
                    handleGenerateFormula(key)
                  }}
                  className="px-3 py-1.5 text-xs bg-bg-base hover:bg-bg-elevated border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                  disabled={isLoading}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">生成的公式：</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-bg-base hover:bg-bg-elevated border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
              </div>
              
              {/* LaTeX Code */}
              <div className="p-4 bg-bg-base rounded-lg border border-border-subtle">
                <code className="text-sm font-mono text-accent-primary break-all">
                  {isBlock ? `$$\n${result}\n$$` : `$${result}$`}
                </code>
              </div>

              {/* Preview */}
              <div className="p-4 bg-bg-base rounded-lg border border-border-subtle">
                <p className="text-xs text-text-muted mb-2">预览：</p>
                <div className="min-h-[60px]">
                  <MarkdownPreview 
                    content={isBlock ? `$$\n${result}\n$$` : `这是行内公式：$${result}$ 的效果`}
                  />
                </div>
              </div>

              {/* Insert Button */}
              <button
                onClick={handleInsert}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                插入到编辑器
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

