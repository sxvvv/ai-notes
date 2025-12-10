import { FileText, Trash2, Clock, CheckCircle, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { Note, Category } from '../lib/supabase'

interface NoteListProps {
  notes: Note[]
  selectedNote: Note | null
  onSelectNote: (note: Note) => void
  onDeleteNote: (id: string) => void
  getCategoryById: (id: string | null) => Category | undefined
  canEdit?: boolean
}

// 获取分类对应的颜色
const getCategoryColor = (slug: string | undefined): string => {
  if (!slug) return 'bg-bg-elevated text-text-muted'
  if (slug.includes('foundation') || slug.includes('cs-') || slug.includes('programming') || slug.includes('system-design')) {
    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  }
  if (slug.includes('ai-infra') || slug.includes('ml-') || slug.includes('dl-') || slug.includes('inference') || slug.includes('distributed')) {
    return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  }
  if (slug.includes('engineering') || slug.includes('container') || slug.includes('cloud') || slug.includes('monitoring') || slug.includes('mlops')) {
    return 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
  }
  return 'bg-bg-elevated text-text-muted'
}

export function NoteList({ notes, selectedNote, onSelectNote, onDeleteNote, getCategoryById, canEdit = true }: NoteListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const getPreview = (content: string) => {
    const plainText = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*|__/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\$\$?[^$]+\$\$?/g, '[公式]')
      .trim()
    return plainText.slice(0, 120) + (plainText.length > 120 ? '...' : '')
  }

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-purple-500/20 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-accent-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">开始你的学习之旅</h3>
          <p className="text-text-muted mb-6">创建你的第一个学习笔记，记录AI Infra工程师的成长历程</p>
          <div className="flex items-center justify-center gap-2 text-sm text-accent-primary">
            <Sparkles className="w-4 h-4" />
            <span>支持Markdown、LaTeX公式、代码高亮</span>
          </div>
        </div>
      </div>
    )
  }

  const completedNotes = notes.filter(n => n.is_completed)
  const pendingNotes = notes.filter(n => !n.is_completed)

  return (
    <div className="flex-1 overflow-y-auto bg-bg-base p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">学习笔记</h2>
            <p className="text-sm text-text-muted mt-1">
              共 {notes.length} 篇笔记 | {completedNotes.length} 已掌握 | {pendingNotes.length} 学习中
            </p>
          </div>
        </div>
        
        {/* Notes Grid */}
        <div className="grid gap-4">
          {notes.map(note => {
            const category = getCategoryById(note.category_id)
            const parentCategory = category?.parent_id ? getCategoryById(category.parent_id) : null
            const isSelected = selectedNote?.id === note.id
            
            return (
              <article
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={`group relative p-5 bg-bg-surface rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-accent-primary shadow-lg shadow-accent-primary/10 bg-gradient-to-r from-bg-surface to-accent-primary/5' 
                    : 'border border-border-subtle hover:border-border-moderate hover:bg-bg-elevated hover:shadow-lg hover:shadow-black/20'
                }`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-primary to-blue-600 rounded-l-xl" />
                )}
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Category & Status */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {parentCategory && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCategoryColor(parentCategory.slug)}`}>
                          {parentCategory.name}
                        </span>
                      )}
                      {category && !parentCategory && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCategoryColor(category.slug)}`}>
                          {category.name}
                        </span>
                      )}
                      {category && parentCategory && (
                        <>
                          <ArrowRight className="w-3 h-3 text-text-muted" />
                          <span className="text-xs text-text-muted">{category.name}</span>
                        </>
                      )}
                      {note.is_completed && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-success/10 text-success rounded-full font-medium border border-success/20">
                          <CheckCircle className="w-3 h-3" />
                          已掌握
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className={`text-lg font-semibold mb-2 transition-colors ${isSelected ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'}`}>
                      {note.title}
                    </h3>
                    
                    {/* Preview */}
                    <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                      {getPreview(note.content)}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(note.updated_at)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {canEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id) }}
                      className="p-2.5 opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error rounded-lg transition-all"
                      title="删除笔记"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
