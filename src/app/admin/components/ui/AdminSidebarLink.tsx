'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AdminSidebarLinkProps {
  href: string
  children: React.ReactNode
}

export default function AdminSidebarLink({ href, children }: AdminSidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <li className="mb-2">
      <Link
        href={href}
        className={cn(
          "block px-3 py-2 rounded-md text-sm font-medium",
          isActive
            ? "bg-blue-500 text-white"
            : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
        )}
      >
        {children}
      </Link>
    </li>
  )
}
