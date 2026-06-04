import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or anonymous key environment variables.')
  }

  // Mengembalikan instance baru (atau yang sudah ada jika di browser)
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// import { createBrowserClient } from '@supabase/ssr'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase URL or anonymous key environment variables.')
// }

// export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// // (Opsional) Memasukkan ke window agar bisa diakses dari console browser
// if (typeof window !== 'undefined') {
//   ;(window as any).supabase = supabase
// }