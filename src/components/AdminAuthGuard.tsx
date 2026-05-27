"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation' // Impor usePathname
import { supabase } from '@/lib/supabase'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() // <--- Gunakan usePathname di sini
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      // const currentPath = router.pathname // Baris ini yang menyebabkan error, sekarang kita pakai `pathname`

      if (session) {
        if (pathname === '/admin/login') {
          router.push('/admin/songs')
          // Jangan set checking ke false karena akan ada redirect
        } else {
          if (mounted) setChecking(false)
        }
      } else { // Tidak ada sesi
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
          // Jangan set checking ke false karena akan ada redirect
        } else {
          if (mounted) setChecking(false)
        }
      }
    }
    check()
    return () => { mounted = false }
  }, [router, pathname]) // Tambahkan pathname ke dependency array

  if (checking) return null // Tampilkan null atau loading state saat memeriksa
  return <>{children}</>
}
