"use client"

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
    router.push('/admin/login')
  }

  return (
    <button onClick={handleLogout} className="mt-4 inline-block px-3 py-2 bg-red-600 text-white rounded" disabled={loading}>
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
