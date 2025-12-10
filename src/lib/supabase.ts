import { createClient } from '@supabase/supabase-js'

// Get from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Auth helper functions
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function getCurrentUser() {
  return supabase.auth.getUser()
}

export function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  category_id: string | null
  summary: string | null
  is_completed: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface NoteTag {
  id: string
  note_id: string
  tag_id: string
}

export interface LearningProgress {
  id: string
  category_id: string
  completed_notes: number
  total_notes: number
}

// API Functions
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data || []
}

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getNoteById(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createNote(note: Partial<Note>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id: string): Promise<void> {
  // Delete note_tags first
  await supabase.from('note_tags').delete().eq('note_id', id)
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}

export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase.from('tags').select('*').order('name')
  if (error) throw error
  return data || []
}

export async function getNoteTags(noteId: string): Promise<Tag[]> {
  const { data: noteTags, error: ntError } = await supabase
    .from('note_tags')
    .select('tag_id')
    .eq('note_id', noteId)
  if (ntError) throw ntError
  
  if (!noteTags?.length) return []
  
  const tagIds = noteTags.map(nt => nt.tag_id)
  const { data: tags, error: tError } = await supabase
    .from('tags')
    .select('*')
    .in('id', tagIds)
  if (tError) throw tError
  return tags || []
}

export async function addTagToNote(noteId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('note_tags')
    .insert([{ note_id: noteId, tag_id: tagId }])
  if (error && !error.message.includes('duplicate')) throw error
}

export async function removeTagFromNote(noteId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('note_tags')
    .delete()
    .eq('note_id', noteId)
    .eq('tag_id', tagId)
  if (error) throw error
}

export async function createTag(name: string, color: string): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name, color }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function searchNotes(query: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getLearningProgress(): Promise<{ completed: number; total: number }> {
  const { data: notes, error } = await supabase
    .from('notes')
    .select('is_completed')
  if (error) throw error
  
  const total = notes?.length || 0
  const completed = notes?.filter(n => n.is_completed).length || 0
  return { completed, total }
}

export async function toggleNoteCompleted(id: string, isCompleted: boolean): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Category Management Functions
export async function createCategory(category: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  // First, move notes in this category to null or delete them
  await supabase.from('notes').update({ category_id: null }).eq('category_id', id)
  // Delete subcategories first
  await supabase.from('categories').delete().eq('parent_id', id)
  // Then delete the category
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
