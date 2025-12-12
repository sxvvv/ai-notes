import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Save, Eye, Edit3, Check, Lock, FolderOpen, ChevronDown } from 'lucide-react'
import { Note, Category, getCategories } from '../lib/supabase'
import { MarkdownPreview } from './MarkdownPreview'
import { TagManager } from './TagManager'

interface EditorProps {
  note: Note
  onUpdate: (updates: Partial<Note>) => void
  onClose: () => void
  category?: Category
  canEdit?: boolean
}

export function Editor({ note, onUpdate, onClose, category, canEdit = true }: EditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(note.category_id)
  const [categories, setCategories] = useState<Category[]>([])
  const [showCategorySelect, setShowCategorySelect] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const categorySelectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setSelectedCategoryId(note.category_id)
    setHasChanges(false)
  }, [note.id])

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

  const getCategoryById = (id: string | null) => categories.find(c => c.id === id)
  const rootCategories = categories.filter(c => !c.parent_id)
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId)

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId)
    onUpdate({ category_id: categoryId })
    setShowCategorySelect(false)
  }

  // 点击外部关闭分类选择
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categorySelectRef.current && !categorySelectRef.current.contains(event.target as Node)) {
        setShowCategorySelect(false)
      }
    }
    if (showCategorySelect) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategorySelect])

  useEffect(() => {
    const hasChange = title !== note.title || content !== note.content || selectedCategoryId !== note.category_id
    setHasChanges(hasChange)
  }, [title, content, selectedCategoryId, note])

  const handleSave = useCallback(async () => {
    if (!canEdit || !hasChanges) return
    setIsSaving(true)
    try {
      await onUpdate({ title, content, category_id: selectedCategoryId })
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }, [title, content, selectedCategoryId, hasChanges, onUpdate, canEdit])


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setIsPreviewMode(!isPreviewMode)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, isPreviewMode])

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-base">
      {/* Toolbar */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border-subtle bg-bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-bg-elevated rounded-md transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
          {canEdit ? (
            <div className="relative" ref={categorySelectRef}>
              <button
                onClick={() => setShowCategorySelect(!showCategorySelect)}
                className="flex items-center gap-2 text-xs px-3 py-1.5 bg-bg-elevated hover:bg-bg-surface rounded-lg text-text-secondary hover:text-text-primary transition-colors border border-border-subtle"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{getCategoryById(selectedCategoryId)?.name || '未分类'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCategorySelect ? 'rotate-180' : ''}`} />
              </button>
              {showCategorySelect && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-bg-elevated border border-border-subtle rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedCategoryId === null
                          ? 'bg-accent-primary/10 text-accent-primary'
                          : 'hover:bg-bg-surface text-text-secondary'
                      }`}
                    >
                      未分类
                    </button>
                    {rootCategories.length > 0 && rootCategories.map(rootCat => {
                      const children = getChildren(rootCat.id)
                      return (
                        <div key={rootCat.id} className="mt-1">
                          <button
                            onClick={() => handleCategoryChange(rootCat.id)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                              selectedCategoryId === rootCat.id
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
                                  onClick={() => handleCategoryChange(child.id)}
                                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                    selectedCategoryId === child.id
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
                    {rootCategories.length === 0 && (
                      <div className="px-3 py-2 text-sm text-text-muted text-center">
                        暂无分类
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            category && (
              <span className="text-xs px-2 py-1 bg-bg-elevated rounded text-text-muted">
                {category.name}
              </span>
            )
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted hidden md:block">Ctrl+S 保存 | Ctrl+P 预览</span>
          {canEdit && (
            <>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                  isPreviewMode ? 'bg-accent-primary text-white' : 'hover:bg-bg-elevated text-text-secondary'
                }`}
              >
                {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm">{isPreviewMode ? '编辑' : '预览'}</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                  hasChanges 
                    ? 'bg-accent-primary hover:bg-accent-hover text-white' 
                    : 'bg-bg-elevated text-text-muted cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : hasChanges ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span className="text-sm">{isSaving ? '保存中' : hasChanges ? '保存' : '已保存'}</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Title and Tags */}
      <div className="px-8 pt-6 pb-2 border-b border-border-subtle">
        {canEdit ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="笔记标题"
            className="w-full text-2xl font-semibold bg-transparent text-text-primary placeholder-text-muted outline-none border-none mb-3"
          />
        ) : (
          <h1 className="text-2xl font-semibold text-text-primary mb-3">{title || '无标题笔记'}</h1>
        )}
        <TagManager noteId={note.id} />
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!canEdit ? (
          // 只读模式：直接显示预览
          <div className="h-full overflow-y-auto px-8 py-6">
            <div className="max-w-3xl">
              <MarkdownPreview content={content} />
            </div>
          </div>
        ) : isPreviewMode ? (
          // 编辑模式下的预览
          <div className="h-full overflow-y-auto px-8 py-6">
            <div className="max-w-3xl">
              <MarkdownPreview content={content} />
            </div>
          </div>
        ) : (
          // 编辑模式
          <div className="h-full flex">
            {/* Editor */}
            <div className="flex-1 flex flex-col border-r border-border-subtle">
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`开始编写 Markdown...

支持的语法:
# 标题
**粗体** *斜体*
- 列表项
\`\`\`python
代码块
\`\`\`
$E = mc^2$ (行内公式)
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$ (块级公式)

💡 提示：点击右下角的 AI 助手可以随时对话`}
                  className="editor-textarea h-full"
                />
              </div>
            </div>
            
            {/* Live Preview */}
            <div className="flex-1 border-l border-border-subtle overflow-y-auto bg-bg-surface hidden xl:block">
              <div className="p-6">
                <MarkdownPreview content={content} />
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
