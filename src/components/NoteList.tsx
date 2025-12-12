import { FileText, Trash2, Clock, BookOpen, ArrowRight, Sparkles, FolderOpen, ChevronDown, Move } from 'lucide-react'
import { Note, Category, getCategories, updateNote } from '../lib/supabase'
import { useState, useEffect, useRef } from 'react'

interface NoteListProps {
  notes: Note[]
  selectedNote: Note | null
  onSelectNote: (note: Note) => void
  onDeleteNote: (id: string) => void
  getCategoryById: (id: string | null) => Category | undefined
  canEdit?: boolean
  onNoteUpdate?: (id: string, updates: Partial<Note>) => void
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

export function NoteList({ notes, selectedNote, onSelectNote, onDeleteNote, getCategoryById, canEdit = true, onNoteUpdate }: NoteListProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [showCategorySelect, setShowCategorySelect] = useState<string | null>(null)
  const categorySelectRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const cats = await getCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const rootCategories = categories.filter(c => !c.parent_id)
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId)

  const handleCategoryChange = async (noteId: string, categoryId: string | null) => {
    try {
      await updateNote(noteId, { category_id: categoryId })
      if (onNoteUpdate) {
        onNoteUpdate(noteId, { category_id: categoryId })
      }
      setShowCategorySelect(null)
    } catch (error) {
      console.error('Failed to update note category:', error)
      alert('移动笔记失败')
    }
  }

  // 点击外部关闭分类选择
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(categorySelectRefs.current).forEach(([noteId, ref]) => {
        if (ref && !ref.contains(event.target as Node) && showCategorySelect === noteId) {
          setShowCategorySelect(null)
        }
      })
    }
    if (showCategorySelect) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategorySelect])

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

  return (
    <div className="flex-1 overflow-y-auto bg-bg-base p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">学习笔记</h2>
            <p className="text-sm text-text-muted mt-1">
              共 {notes.length} 篇笔记
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
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <div className="relative" ref={el => categorySelectRefs.current[note.id] = el}>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation()
                            setShowCategorySelect(showCategorySelect === note.id ? null : note.id)
                          }}
                          className="p-2.5 hover:bg-accent-primary/10 hover:text-accent-primary rounded-lg transition-all"
                          title="移动到分类"
                        >
                          <Move className="w-4 h-4" />
                        </button>
                        {showCategorySelect === note.id && (
                          <div className="absolute right-0 top-full mt-1 w-64 bg-bg-elevated border border-border-subtle rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                            <div className="p-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCategoryChange(note.id, null)
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                  note.category_id === null
                                    ? 'bg-accent-primary/10 text-accent-primary'
                                    : 'hover:bg-bg-surface text-text-secondary'
                                }`}
                              >
                                未分类
                              </button>
                              {rootCategories.map(rootCat => {
                                const children = getChildren(rootCat.id)
                                return (
                                  <div key={rootCat.id} className="mt-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCategoryChange(note.id, rootCat.id)
                                      }}
                                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                        note.category_id === rootCat.id
                                          ? 'bg-accent-primary/10 text-accent-primary'
                                          : 'hover:bg-bg-surface text-text-secondary'
                                      }`}
                                    >
                                      {rootCat.name}
                                    </button>
                                    {children.length > 0 && (
                                      <div className="ml-4 mt-1 space-y-0.5">
                                        {children.map(child => (
                                          <button
                                            key={child.id}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleCategoryChange(note.id, child.id)
                                            }}
                                            className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                              note.category_id === child.id
                                                ? 'bg-accent-primary/10 text-accent-primary'
                                                : 'hover:bg-bg-surface text-text-muted'
                                            }`}
                                          >
                                            └ {child.name}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id) }}
                        className="p-2.5 hover:bg-error/10 hover:text-error rounded-lg transition-all"
                        title="删除笔记"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
