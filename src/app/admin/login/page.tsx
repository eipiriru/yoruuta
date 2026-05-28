"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
// Using plain HTML controls instead of shadcn UI components for now

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push("/admin")
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-slate-700 rounded-lg shadow p-6 shadow-2xl">
        <h2 className="text-2xl text-center mb-2">Admin Login</h2>
        <p className="text-center text-sm text-gray-500 mb-4">Enter your email and password to access the admin dashboard.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full border border-slate-500 rounded-md px-3 py-2 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-slate-300 px-4 py-2 rounded-md cursor-pointer hover:bg-slate-500 ">{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? Contact your administrator.</p>
      </div>
    </div>
  )
}
