// 'use client';

// import { useEffect } from 'react';
// import { Toaster } from 'react-hot-toast';
// import useAuthStore from '@/store/useAuthStore';

// export default function Providers({ children }) {
//   const initialize = useAuthStore((s) => s.initialize);

//   useEffect(() => {
//     initialize();
//   }, [initialize]);

//   return (
//     <>
//       {children}
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#0F1A1A',
//             color: '#FFFFFF',
//             borderRadius: '12px',
//             border: '1px solid #1A2F2F',
//           },
//           success: {
//             iconTheme: { primary: '#00D4AA', secondary: '#0F1A1A' },
//           },
//           error: {
//             iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
//           },
//         }}
//       />
//     </>
//   );
// }

'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/store/useAuthStore';

export default function Providers({ children }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0F1A1A',
            color: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #1A2F2F',
          },
          success: {
            iconTheme: { primary: '#00D4AA', secondary: '#0F1A1A' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
          },
        }}
      />
    </>
  );
}