'use client';

import { Outfit } from 'next/font/google';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import AdminAuthGuard from '@/components/AdminAuthGuard';

import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";

const outfit = Outfit({
  subsets: ["latin"],
});

// 1. Buat komponen anak khusus untuk menangani layouting yang butuh state Sidebar
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  // Sekarang pemanggilan ini aman karena AdminLayoutContent dipanggil di dalam SidebarProvider
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// 2. RootLayout sekarang hanya bertugas sebagai murni "Bungkus Provider"
export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>){
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login'; 

  return (
    <main className={`${outfit.className} dark:bg-gray-900`}>
      <ThemeProvider>
        <AdminAuthGuard>
          <SidebarProvider>
            {isLoginPage ? 
              (
                <>{children}</>
              ) : 
              (
                <AdminLayoutContent>
                  {children}
                </AdminLayoutContent>
              )
            }

          </SidebarProvider>
        </AdminAuthGuard>
      </ThemeProvider>
    </main>
  );
}