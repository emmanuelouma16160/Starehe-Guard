// import './globals.css';
// import Providers from '@/components/Providers';
// import Sidebar from '@/components/Sidebar';
// import useAuthStore from '@/store/useAuthStore';

// export const metadata = {
//   title: 'StaSentry Pro - School Security System',
//   description: 'Complete school security management system',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         <Providers>
//           <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
//             <Sidebar />
//             <main className="flex-1 min-w-0">
//               <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-3 sm:px-5 lg:px-6 lg:py-6">
//                 {children}
//               </div>
//             </main>
//           </div>
//         </Providers>
//       </body>
//     </html>
//   );
// }

import './globals.css';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'StaSentry Pro - School Security System',
  description: 'Complete school security management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 min-w-0">
              <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-3 sm:px-5 lg:px-6 lg:py-6">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}