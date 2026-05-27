'use client'
import AdminSidebarLink from '@/app/admin/components/ui/AdminSidebarLink';

export default function AdminNav() {
  return (
      <nav>
        <ul>
          <AdminSidebarLink href="/admin/songs">Manage Songs</AdminSidebarLink>
        </ul>
      </nav>
  )
}
