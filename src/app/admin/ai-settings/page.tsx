'use client'

import { useEffect, useMemo, useState } from 'react'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { createClient } from '@/lib/supabase'

export default function AISettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [language, setLanguage] = useState<'id' | 'en'>('id')
  const [providers, setProviders] = useState<string[]>(['Gemini', '9Router', 'OpenRouter'])
  const [geminiEnabled, setGeminiEnabled] = useState(true)
  const [geminiKey, setGeminiKey] = useState('')
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash')
  const [nineRouterEnabled, setNineRouterEnabled] = useState(false)
  const [nineRouterUrl, setNineRouterUrl] = useState('http://localhost:20128/v1/chat/completions')
  const [nineRouterKey, setNineRouterKey] = useState('')
  const [nineRouterModel, setNineRouterModel] = useState('gemini-flash')
  const [openRouterEnabled, setOpenRouterEnabled] = useState(false)
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [openRouterModel, setOpenRouterModel] = useState('google/gemini-2.5-flash')
  const [keyStatus, setKeyStatus] = useState({ gemini: false, nineRouter: false, openRouter: false })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return setMessage('Sesi admin berakhir.')
      fetch('/api/admin/ai-settings', { headers: { Authorization: `Bearer ${session.access_token}` } }).then((res) => res.json()).then((data) => {
        if (data.error) return setMessage(data.error)
        setLanguage(data.language ?? 'id')
        setProviders(data.providers ?? ['Gemini', '9Router', 'OpenRouter'])
        setGeminiEnabled(Boolean(data.gemini_enabled))
        setGeminiModel(data.gemini_model ?? 'gemini-1.5-flash')
        setNineRouterEnabled(Boolean(data.nine_router_enabled))
        setNineRouterUrl(data.nine_router_url ?? 'http://localhost:20128/v1/chat/completions')
        setNineRouterModel(data.nine_router_model ?? 'gemini-flash')
        setOpenRouterEnabled(Boolean(data.open_router_enabled))
        setOpenRouterModel(data.open_router_model ?? 'google/gemini-2.5-flash')
        setKeyStatus(data.keys ?? { gemini: false, nineRouter: false, openRouter: false })
      })
    })
  }, [supabase])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaving(false); return setMessage('Sesi admin berakhir.') }
    const payload = {
      language, providers,
      gemini_enabled: geminiEnabled, gemini_model: geminiModel, gemini_api_key: geminiKey || undefined,
      nine_router_enabled: nineRouterEnabled, nine_router_url: nineRouterUrl, nine_router_model: nineRouterModel, nine_router_api_key: nineRouterKey || undefined,
      open_router_enabled: openRouterEnabled, open_router_model: openRouterModel, open_router_api_key: openRouterKey || undefined,
    }
    const response = await fetch('/api/admin/ai-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(payload) })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) return setMessage(data.error || 'Gagal menyimpan pengaturan.')
    setMessage('Pengaturan AI tersimpan.')
    setGeminiKey('')
    setNineRouterKey('')
    setOpenRouterKey('')
    setKeyStatus({ gemini: keyStatus.gemini || Boolean(geminiKey), nineRouter: keyStatus.nineRouter || Boolean(nineRouterKey), openRouter: keyStatus.openRouter || Boolean(openRouterKey) })
  }

  const moveProvider = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= providers.length) return
    setProviders((current) => {
      const updated = [...current]
      ;[updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]]
      return updated
    })
  }

  return <div className="py-8"><PageBreadcrumb pageTitle="AI Provider Settings" />
    <form onSubmit={save} className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <label className="block text-sm font-medium">Bahasa Terjemahan<select value={language} onChange={(e) => setLanguage(e.target.value as 'id' | 'en')} className="mt-2 w-full rounded border p-3 dark:bg-gray-900"><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></label>
      <fieldset className="space-y-2 rounded border p-4"><legend className="px-1 font-semibold">Urutan fallback AI</legend>{providers.map((provider, index) => <div key={provider} className="flex items-center justify-between"><span>{index + 1}. {provider}</span><span className="space-x-2"><button type="button" aria-label={`Move ${provider} up`} disabled={index === 0} onClick={() => moveProvider(index, -1)} className="rounded border px-2 disabled:opacity-40">↑</button><button type="button" aria-label={`Move ${provider} down`} disabled={index === providers.length - 1} onClick={() => moveProvider(index, 1)} className="rounded border px-2 disabled:opacity-40">↓</button></span></div>)}</fieldset>
      <div className="space-y-4 rounded border p-4">
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={geminiEnabled} onChange={(e) => setGeminiEnabled(e.target.checked)} /> Google Gemini</label>
        <input type="text" placeholder="Model (mis. gemini-1.5-flash)" value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} className="w-full rounded border p-2 text-sm dark:bg-gray-900" />
        <input type="password" placeholder={keyStatus.gemini ? 'API Key tersimpan (isi untuk ganti)' : 'Gemini API Key'} value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} className="w-full rounded border p-2 text-sm dark:bg-gray-900" />
      </div>
      <div className="space-y-4 rounded border p-4">
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={nineRouterEnabled} onChange={(e) => setNineRouterEnabled(e.target.checked)} /> 9Router</label>
        <input type="url" placeholder="Endpoint URL" value={nineRouterUrl} onChange={(e) => setNineRouterUrl(e.target.value)} className="w-full rounded border p-2 text-sm dark:bg-gray-900" />
        <input type="text" placeholder="Model (mis. gemini-flash)" value={nineRouterModel} onChange={(e) => setNineRouterModel(e.target.value)} className="w-full rounded border p-2 text-sm dark:bg-gray-900" />
        <input type="password" placeholder={keyStatus.nineRouter ? 'API Key tersimpan (isi untuk ganti)' : '9Router API Key (opsional)'} value={nineRouterKey} onChange={(e) => setNineRouterKey(e.target.value)} className="w-full rounded border p-2 text-sm dark:bg-gray-900" />
      </div>
      <div className="space-y-4 rounded border p-4">
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={openRouterEnabled} onChange={(e) => setOpenRouterEnabled(e.target.checked)} /> OpenRouter</label>
        <input type="text" placeholder="Model (mis. google/gemini-2.5-flash)" value={openRouterModel} onChange={(e) => setOpenRouterModel(e.target.value)} className="w-full rounded border p-2 text-sm dark:bg-gray-900" />
        <input type="password" placeholder={keyStatus.openRouter ? 'API Key tersimpan (isi untuk ganti)' : 'OpenRouter API Key'} value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} className="w-full rounded border p-2 text-sm dark:bg-gray-900" />
      </div>
      {message && <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>}
      <button disabled={saving} className="w-full rounded bg-blue-600 px-4 py-3 text-white disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Konfigurasi AI'}</button>
    </form>
  </div>
}