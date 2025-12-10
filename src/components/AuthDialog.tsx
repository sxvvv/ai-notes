import { useState } from 'react'
import { Lock, X, Check, Eye, EyeOff, Mail } from 'lucide-react'
import { signInWithEmail, signUpWithEmail } from '../lib/supabase'

interface AuthDialogProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AuthDialog({ onSuccess, onCancel }: AuthDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim()) {
      setError('请输入邮箱')
      return
    }
    
    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少为6位')
      return
    }

    setIsLoading(true)
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
        setError('注册成功！请检查邮箱验证链接（如果启用了邮箱验证）')
        // 注册后自动登录
        setTimeout(async () => {
          try {
            await signInWithEmail(email, password)
            onSuccess()
          } catch (err: any) {
            setError(err.message || '登录失败')
          }
        }, 1000)
      } else {
        await signInWithEmail(email, password)
        onSuccess()
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || '登录失败，请检查邮箱和密码')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl border border-border-subtle w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {isSignUp ? '注册账号' : '登录以获取编辑权限'}
              </h3>
              <p className="text-xs text-text-muted">
                {isSignUp ? '创建账号以编辑笔记' : '请输入邮箱和密码登录'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-bg-elevated rounded-lg transition-colors text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              邮箱
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="your@email.com"
                className="w-full px-4 py-3 pl-10 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
                autoFocus
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="请输入密码（至少6位）"
                className="w-full px-4 py-3 pr-12 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
                disabled={isLoading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-bg-elevated rounded transition-colors text-text-muted"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-sm text-error mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>验证中...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>确认</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-bg-base hover:bg-bg-elevated text-text-secondary rounded-lg transition-colors border border-border-subtle"
            >
              取消
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-xs text-accent-primary hover:text-accent-hover transition-colors"
            >
              {isSignUp ? '已有账号？点击登录' : '没有账号？点击注册'}
            </button>
            <p className="text-xs text-text-muted mt-2">
              💡 只有登录的用户才能创建、修改和删除笔记
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

