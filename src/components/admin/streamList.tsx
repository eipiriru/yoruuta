'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { deleteStream, getAllStreams, type Stream } from '@/components/services/streamServices'
import Input from '@/components/form/input/InputField'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function StreamList() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [groupByArtist, setGroupByArtist] = useState(true)
  const [expandedArtists, setExpandedArtists] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const { data } = await getAllStreams()
        setStreams((data ?? []) as Stream[])
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Gagal mengambil data stream.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStreams()
  }, [])

  const remove = async (stream: Stream) => {
    if (!window.confirm(`Hapus stream "${stream.title}"?`)) return
    setDeletingId(stream.id)
    try {
      await deleteStream(stream.id)
      setStreams((items) => items.filter((item) => item.id !== stream.id))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menghapus stream.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return streams
    return streams.filter((stream) => `${stream.title} ${stream.artist}`.toLowerCase().includes(q))
  }, [streams, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [query, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedStreams = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const groupedEntries = useMemo(() => {
    if (!groupByArtist) return []
    const map = new Map<string, Stream[]>()
    for (const item of paginatedStreams) {
      const key = item.artist || 'Unknown Artist'
      const list = map.get(key)
      if (list) {
        list.push(item)
      } else {
        map.set(key, [item])
      }
    }
    return Array.from(map.entries())
  }, [groupByArtist, paginatedStreams])

  const artistGroupKey = groupedEntries.map(([artistName]) => artistName).join('\u0000')

  useEffect(() => {
    setExpandedArtists(groupedEntries[0] ? new Set([groupedEntries[0][0]]) : new Set())
  }, [artistGroupKey])

  const toggleArtist = (artistName: string) => {
    setExpandedArtists((current) => {
      const next = new Set(current)
      if (next.has(artistName)) {
        next.delete(artistName)
      } else {
        next.add(artistName)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="text"
          placeholder="Cari judul atau artist..."
          className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 transition-colors focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 md:w-1/3"
          defaultValue={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={groupByArtist}
            onChange={(event) => setGroupByArtist(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          />
          Group by artist
        </label>
      </div>

      {message && <p className="text-red-500">{message}</p>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Judul
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Artist
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    YouTube
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="p-3 text-center text-gray-500 dark:text-gray-400">
                      Memuat stream...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="p-3 text-center text-gray-500 dark:text-gray-400">
                      Tidak ada stream ditemukan.
                    </TableCell>
                  </TableRow>
                ) : groupByArtist ? (
                  groupedEntries.map(([artistName, artistStreams]) => (
                    <React.Fragment key={artistName}>
                      <TableRow className="bg-gray-50/70 dark:bg-white/[0.02]">
                        <TableCell
                          colSpan={4}
                          className="px-5 py-2"
                        >
                          <button
                            type="button"
                            aria-expanded={expandedArtists.has(artistName)}
                            onClick={() => toggleArtist(artistName)}
                            className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                          >
                            <span>{artistName} ({artistStreams.length})</span>
                            <span aria-hidden="true">{expandedArtists.has(artistName) ? '−' : '+'}</span>
                          </button>
                        </TableCell>
                      </TableRow>
                      {expandedArtists.has(artistName) && artistStreams.map((stream) => (
                        <TableRow key={stream.id}>
                          <TableCell className="px-5 py-3 text-theme-sm font-medium text-gray-900 dark:text-white">
                            {stream.title}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-theme-sm text-gray-900 dark:text-white">
                            {stream.artist}
                          </TableCell>
                          <TableCell className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                            {stream.video_id}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-theme-sm">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/admin/streams/forms/${stream.id}`}
                                className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => remove(stream)}
                                disabled={deletingId === stream.id}
                                className="font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                              >
                                {deletingId === stream.id ? 'Menghapus...' : 'Hapus'}
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  paginatedStreams.map((stream) => (
                    <TableRow key={stream.id}>
                      <TableCell className="px-5 py-3 text-theme-sm font-medium text-gray-900 dark:text-white">
                        {stream.title}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-theme-sm text-gray-900 dark:text-white">
                        {stream.artist}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-theme-sm font-mono text-xs text-gray-500 dark:text-gray-400">
                        {stream.video_id}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-theme-sm">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/streams/forms/${stream.id}`}
                            className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => remove(stream)}
                            disabled={deletingId === stream.id}
                            className="font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                          >
                            {deletingId === stream.id ? 'Menghapus...' : 'Hapus'}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            aria-label="Pilih jumlah data per halaman"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>data · Total {filtered.length} stream</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="rounded border border-gray-300 px-3 py-1 font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-white/[0.05]"
          >
            Prev
          </button>
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            className="rounded border border-gray-300 px-3 py-1 font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-white/[0.05]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
