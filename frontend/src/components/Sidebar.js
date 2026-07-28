// // 'use client';

// // import { useState } from 'react';
// // import Link from 'next/link';
// // import { usePathname, useRouter } from 'next/navigation';
// // import {
// //   Shield,
// //   LayoutDashboard,
// //   Users,
// //   UserCheck,
// //   ScanLine,
// //   AlertTriangle,
// //   FileText,
// //   LogOut,
// //   Eye,
// //   BookOpen,
// //   ChevronRight,
// //   Bell,
// //   Menu,
// //   X,
// //   MessageCircle,
// // } from 'lucide-react';
// // import useAuthStore from '@/store/useAuthStore';

// // const NAV_ITEMS = [
// //   {
// //     label: 'Dashboard',
// //     href: '/dashboard',
// //     icon: LayoutDashboard,
// //     roles: ['super_admin', 'admin', 'teacher', 'parent'],
// //   },
// //   {
// //     label: 'Scan Gate',
// //     href: '/guard',
// //     icon: ScanLine,
// //     roles: ['super_admin', 'admin', 'guard'],
// //   },
// //   {
// //     label: 'Students',
// //     href: '/dashboard/students',
// //     icon: BookOpen,
// //     roles: ['super_admin', 'admin', 'teacher'],
// //   },
// //   {
// //     label: 'Parents',
// //     href: '/dashboard/parents',
// //     icon: Users,
// //     roles: ['super_admin', 'admin'],
// //   },
// //   {
// //     label: 'Visitors',
// //     href: '/dashboard/visitors',
// //     icon: Eye,
// //     roles: ['super_admin', 'admin', 'guard'],
// //   },
// //   {
// //     label: 'Messages',
// //     href: '/dashboard/messages',
// //     icon: MessageCircle,
// //     roles: ['super_admin', 'admin', 'guard', 'teacher', 'parent'],
// //   },
// //   {
// //     label: 'Incidents',
// //     href: '/dashboard/incidents',
// //     icon: AlertTriangle,
// //     roles: ['super_admin', 'admin', 'guard'],
// //   },
// //   {
// //     label: 'Reports',
// //     href: '/dashboard/reports',
// //     icon: FileText,
// //     roles: ['super_admin', 'admin'],
// //   },
// //   {
// //     label: 'Lockdown',
// //     href: '/dashboard/lockdown',
// //     icon: AlertTriangle,
// //     roles: ['super_admin'],
// //   },
// // ];

// // export default function Sidebar() {
// //   const pathname = usePathname();
// //   const router = useRouter();
// //   const { user, logout } = useAuthStore();
// //   const [open, setOpen] = useState(false);

// //   const handleLogout = () => {
// //     logout();
// //     router.push('/auth/login');
// //   };

// //   const visibleItems = NAV_ITEMS.filter(
// //     (item) => user && item.roles.includes(user.role)
// //   );

// //   return (
// //     <>
// //       <button
// //         onClick={() => setOpen((value) => !value)}
// //         className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-700 shadow-lg shadow-slate-200/70 backdrop-blur lg:hidden"
// //         aria-label="Toggle navigation"
// //       >
// //         {open ? <X size={18} /> : <Menu size={18} />}
// //       </button>

// //       {open && (
// //         <div
// //           className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
// //           onClick={() => setOpen(false)}
// //         />
// //       )}

// //       <aside
// //         className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200/70 bg-[linear-gradient(135deg,#0f1a1a_0%,#142727_55%,#1a2f2f_100%)] text-white shadow-[18px_0_60px_rgba(15,26,26,0.18)] transition-transform duration-300 lg:static lg:translate-x-0 ${
// //           open ? 'translate-x-0' : '-translate-x-full'
// //         }`}
// //       >
// //         <div className="border-b border-white/10 p-6">
// //           <div className="flex items-center gap-3">
// //             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/90 shadow-lg shadow-accent/20">
// //               <Shield size={22} className="text-primary" />
// //             </div>
// //             <div>
// //               <h1 className="text-lg font-semibold tracking-tight">StaSentry</h1>
// //               <p className="mt-1 text-xs uppercase tracking-[0.3em] text-accent/80">
// //                 Security Command
// //               </p>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="p-4">
// //           <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
// //             <div className="flex items-center gap-3">
// //               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/90 font-semibold text-primary">
// //                 {user?.name?.charAt(0).toUpperCase()}
// //               </div>
// //               <div className="min-w-0">
// //                 <p className="truncate text-sm font-semibold">{user?.name}</p>
// //                 <p className="truncate text-xs capitalize text-slate-300">
// //                   {user?.role?.replace('_', ' ')}
// //                 </p>
// //                 {user?.phone && (
// //                   <p className="truncate text-xs text-slate-400">{user?.phone}</p>
// //                 )}
// //               </div>
// //             </div>
// //             <div className="mt-3 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
// //               <span className="h-2 w-2 rounded-full bg-emerald-400" />
// //               Secure mode active
// //             </div>
// //           </div>
// //         </div>

// //         <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
// //           {visibleItems.map((item) => {
// //             const Icon = item.icon;
// //             const isActive =
// //               pathname === item.href ||
// //               (item.href !== '/dashboard' && pathname.startsWith(item.href));

// //             return (
// //               <Link
// //                 key={item.href}
// //                 href={item.href}
// //                 onClick={() => setOpen(false)}
// //                 className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${
// //                   isActive
// //                     ? 'border-accent/40 bg-accent text-primary shadow-lg shadow-accent/20'
// //                     : 'border-transparent bg-white/5 text-slate-200 hover:border-white/10 hover:bg-white/10 hover:text-white'
// //                 }`}
// //               >
// //                 <Icon size={18} />
// //                 <span className="flex-1">{item.label}</span>
// //                 {isActive && <ChevronRight size={14} />}
// //               </Link>
// //             );
// //           })}
// //         </nav>

// //         <div className="border-t border-white/10 p-4">
// //           <button
// //             onClick={handleLogout}
// //             className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-danger/15 hover:text-danger"
// //           >
// //             <LogOut size={18} />
// //             <span>Sign Out</span>
// //           </button>
// //         </div>
// //       </aside>
// //     </>
// //   );
// // }

// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   Shield,
//   LayoutDashboard,
//   Users,
//   UserCheck,
//   ScanLine,
//   AlertTriangle,
//   FileText,
//   LogOut,
//   Eye,
//   BookOpen,
//   ChevronRight,
//   Bell,
//   Menu,
//   X,
//   MessageCircle,
// } from 'lucide-react';
// import useAuthStore from '@/store/useAuthStore';

// const NAV_ITEMS = [
//   {
//     label: 'Dashboard',
//     href: '/dashboard',
//     icon: LayoutDashboard,
//     roles: ['super_admin', 'admin', 'teacher', 'parent'],
//   },
//   {
//     label: 'Scan Gate',
//     href: '/guard',
//     icon: ScanLine,
//     roles: ['super_admin', 'admin', 'guard'],
//   },
//   {
//     label: 'Students',
//     href: '/dashboard/students',
//     icon: BookOpen,
//     roles: ['super_admin', 'admin', 'teacher'],
//   },
//   {
//     label: 'Parents',
//     href: '/dashboard/parents',
//     icon: Users,
//     roles: ['super_admin', 'admin'],
//   },
//   {
//     label: 'Visitors',
//     href: '/dashboard/visitors',
//     icon: Eye,
//     roles: ['super_admin', 'admin', 'guard'],
//   },
//   {
//     label: 'Messages',
//     href: '/dashboard/messages',
//     icon: MessageCircle,
//     roles: ['super_admin', 'admin', 'guard', 'teacher', 'parent'],
//   },
//   {
//     label: 'Incidents',
//     href: '/dashboard/incidents',
//     icon: AlertTriangle,
//     roles: ['super_admin', 'admin', 'guard'],
//   },
//   {
//     label: 'Reports',
//     href: '/dashboard/reports',
//     icon: FileText,
//     roles: ['super_admin', 'admin'],
//   },
//   {
//     label: 'Lockdown',
//     href: '/dashboard/lockdown',
//     icon: AlertTriangle,
//     roles: ['super_admin'],
//   },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user, logout } = useAuthStore();
//   const [open, setOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     router.push('/auth/login');
//   };

//   const visibleItems = NAV_ITEMS.filter(
//     (item) => user && item.roles.includes(user.role)
//   );

//   return (
//     <>
//       <button
//         onClick={() => setOpen((value) => !value)}
//         className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-700 shadow-lg shadow-slate-200/70 backdrop-blur lg:hidden"
//         aria-label="Toggle navigation"
//       >
//         {open ? <X size={18} /> : <Menu size={18} />}
//       </button>

//       {open && (
//         <div
//           className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
//           onClick={() => setOpen(false)}
//         />
//       )}

//       <aside
//         className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200/70 text-white shadow-[18px_0_60px_rgba(15,26,26,0.18)] transition-transform duration-300 lg:static lg:translate-x-0 ${
//           open ? 'translate-x-0' : '-translate-x-full'
//         }`}
//         style={{ background: 'linear-gradient(135deg, #0f1a1a 0%, #142727 55%, #1a2f2f 100%)' }}
//       >
//         <div className="border-b border-white/10 p-6">
//           <div className="flex items-center gap-3">
//             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00D4AA]/90 shadow-lg shadow-[#00D4AA]/20">
//               <Shield size={22} className="text-[#0F1A1A]" />
//             </div>
//             <div>
//               <h1 className="text-lg font-semibold tracking-tight">StaSentry</h1>
//               <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[#00D4AA]/80">
//                 Security Command
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="p-4">
//           <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
//             <div className="flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00D4AA]/90 font-semibold text-[#0F1A1A]">
//                 {user?.name?.charAt(0).toUpperCase()}
//               </div>
//               <div className="min-w-0">
//                 <p className="truncate text-sm font-semibold">{user?.name}</p>
//                 <p className="truncate text-xs capitalize text-slate-300">
//                   {user?.role?.replace('_', ' ')}
//                 </p>
//                 {user?.phone && (
//                   <p className="truncate text-xs text-slate-400">{user?.phone}</p>
//                 )}
//               </div>
//             </div>
//             <div className="mt-3 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
//               <span className="h-2 w-2 rounded-full bg-emerald-400" />
//               Secure mode active
//             </div>
//           </div>
//         </div>

//         <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
//           {visibleItems.map((item) => {
//             const Icon = item.icon;
//             const isActive =
//               pathname === item.href ||
//               (item.href !== '/dashboard' && pathname.startsWith(item.href));

//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={() => setOpen(false)}
//                 className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${
//                   isActive
//                     ? 'border-[#00D4AA]/40 bg-[#00D4AA] text-[#0F1A1A] shadow-lg shadow-[#00D4AA]/20'
//                     : 'border-transparent bg-white/5 text-slate-200 hover:border-white/10 hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 <Icon size={18} />
//                 <span className="flex-1">{item.label}</span>
//                 {isActive && <ChevronRight size={14} />}
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="border-t border-white/10 p-4">
//           <button
//             onClick={handleLogout}
//             className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-danger/15 hover:text-danger"
//           >
//             <LogOut size={18} />
//             <span>Sign Out</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }




'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Users,
  UserCheck,
  ScanLine,
  AlertTriangle,
  FileText,
  LogOut,
  Eye,
  BookOpen,
  ChevronRight,
  Bell,
  Menu,
  X,
  MessageCircle,
  Clock,
  Lock,
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin', 'teacher', 'parent'],
  },
  {
    label: 'Scan Gate',
    href: '/guard',
    icon: ScanLine,
    roles: ['super_admin', 'admin', 'guard'],
  },
  {
    label: 'Students',
    href: '/dashboard/students',
    icon: BookOpen,
    roles: ['super_admin', 'admin', 'teacher'],
  },
  {
    label: 'Parents',
    href: '/dashboard/parents',
    icon: Users,
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Visitors',
    href: '/visitors',
    icon: Eye,
    roles: ['super_admin', 'admin', 'guard'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['super_admin', 'admin', 'guard'],
  },
  {
    label: 'Incidents',
    href: '/incidents',
    icon: AlertTriangle,
    roles: ['super_admin', 'admin', 'guard'],
  },
  {
    label: 'Lockdown',
    href: '/lockdown',
    icon: Lock,
    roles: ['super_admin', 'admin', 'guard'],
  },
  {
    label: 'Blacklist',
    href: '/blacklist',
    icon: UserCheck,
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: MessageCircle,
    roles: ['super_admin', 'admin', 'guard', 'teacher', 'parent'],
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
    roles: ['super_admin', 'admin', 'guard', 'teacher', 'parent'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isInitialized } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/auth/login');
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    if (!user || user.role !== 'guard') return;

    const allowedGuardPaths = [
      '/guard',
      '/visitors',
      '/dashboard/visitors',
      '/dashboard/messages',
      '/reports',
      '/incidents',
      '/lockdown',
      '/messages',
      '/notifications',
    ];

    const isAllowedPath = allowedGuardPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (!isAllowedPath) {
      router.push('/guard');
    }
  }, [user, pathname, router]);

  if (!mounted || !user) return null;

  const filteredNavItems = NAV_ITEMS.filter(item => 
    item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 z-50 lg:hidden p-3 bg-accent text-primary rounded-full shadow-lg transition-transform active:scale-95"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen
          lg:sticky lg:top-0 lg:h-screen lg:z-30
          bg-gradient-to-b from-primary to-primary-light
          text-white transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          flex flex-col border-r border-white/5 shrink-0
        `}
      >
        {/* Logo */}
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-3 p-5 border-b border-white/5 transition-all hover:bg-white/5 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="p-2 bg-accent/15 rounded-xl flex-shrink-0 border border-accent/20">
            <Shield size={24} className="text-accent" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">StaSentry</h1>
              <p className="text-xs text-accent/80 uppercase tracking-widest font-semibold">Security System</p>
            </div>
          )}
        </Link>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-white/5 bg-white/3 backdrop-blur-sm m-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize truncate">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200
                  ${isActive 
                    ? 'bg-accent/10 border-accent/20 text-accent font-semibold' 
                    : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
                {!isCollapsed && isActive && (
                  <ChevronRight size={16} className="ml-auto text-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm border border-transparent hover:border-white/5"
          >
            {isCollapsed ? '→' : '←'}
          </button>
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all
              hover:bg-red-500/10 hover:border-red-500/20 text-gray-400 hover:text-red-400 w-full
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}