import { Search, Menu, Plus, GraduationCap, Command, Lock, LogOut, User } from 'lucide-react'
import { RefObject } from 'react'

interface NavbarProps {
  onSearch: (query: string) => void
  onToggleSidebar: () => void
  onNewNote: () => void
  searchQuery: string
  searchInputRef?: RefObject<HTMLInputElement>
  canEdit?: boolean
  onRequestEdit?: () => void
  userEmail?: string | null
  onSignOut?: () => void
}

export function Navbar({ onSearch, onToggleSidebar, onNewNote, searchQuery, searchInputRef, canEdit = true, onRequestEdit, userEmail, onSignOut }: NavbarProps) {
  return (
    <header className="h-16 bg-bg-base border-b border-border-subtle flex items-center px-4 gap-4 shrink-0">
      <button 
        onClick={onToggleSidebar}
        className="p-2 hover:bg-bg-elevated rounded-md transition-colors"
        title="切换侧边栏"
      >
        <Menu className="w-5 h-5 text-text-secondary" />
      </button>
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-purple-500 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <span className="text-lg font-semibold text-text-primary">AI-SX 妙妙屋</span>
          <span className="text-xs text-text-muted ml-2">探索 AI 的奇妙世界</span>
        </div>
      </div>
      
      <div className="flex-1 max-w-md mx-auto hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-20 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-text-muted">
            <kbd className="px-1.5 py-0.5 text-xs bg-bg-elevated rounded border border-border-subtle">
              <Command className="w-3 h-3 inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 text-xs bg-bg-elevated rounded border border-border-subtle">K</kbd>
          </div>
        </div>
      </div>
      
      {/* Mobile search button */}
      <div className="sm:hidden">
        <button
          onClick={() => searchInputRef?.current?.focus()}
          className="p-2 hover:bg-bg-elevated rounded-md transition-colors"
          title="搜索笔记"
        >
          <Search className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        {canEdit ? (
          <>
            {userEmail && (
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-muted bg-bg-elevated rounded-lg">
                <User className="w-3 h-3" />
                <span className="hidden md:block max-w-[150px] truncate">{userEmail}</span>
              </div>
            )}
            <button
              onClick={onNewNote}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-primary to-blue-600 hover:from-accent-hover hover:to-blue-500 text-white rounded-lg transition-all shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40"
              title="新建笔记 (Ctrl+N)"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:block">新建笔记</span>
            </button>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-3 py-2 text-text-muted hover:text-text-primary transition-colors"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">退出</span>
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onRequestEdit}
            className="flex items-center gap-2 px-3 py-2 text-xs text-text-muted hover:text-text-primary transition-colors opacity-0 hover:opacity-100 group"
            title="获取编辑权限 (Ctrl+Shift+E)"
          >
            <Lock className="w-3 h-3" />
            <span className="hidden lg:block">Ctrl+Shift+E</span>
          </button>
        )}
      </div>
    </header>
  )
}
