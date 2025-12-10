import { ChevronRight, ChevronDown, BookOpen, Server, Wrench, FolderOpen, TrendingUp, Sparkles, Target, Settings, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Category } from '../lib/supabase'

interface SidebarProps {
  categories: Category[]
  selectedCategoryId: string | null
  activeView: 'dashboard' | 'list' | 'categories' | 'category'
  onSelectCategory: (id: string | null | 'dashboard' | 'categories') => void
  noteCount: number
  completedCount: number
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// 学习阶段图标映射
const stageIconMap: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  'book': { 
    icon: <BookOpen className="w-4 h-4" />, 
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-emerald-600/10'
  },
  'server': { 
    icon: <Server className="w-4 h-4" />, 
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-blue-600/10'
  },
  'wrench': { 
    icon: <Wrench className="w-4 h-4" />, 
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-orange-600/10'
  },
}

// 学习路径推荐
const learningPath = [
  { stage: '基础补齐', desc: '计算机基础、编程语言', progress: 0 },
  { stage: 'AI基础设施', desc: 'ML框架、推理优化', progress: 0 },
  { stage: '工程实践', desc: '容器化、MLOps', progress: 0 },
]

export function Sidebar({ categories, selectedCategoryId, activeView, onSelectCategory, noteCount, completedCount, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // 默认展开所有根分类
  useEffect(() => {
    const rootIds = categories.filter(c => !c.parent_id).map(c => c.id)
    setExpandedIds(new Set(rootIds))
  }, [categories])

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const rootCategories = categories.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order)
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order)
  
  const progressPercent = noteCount > 0 ? Math.round((completedCount / noteCount) * 100) : 0

  return (
    <aside className={`h-full bg-gradient-to-b from-black to-bg-base flex flex-col shrink-0 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'w-[60px]' : 'w-full'}`}>

      {/* Dashboard & All Notes Buttons */}
      <div className={`p-4 space-y-2 ${isCollapsed ? 'px-2' : ''}`}>
        <button
          onClick={() => onSelectCategory('dashboard')}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all relative group ${
            activeView === 'dashboard' 
              ? 'bg-gradient-to-r from-accent-primary/20 to-accent-primary/5 text-accent-primary border border-accent-primary/30 shadow-lg shadow-accent-primary/10' 
              : 'hover:bg-bg-surface text-text-secondary border border-transparent'
          }`}
          title={isCollapsed ? '仪表板' : ''}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="font-medium">仪表板</span>}
          {isCollapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-bg-elevated text-xs text-text-primary rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              仪表板
            </span>
          )}
        </button>
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all relative group ${
            activeView === 'list' 
              ? 'bg-gradient-to-r from-accent-primary/20 to-accent-primary/5 text-accent-primary border border-accent-primary/30 shadow-lg shadow-accent-primary/10' 
              : 'hover:bg-bg-surface text-text-secondary border border-transparent'
          }`}
          title={isCollapsed ? '全部笔记' : ''}
        >
          <FolderOpen className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <>
          <span className="font-medium">全部笔记</span>
          <span className="ml-auto text-xs bg-bg-elevated px-2 py-0.5 rounded-full">{noteCount}</span>
            </>
          )}
          {isCollapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-bg-elevated text-xs text-text-primary rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              全部笔记 ({noteCount})
            </span>
          )}
        </button>
        <button
          onClick={() => onSelectCategory('categories')}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all relative group ${
            activeView === 'categories' 
              ? 'bg-gradient-to-r from-accent-primary/20 to-accent-primary/5 text-accent-primary border border-accent-primary/30 shadow-lg shadow-accent-primary/10' 
              : 'hover:bg-bg-surface text-text-secondary border border-transparent'
          }`}
          title={isCollapsed ? '笔记分类' : ''}
        >
          <Target className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="font-medium">笔记分类</span>}
          {isCollapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-bg-elevated text-xs text-text-primary rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              笔记分类
            </span>
          )}
        </button>
      </div>
      
      {/* Category Header */}
      {!isCollapsed && (
      <div className="px-4 py-2 flex items-center gap-2">
          <FolderOpen className="w-3 h-3 text-accent-primary" />
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">笔记分类</span>
      </div>
      )}
      
      {/* Category Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        {rootCategories.map((category, index) => {
          const children = getChildren(category.id)
          const hasChildren = children.length > 0
          const isExpanded = expandedIds.has(category.id)
          const isSelected = activeView === 'category' && selectedCategoryId === category.id
          const stageStyle = stageIconMap[category.icon || ''] || { icon: <FolderOpen className="w-4 h-4" />, color: 'text-text-secondary', gradient: 'from-bg-elevated to-bg-surface' }
          
          return (
            <div key={category.id} className="mb-2">
              {/* Stage Header */}
              <div
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2.5 rounded-xl cursor-pointer transition-all group relative ${
                  isSelected 
                    ? `bg-gradient-to-r ${stageStyle.gradient} ${stageStyle.color} border border-current/20 shadow-lg` 
                    : 'hover:bg-bg-surface text-text-secondary'
                }`}
                title={isCollapsed ? category.name : ''}
              >
                {!isCollapsed && (
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleExpand(category.id) }} 
                  className="p-0.5 hover:bg-bg-elevated rounded"
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                )}
                <span className={stageStyle.color}>{stageStyle.icon}</span>
                {!isCollapsed && (
                  <>
                <span className="flex-1 font-medium text-sm">{category.name}</span>
                <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  {index + 1}/3
                </span>
                  </>
                )}
                {isCollapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-bg-elevated text-xs text-text-primary rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {category.name}
                  </span>
                )}
              </div>
              
              {/* Subcategories */}
              {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-4 mt-1 pl-4 border-l-2 border-border-subtle space-y-0.5">
                  {children.map(child => {
                    const isChildSelected = selectedCategoryId === child.id
                    return (
                      <button
                        key={child.id}
                        onClick={() => onSelectCategory(child.id)}
                        className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                          isChildSelected 
                            ? 'bg-accent-primary/10 text-accent-primary font-medium' 
                            : 'hover:bg-bg-surface text-text-muted hover:text-text-secondary'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isChildSelected ? 'bg-accent-primary' : 'bg-text-muted/50'}`} />
                        {child.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      
      {/* Learning Stats Card */}
      {!isCollapsed && (
      <div className="p-4 border-t border-border-subtle">
        <div className="bg-gradient-to-br from-bg-surface to-bg-elevated rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <Sparkles className="w-4 h-4 text-yellow-400" />
                学习记录
            </span>
              <span className="text-lg font-bold text-accent-primary">{noteCount}</span>
          </div>
          
            <div className="space-y-2 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>总记录数</span>
                <span className="text-text-primary font-medium">{noteCount} 条</span>
              </div>
              <div className="flex justify-between">
                <span>分类数量</span>
                <span className="text-text-primary font-medium">{categories.filter(c => !c.parent_id).length} 个</span>
              </div>
          </div>
          </div>
        </div>
      )}
    </aside>
  )
}
