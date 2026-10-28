'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import ComponentCard from '@/components/common/ComponentCard'
import Button from '@/components/ui/button/Button'

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

  return (
    <ComponentCard title="Import lyrics pack JSON" desc="Schema v2 · Maksimal 5 MB · Video duplikat dilewati.">
      <div className="space-y-4">
        <input 
          type="file" 
          accept="application/json,.json" 
          aria-label="Pilih lyrics pack JSON" 
          onChange={(event) => void load(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-white/[0.05] dark:file:text-gray-400"
        />
        
        {pack && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {file?.name}: {pack.lyrics?.length} records siap diperiksa server.
            </span>
            <Button 
              disabled={busy} 
              onClick={() => void importPack()}
              variant="primary"
              size="sm"
            >
              {busy ? 'Mengimpor...' : 'Import dan simpan'}
            </Button>
          </div>
        )}
        
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        
        {result && (
          <div role="status" className="space-y-1 text-sm">
            <p className="font-medium text-gray-800 dark:text-white/90">
              Import selesai: {result.created} disimpan, {result.skipped} duplikat dilewati, {result.invalid} record tidak valid.
            </p>
            {result.errors.map((item, index) => (
              <p key={`${index}-${item}`} className="text-amber-700 dark:text-amber-400">{item}</p>
            ))}
          </div>
        )}
      </div>
    </ComponentCard>
  )
}