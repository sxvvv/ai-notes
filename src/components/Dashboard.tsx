import { BookOpen, CheckCircle, Clock, TrendingUp, FileText, Sparkles, Target, BarChart3 } from 'lucide-react'
import { Note, Category } from '../lib/supabase'
import { ContributionGraph } from './ContributionGraph'

interface DashboardProps {
  notes: Note[]
  categories: Category[]
  onSelectNote: (note: Note) => void
  onNewNote: () => void
  getCategoryById: (id: string | null) => Category | undefined
}

export function Dashboard({ notes, categories, onSelectNote, onNewNote, getCategoryById }: DashboardProps) {
  const totalNotes = notes.length
  const recentNotes = [...notes].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 5)
  
  // 计算每日记录统计
  const today = new Date().toISOString().split('T')[0]
  const todayNotes = notes.filter(n => n.created_at.startsWith(today)).length
  const thisWeekNotes = notes.filter(n => {
    const noteDate = new Date(n.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return noteDate >= weekAgo
  }).length
  const thisMonthNotes = notes.filter(n => {
    const noteDate = new Date(n.created_at)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return noteDate >= monthAgo
  }).length
  
  // 按分类统计
  const categoryStats = categories.map(cat => {
    const count = notes.filter(n => n.category_id === cat.id).length
    const completed = notes.filter(n => n.category_id === cat.id && n.is_completed).length
    return { ...cat, count, completed, progress: count > 0 ? Math.round((completed / count) * 100) : 0 }
  }).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count)

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffMins < 1) return '刚刚'
      if (diffMins < 60) return `${diffMins}分钟前`
      if (diffHours < 24) return `${diffHours}小时前`
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    } catch {
      return '最近'
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg-base p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">学习仪表板</h1>
            <p className="text-text-muted">记录你的学习轨迹</p>
          </div>
          <button
            onClick={onNewNote}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-primary to-blue-600 hover:from-accent-hover hover:to-blue-500 text-white rounded-lg transition-all shadow-lg shadow-accent-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>新建笔记</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Total Notes */}
          <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl p-4 md:p-5 border border-border-subtle">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-text-primary mb-1">{totalNotes}</div>
            <div className="text-xs md:text-sm text-text-muted">总笔记数</div>
          </div>

          {/* Today Notes */}
          <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl p-4 md:p-5 border border-border-subtle">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-accent-primary" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-text-primary mb-1">{todayNotes}</div>
            <div className="text-xs md:text-sm text-text-muted">今日记录</div>
          </div>

          {/* This Week Notes */}
          <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl p-4 md:p-5 border border-border-subtle">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-text-primary mb-1">{thisWeekNotes}</div>
            <div className="text-xs md:text-sm text-text-muted">本周记录</div>
          </div>

          {/* This Month Notes */}
          <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl p-4 md:p-5 border border-border-subtle">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-text-primary mb-1">{thisMonthNotes}</div>
            <div className="text-xs md:text-sm text-text-muted">本月记录</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Contribution Graph */}
          <div className="lg:col-span-2">
            <ContributionGraph notes={notes} />
          </div>

          {/* Recent Notes */}
          <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl p-6 border border-border-subtle">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-accent-primary" />
              <h2 className="text-xl font-semibold text-text-primary">最近笔记</h2>
            </div>
            
            {recentNotes.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm text-text-muted">还没有笔记</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotes.map(note => {
                  const category = getCategoryById(note.category_id)
                  return (
                    <button
                      key={note.id}
                      onClick={() => onSelectNote(note)}
                      className="w-full text-left p-3 rounded-lg bg-bg-base hover:bg-bg-elevated border border-border-subtle hover:border-accent-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors line-clamp-1">
                          {note.title}
                        </h4>
                        {note.is_completed && (
                          <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        )}
                      </div>
                      {category && (
                        <div className="text-xs text-text-muted mb-1">{category.name}</div>
                      )}
                      <div className="text-xs text-text-muted">{formatDate(note.updated_at)}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Category Stats */}
        {categoryStats.length > 0 && (
          <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl p-6 border border-border-subtle">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-accent-primary" />
              <h2 className="text-xl font-semibold text-text-primary">分类统计</h2>
            </div>
            
            <div className="space-y-3">
              {categoryStats.slice(0, 6).map(stat => (
                <div key={stat.id} className="flex items-center justify-between p-3 bg-bg-base rounded-lg border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-primary">{stat.name}</span>
                    <span className="text-xs text-text-muted">({stat.count}篇)</span>
                  </div>
                  <div className="text-sm text-accent-primary font-semibold">{stat.count} 条记录</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

