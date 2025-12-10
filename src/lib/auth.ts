// 服务端权限管理系统 - 使用 Supabase Auth
import { getSession } from './supabase'

// Get Supabase project reference from environment
const getSupabaseProjectRef = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  // Extract project ref from URL (e.g., https://xxxxx.supabase.co -> xxxxx)
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  return match ? match[1] : 'default'
}

export async function hasEditPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    const { data: { session } } = await getSession()
    return !!session
  } catch (error) {
    console.error('Error checking edit permission:', error)
    return false
  }
}

// 同步检查（用于初始化，可能不准确）
export function hasEditPermissionSync(): boolean {
  if (typeof window === 'undefined') return false
  // 检查 localStorage 中是否有 session
  const projectRef = getSupabaseProjectRef()
  const sessionStr = localStorage.getItem(`sb-${projectRef}-auth-token`)
  return !!sessionStr
}

