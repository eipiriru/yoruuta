'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Preview = { schemaVersion: number; lyrics?: unknown[] }
type Result = { created: number; skipped: number; invalid: number; errors: string[] }
const MAX_BYTES = 5 * 1024 * 1024

export default function StreamPackImport() {
  const supabase = useMemo(() => createClient(), [])
  const [file, setFile] = useState<File | null>(null)
  const [pack, setPack] = useState<Preview | null>(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async (selected: File | null) => {
    setFile(selected)
    setPack(null)
    setResult(null)
    setError('')
    if (!selected) return
    if (selected.size > MAX_BYTES) return setError('Ukuran file maksimal 5 MB.')
    try {
      const parsed = JSON.parse(await selected.text()) as Preview
      if (!parsed || parsed.schemaVersion !== 2 || !Array.isArray(parsed.lyrics)) throw new Error('Format tidak didukung. Gunakan lyrics pack schemaVersion 2.')
      if (!parsed.lyrics.length) throw new Error('Pack tidak berisi data lirik.')
      setPack(parsed)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'JSON tidak valid.')
    }
  }

  const importPack = async () => {
    if (!file || !pack) return
    setBusy(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi admin berakhir. Silakan login kembali.')
      const response = await fetch('/api/admin/streams/import', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: await file.text() })
      const data = await response.json()
      if (!response.ok && response.status !== 207) throw new Error([data.error, ...(data.errors ?? [])].filter(Boolean).join(' '))
      setResult(data as Result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Import gagal.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="mb-6 space-y-3 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
    <h2 className="font-semibold">Import lyrics pack JSON</h2>
    <p className="text-sm text-gray-500">Schema v2 · Maksimal 5 MB · Video duplikat dilewati.</p>
    <input type="file" accept="application/json,.json" aria-label="Pilih lyrics pack JSON" onChange={(event) => void load(event.target.files?.[0] ?? null)} />
    {pack && <div className="flex flex-wrap items-center gap-3 text-sm"><span>{file?.name}: {pack.lyrics?.length} records siap diperiksa server.</span><button type="button" disabled={busy} onClick={() => void importPack()} className="rounded bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Mengimpor...' : 'Import dan simpan'}</button></div>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {result && <div role="status" className="space-y-1 text-sm"><p>Import selesai: {result.created} disimpan, {result.skipped} duplikat dilewati, {result.invalid} record tidak valid.</p>{result.errors.map((item, index) => <p key={`${index}-${item}`} className="text-amber-700">{item}</p>)}</div>}
  </section>
}