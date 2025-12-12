import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { NoteList } from './components/NoteList'
import { Editor } from './components/Editor'
import { Navbar } from './components/Navbar'
import { Dashboard } from './components/Dashboard'
import { CategoryManager } from './components/CategoryManager'
import { AuthDialog } from './components/AuthDialog'
import { AIChatAssistant } from './components/AIChatAssistant'
import { useIsMobile } from './hooks/use-mobile'
import { hasEditPermissionSync } from './lib/auth'
import { getCategories, getNotes, createNote, updateNote, deleteNote, searchNotes, Category, Note, getSession, onAuthStateChange, signOut } from './lib/supabase'

type ViewState = 'dashboard' | 'list' | 'edit' | 'read' | 'categories'

function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>('dashboard')
  const [activeView, setActiveView] = useState<'dashboard' | 'list' | 'categories' | 'category'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebar-width')
    return saved ? parseInt(saved, 10) : 256 // 默认 256px (w-64)
  })
  const [isResizing, setIsResizing] = useState(false)
  const [canEdit, setCanEdit] = useState(hasEditPermissionSync())
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeStartX = useRef<number>(0)
  const resizeStartWidth = useRef<number>(0)

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile && (viewState === 'edit' || viewState === 'list')) {
      setIsSidebarOpen(false)
    }
  }, [isMobile, viewState])

  useEffect(() => {
    loadData()
    checkAuth()
    
    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setCanEdit(!!session)
      setUserEmail(session?.user?.email || null)
      if (event === 'SIGNED_OUT') {
        setCanEdit(false)
        setUserEmail(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 侧边栏宽度调整逻辑
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return
      const deltaX = e.clientX - resizeStartX.current
      const newWidth = Math.max(200, Math.min(800, resizeStartWidth.current + deltaX))
      setSidebarWidth(newWidth)
      localStorage.setItem('sidebar-width', newWidth.toString())
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  async function checkAuth() {
    try {
      const { data: { session } } = await getSession()
      setCanEdit(!!session)
      setUserEmail(session?.user?.email || null)
    } catch (error) {
      console.error('Error checking auth:', error)
      setCanEdit(false)
    }
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // Ctrl+N for new note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
        e.preventDefault()
        handleCreateNote()
      }
      // Ctrl+Shift+E for edit permission (hidden shortcut)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setPendingAction(null)
        setShowAuthDialog(true)
      }
      // Escape to close editor or go to dashboard
      if (e.key === 'Escape') {
        if (viewState === 'edit') {
          setViewState('list')
          setSelectedNote(null)
        } else if (viewState === 'list') {
          setViewState('dashboard')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewState])

  async function loadData() {
    try {
      setIsLoading(true)
      const [cats, allNotes] = await Promise.all([getCategories(), getNotes()])
      setCategories(cats)
      setNotes(allNotes)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await searchNotes(query)
      setNotes(results)
    } else {
      const allNotes = await getNotes()
      setNotes(allNotes)
    }
  }

  async function handleCreateNote() {
    if (!canEdit) {
      setPendingAction(() => handleCreateNote)
      setShowAuthDialog(true)
      return
    }

    const newNote = await createNote({
      title: '无标题笔记',
      content: `# 新笔记

开始编写你的学习笔记...

## 支持的功能

- **Markdown语法**: 标题、列表、表格、代码块
- **数学公式**: $E = mc^2$ 行内公式
- **代码高亮**: \`\`\`python 代码块 \`\`\`

## 示例公式

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
`,
      category_id: selectedCategoryId,
    })
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setViewState('edit')
  }

  async function handleUpdateNote(id: string, updates: Partial<Note>) {
    if (!canEdit) {
      setPendingAction(() => () => handleUpdateNote(id, updates))
      setShowAuthDialog(true)
      return
    }

    // Always update updated_at when saving
    const updatesWithTimestamp = { ...updates, updated_at: new Date().toISOString() }
    
    // Handle local state update first
    const updatedNote = { ...notes.find(n => n.id === id)!, ...updatesWithTimestamp }
    setNotes(notes.map(n => n.id === id ? updatedNote : n))
    setSelectedNote(updatedNote)
    
    // Then persist to database (always update when saving)
    await updateNote(id, updatesWithTimestamp)
  }

  async function handleDeleteNote(id: string) {
    if (!canEdit) {
      setPendingAction(() => () => handleDeleteNote(id))
      setShowAuthDialog(true)
      return
    }

    await deleteNote(id)
    setNotes(notes.filter(n => n.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setViewState('list')
    }
  }

  function handleSelectNote(note: Note) {
    setSelectedNote(note)
    // 如果没有编辑权限，进入只读模式
    setViewState(canEdit ? 'edit' : 'read')
  }

  async function handleAuthSuccess() {
    await checkAuth()
    setShowAuthDialog(false)
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setCanEdit(false)
      setUserEmail(null)
      setViewState('dashboard')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  function handleCategorySelect(categoryId: string | null) {
    if (categoryId === 'dashboard') {
      setViewState('dashboard')
      setSelectedCategoryId(null)
      setActiveView('dashboard')
    } else if (categoryId === 'categories') {
      setViewState('categories')
      setSelectedCategoryId(null)
      setActiveView('categories')
    } else if (categoryId === null) {
      setSelectedCategoryId(null)
      setViewState('list')
      setActiveView('list')
    } else {
      setSelectedCategoryId(categoryId)
      setViewState('list')
      setActiveView('category')
    }
  }

  const filteredNotes = selectedCategoryId 
    ? notes.filter(n => n.category_id === selectedCategoryId)
    : notes

  const getCategoryById = (id: string | null) => categories.find(c => c.id === id)

  if (isLoading) {
    return (
      <div className="h-screen bg-bg-base flex items-center justify-center">
        <div className="text-accent-primary animate-pulse">加载中...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-bg-base flex flex-col overflow-hidden">
        <Navbar
          onSearch={handleSearch}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewNote={handleCreateNote}
          searchQuery={searchQuery}
          searchInputRef={searchInputRef}
          canEdit={canEdit}
          onRequestEdit={() => {
            setPendingAction(null)
            setShowAuthDialog(true)
          }}
          userEmail={userEmail}
          onSignOut={handleSignOut}
        />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div 
          ref={sidebarRef}
          className={`
            ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300' : 'relative'}
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : ''}
            ${!isMobile && isResizing ? '' : 'transition-all duration-200'}
          `}
          style={!isMobile ? { width: isSidebarCollapsed ? '60px' : `${sidebarWidth}px` } : {}}
        >
          {isSidebarOpen && (
            <>
              <Sidebar 
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                activeView={activeView}
                onSelectCategory={(id) => {
                  handleCategorySelect(id)
                  if (isMobile) setIsSidebarOpen(false)
                }}
                noteCount={notes.length}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
              {/* 分割线和拖拽调整宽度的手柄 */}
              {!isMobile && (
                <div
                  className="absolute top-0 right-0 w-4 h-full group"
                  style={{ zIndex: 10 }}
                >
                  {/* 拖拽调整宽度区域 - 只在未折叠时可用 */}
                  {!isSidebarCollapsed && (
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        resizeStartX.current = e.clientX
                        resizeStartWidth.current = sidebarWidth
                        setIsResizing(true)
                      }}
                      className="absolute top-0 right-0 w-4 h-full cursor-col-resize hover:bg-accent-primary/20 transition-colors"
                      title="拖拽调整宽度"
                    />
                  )}
                  
                  {/* 分割线和折叠按钮 */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isResizing) {
                        setIsSidebarCollapsed(!isSidebarCollapsed)
                      }
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-16 flex items-center justify-center cursor-pointer hover:bg-accent-primary/10 transition-all rounded"
                    title={isSidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
                  >
                    <div className="w-0.5 h-full bg-border-subtle group-hover:bg-accent-primary transition-colors" />
                    {/* 悬浮时显示的箭头 */}
                    <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {isSidebarCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-accent-primary bg-bg-elevated rounded-full p-0.5 shadow-lg" />
                      ) : (
                        <ChevronLeft className="w-4 h-4 text-accent-primary bg-bg-elevated rounded-full p-0.5 shadow-lg" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {viewState === 'dashboard' ? (
          <Dashboard
            notes={notes}
            categories={categories}
            onSelectNote={handleSelectNote}
            onNewNote={handleCreateNote}
            getCategoryById={getCategoryById}
          />
        ) : viewState === 'categories' ? (
          <div className="flex-1 overflow-y-auto bg-bg-base p-6">
            <div className="max-w-4xl mx-auto">
              <CategoryManager 
                categories={categories} 
                onUpdate={loadData}
                canEdit={canEdit}
              />
            </div>
          </div>
        ) : viewState === 'list' || !selectedNote ? (
          <NoteList
            notes={filteredNotes}
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
            getCategoryById={getCategoryById}
            canEdit={canEdit}
            onNoteUpdate={handleUpdateNote}
          />
        ) : (
          <Editor
            note={selectedNote}
            onUpdate={(updates) => handleUpdateNote(selectedNote.id, updates)}
            onClose={() => { setViewState('list'); setSelectedNote(null) }}
            category={getCategoryById(selectedNote.category_id)}
            canEdit={canEdit}
          />
        )}
      </div>

      {/* Auth Dialog */}
      {showAuthDialog && (
        <AuthDialog
          onSuccess={handleAuthSuccess}
          onCancel={() => {
            setShowAuthDialog(false)
            setPendingAction(null)
          }}
        />
      )}

      {/* AI Chat Assistant */}
      <AIChatAssistant />
    </div>
  )
}

export default App
