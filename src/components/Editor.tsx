import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Save, Eye, Edit3, Check, CheckCircle, Circle, Lock } from 'lucide-react'
import { Note, Category, toggleNoteCompleted } from '../lib/supabase'
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
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isCompleted, setIsCompleted] = useState(note.is_completed)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setIsCompleted(note.is_completed)
    setHasChanges(false)
  }, [note.id])

  useEffect(() => {
    const hasChange = title !== note.title || content !== note.content
    setHasChanges(hasChange)
  }, [title, content, note])

  const handleSave = useCallback(async () => {
    if (!canEdit || !hasChanges) return
    setIsSaving(true)
    try {
      await onUpdate({ title, content })
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }, [title, content, hasChanges, onUpdate, canEdit])

  const handleToggleComplete = async () => {
    const newStatus = !isCompleted
    setIsCompleted(newStatus)
    await toggleNoteCompleted(note.id, newStatus)
    onUpdate({ is_completed: newStatus })
  }


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
          {category && (
            <span className="text-xs px-2 py-1 bg-bg-elevated rounded text-text-muted">
              {category.name}
            </span>
          )}
          <button
            onClick={handleToggleComplete}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
              isCompleted ? 'bg-success/20 text-success' : 'bg-bg-elevated text-text-muted hover:text-text-primary'
            }`}
          >
            {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            {isCompleted ? '已完成' : '标记完成'}
          </button>
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
