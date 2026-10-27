import Link from 'next/link'
import StreamList from '@/components/admin/streamList'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import StreamPackImport from '@/components/admin/streamPackImport'

export default function StreamsPage() {
  return <div className="py-8"><PageBreadcrumb pageTitle="Manage Streams" /><div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"><StreamPackImport /></div><div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"><div className="p-6"><Link href="/admin/streams/forms" className="inline-block rounded bg-blue-600 px-4 py-2 text-white">Tambah</Link></div><div className="border-t p-6"><StreamList /></div></div></div>
}