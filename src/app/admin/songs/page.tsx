"use client";

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SongList from '@/components/admin/songList';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function SongsHome() {
  return (
    <div className="py-8">
      <PageBreadcrumb pageTitle="Manage Songs" />
        <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}>
          <div className="px-6 py-5">
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
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <SongList />
          </div>
      </div>
    </div>
  );
}