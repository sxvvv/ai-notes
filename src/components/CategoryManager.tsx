import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Save, FolderOpen, BookOpen, Server, Wrench, Sparkles, Lock } from 'lucide-react'
import { Category, createCategory, updateCategory, deleteCategory } from '../lib/supabase'

interface CategoryManagerProps {
  categories: Category[]
  onUpdate: () => void
  canEdit?: boolean
}

const ICON_OPTIONS = [
  { value: 'book', icon: <BookOpen className="w-4 h-4" />, label: '书籍' },
  { value: 'server', icon: <Server className="w-4 h-4" />, label: '服务器' },
  { value: 'wrench', icon: <Wrench className="w-4 h-4" />, label: '工具' },
  { value: 'folder', icon: <FolderOpen className="w-4 h-4" />, label: '文件夹' },
  { value: 'sparkles', icon: <Sparkles className="w-4 h-4" />, label: '星星' },
]

export function CategoryManager({ categories, onUpdate, canEdit = true }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null) // 正在为哪个父分类创建子分类
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'folder',
    parent_id: null as string | null,
    sort_order: 0,
  })

  const rootCategories = categories.filter(c => !c.parent_id)
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId)

  const generateSlug = (name: string, parentId: string | null = null): string => {
    let baseSlug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    // 如果是子分类，添加父分类的slug前缀以确保唯一性
    if (parentId) {
      const parent = categories.find(c => c.id === parentId)
      if (parent) {
        baseSlug = `${parent.slug}-${baseSlug}`
      }
    }
    
    // 检查slug是否已存在，如果存在则添加数字后缀
    let slug = baseSlug
    let counter = 1
    while (categories.some(c => c.slug === slug && c.id !== editingId)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    return slug
  }

  const handleCreate = async () => {
    if (!canEdit || !formData.name.trim()) return
    
    const slug = formData.slug || generateSlug(formData.name, formData.parent_id)
    
    try {
      // 如果是创建子分类，计算正确的 sort_order
      let sortOrder = formData.sort_order
      if (formData.parent_id) {
        const siblings = getChildren(formData.parent_id)
        sortOrder = siblings.length + 1
      } else {
        sortOrder = rootCategories.length + 1
      }
      
      await createCategory({
        name: formData.name.trim(),
        slug,
        icon: formData.icon,
        parent_id: formData.parent_id,
        sort_order: sortOrder,
      })
      setIsCreating(false)
      setCreatingParentId(null)
      setFormData({ name: '', slug: '', icon: 'folder', parent_id: null, sort_order: 0 })
      onUpdate()
    } catch (error: any) {
      console.error('Failed to create category:', error)
      const errorMessage = error?.message || '创建分类失败'
      if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
        alert('分类名称或标识已存在，请使用其他名称')
      } else {
        alert(`创建分类失败：${errorMessage}`)
      }
    }
  }

  const handleUpdate = async (id: string) => {
    if (!canEdit || !formData.name.trim()) return
    
    try {
      const category = categories.find(c => c.id === id)
      const slug = formData.slug || generateSlug(formData.name, category?.parent_id || null)
      await updateCategory(id, {
        name: formData.name.trim(),
        slug,
        icon: formData.icon,
        sort_order: formData.sort_order,
      })
      setEditingId(null)
      setFormData({ name: '', slug: '', icon: 'folder', parent_id: null, sort_order: 0 })
      onUpdate()
    } catch (error: any) {
      console.error('Failed to update category:', error)
      const errorMessage = error?.message || '更新分类失败'
      if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
        alert('分类名称或标识已存在，请使用其他名称')
      } else {
        alert(`更新分类失败：${errorMessage}`)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!canEdit || !confirm('确定要删除这个分类吗？该分类下的笔记将变为未分类。')) return
    
    try {
      await deleteCategory(id)
      onUpdate()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('删除分类失败')
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || 'folder',
      parent_id: category.parent_id,
      sort_order: category.sort_order,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setCreatingParentId(null)
    setFormData({ name: '', slug: '', icon: 'folder', parent_id: null, sort_order: 0 })
  }

  const startCreateSubcategory = (parentId: string) => {
    setCreatingParentId(parentId)
    setIsCreating(true)
    setFormData({ 
      name: '', 
      slug: '', 
      icon: 'folder', 
      parent_id: parentId, 
      sort_order: getChildren(parentId).length + 1 
    })
  }

  return (
    <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl p-6 border border-border-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">笔记分类管理</h3>
        {canEdit && (
          <button
            onClick={() => {
              setIsCreating(true)
              setFormData({ name: '', slug: '', icon: 'folder', parent_id: null, sort_order: rootCategories.length + 1 })
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            新建分类
          </button>
        )}
      </div>

      {/* 创建顶级分类表单 */}
      {isCreating && !creatingParentId && (
        <div className="mb-4 p-4 bg-bg-base rounded-lg border border-border-subtle">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">分类名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value, formData.parent_id) })
                }}
                placeholder="例如：机器学习"
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">图标</label>
              <div className="flex gap-2 flex-wrap">
                {ICON_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, icon: option.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      formData.icon === option.value
                        ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                        : 'bg-bg-surface border-border-subtle text-text-secondary hover:border-border-moderate'
                    }`}
                  >
                    {option.icon}
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-bg-surface hover:bg-bg-elevated text-text-secondary rounded-lg transition-colors border border-border-subtle"
              >
                <X className="w-4 h-4" />
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分类列表 */}
      <div className="space-y-2">
        {rootCategories.map(category => {
          const children = getChildren(category.id)
          const isEditing = editingId === category.id
          const iconOption = ICON_OPTIONS.find(opt => opt.value === (category.icon || 'folder'))
          
          return (
            <div key={category.id} className="p-3 bg-bg-base rounded-lg border border-border-subtle">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">分类名称</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })
                      }}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">图标</label>
                    <div className="flex gap-2 flex-wrap">
                      {ICON_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, icon: option.value })}
                          className={`p-2 rounded-lg border transition-colors ${
                            formData.icon === option.value
                              ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                              : 'bg-bg-surface border-border-subtle text-text-secondary'
                          }`}
                        >
                          {option.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(category.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-colors text-sm"
                    >
                      <Save className="w-3 h-3" />
                      保存
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface hover:bg-bg-elevated text-text-secondary rounded-lg transition-colors text-sm border border-border-subtle"
                    >
                      <X className="w-3 h-3" />
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-accent-primary">{iconOption?.icon || <FolderOpen className="w-4 h-4" />}</span>
                      <div>
                        <div className="font-medium text-text-primary">{category.name}</div>
                        {children.length > 0 && (
                          <div className="text-xs text-text-muted mt-0.5">
                            {children.length} 个子主题
                          </div>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startCreateSubcategory(category.id)}
                          className="p-2 hover:bg-accent-primary/10 rounded-lg transition-colors text-text-secondary hover:text-accent-primary"
                          title="添加子主题"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 hover:bg-bg-elevated rounded-lg transition-colors text-text-secondary hover:text-accent-primary"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 hover:bg-error/10 rounded-lg transition-colors text-text-secondary hover:text-error"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* 正在为此分类创建子分类的表单 */}
                  {creatingParentId === category.id && (
                    <div className="mt-3 ml-7 p-3 bg-bg-surface rounded-lg border border-border-subtle">
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-text-secondary mb-1 block">子主题名称</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })
                            }}
                            placeholder="例如：计算机基础"
                            className="w-full px-2 py-1.5 text-sm bg-bg-base border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCreate}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-colors text-sm"
                          >
                            <Save className="w-3 h-3" />
                            保存
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-base hover:bg-bg-elevated text-text-secondary rounded-lg transition-colors text-sm border border-border-subtle"
                          >
                            <X className="w-3 h-3" />
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 子分类列表 */}
                  {children.length > 0 && !isEditing && (
                    <div className="mt-2 ml-7 pl-4 border-l border-border-subtle space-y-1.5">
                      {children.map((child, index) => {
                        const isChildEditing = editingId === child.id
                        return (
                          <div key={child.id} className="py-1.5">
                            {isChildEditing ? (
                              <div className="space-y-2 p-2 bg-bg-surface rounded border border-border-subtle">
                                <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value, child.parent_id) })
                                  }}
                                  className="w-full px-2 py-1.5 text-sm bg-bg-base border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdate(child.id)}
                                    className="flex items-center gap-1 px-2 py-1 bg-accent-primary hover:bg-accent-hover text-white rounded text-xs"
                                  >
                                    <Save className="w-3 h-3" />
                                    保存
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="flex items-center gap-1 px-2 py-1 bg-bg-base hover:bg-bg-elevated text-text-secondary rounded text-xs border border-border-subtle"
                                  >
                                    <X className="w-3 h-3" />
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group">
                                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                                  {child.name}
                                </span>
                                {canEdit && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => startEdit(child)}
                                      className="p-1.5 hover:bg-bg-elevated rounded transition-colors text-text-muted hover:text-accent-primary"
                                      title="编辑"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(child.id)}
                                      className="p-1.5 hover:bg-error/10 rounded transition-colors text-text-muted hover:text-error"
                                      title="删除"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
        
        {rootCategories.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>还没有分类，点击"新建分类"开始创建</p>
          </div>
        )}
      </div>
    </div>
  )
}

