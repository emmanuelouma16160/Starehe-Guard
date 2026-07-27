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
    <header className="sticky top-0 z-20 mb-4 rounded-[24px] border border-slate-200/70 bg-white/85 px-4 py-3 shadow-[0_10px_30px_rgba(15,26,26,0.06)] backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#0F1A1A] sm:text-xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-right sm:block">
            <p className="text-sm font-semibold text-[#0F1A1A]">{user?.name}</p>
            <p className="text-xs capitalize text-slate-500">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00D4AA]/90 text-sm font-semibold text-[#0F1A1A]">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
            <Bell size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}