"use client";

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SongList from '@/app/admin/components/ui/songList';

export default function SongsHome() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Songs
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage your songs collection
            </p>
          </div>

          <Link
            href="/admin/songs/forms"
            className={cn(
              "inline-flex items-center rounded-md",
              "bg-blue-600 px-4 py-2",
              "text-sm font-medium text-white",
              "transition-colors hover:bg-blue-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "dark:hover:bg-blue-500"
            )}
          >
            Tambah
          </Link>
        </div>
        <SongList />
      </div>
    </div>
  );
}