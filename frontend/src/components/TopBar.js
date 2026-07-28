// 'use client';

// import { Bell } from 'lucide-react';
// import useAuthStore from '@/store/useAuthStore';

// export default function TopBar({ title, subtitle }) {
//   const { user } = useAuthStore();

//   return (
//     <header className="sticky top-0 z-20 mb-4 rounded-[24px] border border-slate-200/70 bg-white/85 px-4 py-3 shadow-[0_10px_30px_rgba(15,26,26,0.06)] backdrop-blur-xl sm:px-6">
//       <div className="flex items-center justify-between gap-3">
//         <div>
//           <h1 className="text-lg font-semibold text-primary sm:text-xl">{title}</h1>
//           {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
//         </div>
//         <div className="flex items-center gap-2 sm:gap-3">
//           <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-right sm:block">
//             <p className="text-sm font-semibold text-primary">{user?.name}</p>
//             <p className="text-xs capitalize text-slate-500">
//               {user?.role?.replace('_', ' ')}
//             </p>
//           </div>
//           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/90 text-sm font-semibold text-primary">
//             {user?.name?.charAt(0).toUpperCase()}
//           </div>
//           <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
//             <Bell size={16} />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, LogOut } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

export default function TopBar({ title, subtitle }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-20 mb-4 rounded-2xl border border-slate-200/55 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-primary tracking-tight sm:text-xl">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-xl border border-slate-200/50 bg-slate-50/50 px-3.5 py-1.5 text-right sm:block">
            <p className="text-xs font-semibold text-primary leading-tight">{user?.name}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 border border-accent/20 text-accent text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-slate-50 text-slate-500 transition hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 active:scale-95"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
          
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-slate-50 text-slate-400">
            <Bell size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}