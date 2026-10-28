import Link from 'next/link'
import StreamList from '@/components/admin/streamList'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import StreamPackImport from '@/components/admin/streamPackImport'
import Button from '@/components/ui/button/Button'
import { PlusIcon } from '@/icons'

export default function StreamsPage() {
  return (
    <div className="py-8">
      <PageBreadcrumb pageTitle="Manage Streams" />
      
      <div className="space-y-6">
        <StreamPackImport />

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <Link href="/admin/streams/forms">
              <Button size="sm" startIcon={<PlusIcon />}>
                Tambah Stream
              </Button>
            </Link>
          </div>
          
          <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-6">
            <StreamList />
          </div>
        </div>
      </div>
    </div>
  )
}
