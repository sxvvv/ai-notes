import { useState, useEffect } from 'react'
import { X, Plus, Tag as TagIcon } from 'lucide-react'
import { Tag, getTags, getNoteTags, addTagToNote, removeTagFromNote, createTag } from '../lib/supabase'

interface TagManagerProps {
  noteId: string
  onTagsChange?: () => void
}

const TAG_COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
]

export function TagManager({ noteId, onTagsChange }: TagManagerProps) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [noteTags, setNoteTags] = useState<Tag[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0])

  useEffect(() => {
    loadTags()
  }, [noteId])

  async function loadTags() {
    const [all, current] = await Promise.all([getTags(), getNoteTags(noteId)])
    setAllTags(all)
    setNoteTags(current)
  }

  async function handleAddTag(tagId: string) {
    await addTagToNote(noteId, tagId)
    await loadTags()
    onTagsChange?.()
  }

  async function handleRemoveTag(tagId: string) {
    await removeTagFromNote(noteId, tagId)
    await loadTags()
    onTagsChange?.()
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return
    const tag = await createTag(newTagName.trim(), selectedColor)
    await addTagToNote(noteId, tag.id)
    setNewTagName('')
    await loadTags()
    onTagsChange?.()
  }

  const availableTags = allTags.filter(t => !noteTags.some(nt => nt.id === t.id))

  return (
    <div className="relative">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {noteTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: tag.color + '20', color: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:opacity-70"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
          添加标签
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-bg-overlay border border-border-subtle rounded-lg shadow-lg z-50 p-3">
          {/* Available Tags */}
          {availableTags.length > 0 && (
            <div className="mb-3">
              <span className="text-xs text-text-muted block mb-2">选择标签</span>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    className="px-2 py-0.5 rounded text-xs hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create New Tag */}
          <div>
            <span className="text-xs text-text-muted block mb-2">创建新标签</span>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="标签名称"
                className="flex-1 px-2 py-1 text-sm bg-bg-surface border border-border-subtle rounded outline-none focus:border-accent-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              />
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="px-2 py-1 bg-accent-primary text-white text-sm rounded disabled:opacity-50"
              >
                <TagIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1">
              {TAG_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-5 h-5 rounded-full border-2 ${selectedColor === color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 hover:bg-bg-elevated rounded"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      )}
    </div>
  )
}

// Display-only tag list
export function TagList({ tags }: { tags: Tag[] }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => (
        <span
          key={tag.id}
          className="px-1.5 py-0.5 rounded text-xs"
          style={{ backgroundColor: tag.color + '20', color: tag.color }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  )
}
