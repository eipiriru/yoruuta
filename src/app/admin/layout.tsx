'use client';

import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminNav from '@/app/admin/components/ui/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login'; 

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminAuthGuard>
        {!isLoginPage && (
          <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4">
            <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>
            <AdminNav></AdminNav>
            <LogoutButton />
          </aside>
        )}

        <main className="flex-1">
          {children}
        </main>
        
      </AdminAuthGuard>
    </div>
  );
}