import { createClient } from '@supabase/supabase-js'

export async function requireApiUser(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!url || !anonKey || !token) return null
  const { data, error } = await createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } }).auth.getUser(token)
  return error ? null : data.user
}