// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   ScanLine,
//   CheckCircle,
//   XCircle,
//   AlertTriangle,
//   Clock,
//   User,
//   LogOut,
//   Shield,
// } from 'lucide-react';
// import useAuthStore from '@/store/useAuthStore';
// import api from '@/lib/api';
// import toast from 'react-hot-toast';

// const GATES = ['Main Gate', 'Back Gate', 'Staff Entrance', 'Sports Gate'];

// export default function GuardPage() {
//   const { user, logout, isInitialized } = useAuthStore();
//   const router = useRouter();

//   const [selectedGate, setSelectedGate] = useState('Main Gate');
//   const [scanInput, setScanInput] = useState('');
//   const [scanResult, setScanResult] = useState(null);
//   const [isScanning, setIsScanning] = useState(false);
//   const [recentScans, setRecentScans] = useState([]);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const inputRef = useRef(null);

//   useEffect(() => {
//     if (isInitialized && !user) {
//       router.push('/auth/login');
//       return;
//     }
//     if (isInitialized && user && !['guard', 'admin', 'super_admin'].includes(user.role)) {
//       router.push('/dashboard');
//     }
//   }, [isInitialized, user, router]);

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const fetchRecent = async () => {
//       try {
//         const { data } = await api.get(
//           `/scans/recent?limit=8&gate=${encodeURIComponent(selectedGate)}`
//         );
//         setRecentScans(data);
//       } catch {
//         // silent
//       }
//     };
//     fetchRecent();
//     const interval = setInterval(fetchRecent, 15000);
//     return () => clearInterval(interval);
//   }, [selectedGate]);

//   useEffect(() => {
//     if (inputRef.current) inputRef.current.focus();
//   }, [scanResult]);

//   const handleScan = async (e) => {
//     e.preventDefault();
//     if (!scanInput.trim()) return;

//     setIsScanning(true);
//     setScanResult(null);

//     try {
//       const { data } = await api.post('/scans/process', {
//         qrCodeData: scanInput.trim(),
//         gate: selectedGate,
//       });

//       setScanResult({ type: 'success', data });

//       const { data: recent } = await api.get(
//         `/scans/recent?limit=8&gate=${encodeURIComponent(selectedGate)}`
//       );
//       setRecentScans(recent);
//     } catch (error) {
//       const message = error.response?.data?.message || 'Scan failed. Please try again.';
//       const status = error.response?.data?.status;

//       setScanResult({
//         type: status === 'flagged' ? 'flagged' : 'error',
//         message,
//         data: error.response?.data,
//       });
//     } finally {
//       setIsScanning(false);
//       setScanInput('');
//       setTimeout(() => setScanResult(null), 5000);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     router.push('/auth/login');
//   };

//   const formatTime = (date) =>
//     new Date(date).toLocaleTimeString('en-KE', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//       timeZone: 'Africa/Nairobi',
//     });

//   if (!user) return null;

//   return (
//     <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(0,212,170,0.2),_transparent_35%),linear-gradient(180deg,#081010_0%,#0f1818_100%)] text-white">
//       {/* Header */}
//       <header className="border-b border-white/10 px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-12 h-12 bg-accent/20 rounded-3xl flex items-center justify-center shadow-lg shadow-accent/20">
//             <Shield size={24} className="text-accent" />
//           </div>
//           <div>
//             <h1 className="text-white text-2xl font-semibold">Guard Command Center</h1>
//             <p className="text-gray-300 text-sm">Fast access to incidents, visitors, reports and lockdown controls.</p>
//           </div>
//         </div>

//         <div className="flex flex-col gap-2 sm:items-end">
//           <div className="text-right">
//             <p className="text-white text-sm font-semibold">{user.name}</p>
//             <p className="text-gray-400 text-xs capitalize">{user.role.replace('_', ' ')}</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
//               {currentTime.toLocaleTimeString('en-KE', {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 second: '2-digit',
//                 hour12: true,
//                 timeZone: 'Africa/Nairobi',
//               })}
//             </div>
//             <button
//               onClick={handleLogout}
//               className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-danger/10 hover:text-danger"
//             >
//               <LogOut size={16} className="inline-block mr-1" />
//               Sign Out
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
//         <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] mb-6">
//           <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
//             <div className="flex items-center justify-between gap-4 mb-6">
//               <div>
//                 <p className="text-sm uppercase tracking-[0.3em] text-accent/80">Gate Scanner</p>
//                 <h2 className="mt-2 text-3xl font-semibold text-white">Ready to scan</h2>
//                 <p className="mt-2 text-sm text-gray-400 max-w-xl">
//                   Select the gate and enter a QR code or admission number to register entry or exit quickly.
//                 </p>
//               </div>
//               <div className="rounded-3xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">
//                 Active gate
//                 <div className="mt-2 text-xl text-white">{selectedGate}</div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3 mb-4">
//               {GATES.map((gate) => (
//                 <button
//                   key={gate}
//                   onClick={() => setSelectedGate(gate)}
//                   className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${
//                     selectedGate === gate
//                       ? 'border-accent bg-accent/20 text-white'
//                       : 'border-white/10 bg-white/5 text-gray-300 hover:border-accent/30 hover:bg-white/10'
//                   }`}
//                 >
//                   {gate}
//                 </button>
//               ))}
//             </div>

//             <form onSubmit={handleScan} className="flex flex-col gap-3">
//               <label className="text-sm font-medium text-gray-300">Scan or enter code</label>
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={scanInput}
//                 onChange={(e) => setScanInput(e.target.value)}
//                 placeholder="QR code, admission number or ID"
//                 className="min-h-[60px] rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-white outline-none transition focus:border-accent"
//                 autoComplete="off"
//               />
//               <button
//                 type="submit"
//                 disabled={isScanning || !scanInput.trim()}
//                 className="inline-flex items-center justify-center rounded-3xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {isScanning ? (
//                   <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
//                 ) : (
//                   'Process Scan'
//                 )}
//               </button>
//             </form>
//           </div>

//           <div className="space-y-4">
//             <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
//               <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
//               <div className="grid gap-3">
//                 <button
//                   type="button"
//                   onClick={() => router.push('/incidents')}
//                   className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-semibold text-white transition hover:border-accent hover:bg-white/10"
//                 >
//                   Report Incident
//                   <span className="block text-xs text-gray-400 mt-1">Create incident reports immediately</span>
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => router.push('/visitors')}
//                   className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-semibold text-white transition hover:border-accent hover:bg-white/10"
//                 >
//                   Manage Visitors
//                   <span className="block text-xs text-gray-400 mt-1">Sign in and sign out visitors</span>
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => router.push('/reports')}
//                   className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-semibold text-white transition hover:border-accent hover:bg-white/10"
//                 >
//                   Submit Report
//                   <span className="block text-xs text-gray-400 mt-1">File security and incident reports</span>
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => router.push('/lockdown')}
//                   className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-semibold text-white transition hover:border-accent hover:bg-white/10"
//                 >
//                   Lockdown Status
//                   <span className="block text-xs text-gray-400 mt-1">View or initiate lockdown events</span>
//                 </button>
//               </div>
//             </div>

//             <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
//               <h3 className="text-lg font-semibold text-white mb-3">Info</h3>
//               <p className="text-sm text-gray-400">
//                 Guard accounts have full access to incident reporting, visitor registration, report submission, and lockdown actions.
//               </p>
//               <div className="mt-4 grid gap-3 text-sm text-gray-300">
//                 <div className="rounded-2xl bg-white/5 p-4">Create new incident reports instantly.</div>
//                 <div className="rounded-2xl bg-white/5 p-4">Register visitors and sign them out safely.</div>
//                 <div className="rounded-2xl bg-white/5 p-4">Submit and track reports from the field.</div>
//                 <div className="rounded-2xl bg-white/5 p-4">Trigger or release lockdown if authorized.</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Scan result and recent scans */}
//         <div className="grid gap-4 xl:grid-cols-[1.75fr_1fr]">
//           <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
//           <div className="flex items-center gap-2 mb-4">
//             <ScanLine size={20} className="text-accent" />
//             <h2 className="text-white font-semibold">Scan QR Code</h2>
//           </div>

//           <form onSubmit={handleScan} className="flex gap-3">
//             <input
//               ref={inputRef}
//               type="text"
//               value={scanInput}
//               onChange={(e) => setScanInput(e.target.value)}
//               placeholder="Scan QR code or type admission number..."
//               className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-accent transition-all"
//               autoComplete="off"
//             />
//             <button
//               type="submit"
//               disabled={isScanning || !scanInput.trim()}
//               className="bg-accent hover:bg-accent-dark text-primary font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isScanning ? (
//                 <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//               ) : (
//                 <ScanLine size={20} />
//               )}
//             </button>
//           </form>

//           <p className="text-white/30 text-xs mt-3 text-center">
//             Position QR code in front of scanner or type manually
//           </p>
//         </div>

//         {/* Quick access buttons */}
//         <div className="grid grid-cols-2 gap-3 mb-4">
//           <button
//             type="button"
//             onClick={() => router.push('/incidents')}
//             className="rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-semibold text-white hover:bg-white/10 transition"
//           >
//             Report Incident
//           </button>
//           <button
//             type="button"
//             onClick={() => router.push('/visitors')}
//             className="rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-semibold text-white hover:bg-white/10 transition"
//           >
//             Manage Visitors
//           </button>
//           <button
//             type="button"
//             onClick={() => router.push('/reports')}
//             className="rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-semibold text-white hover:bg-white/10 transition"
//           >
//             Generate Report
//           </button>
//           <button
//             type="button"
//             onClick={() => router.push('/lockdown')}
//             className="rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-semibold text-white hover:bg-white/10 transition"
//           >
//             Lockdown Status
//           </button>
//         </div>

//         {/* Scan Result */}
//         {scanResult && (
//           <div
//             className={`rounded-2xl p-5 mb-4 border-2 transition-all ${
//               scanResult.type === 'success'
//                 ? scanResult.data?.isLate
//                   ? 'bg-warning-light border-warning'
//                   : 'bg-success-light border-success'
//                 : scanResult.type === 'flagged'
//                 ? 'bg-orange-50 border-orange-400'
//                 : 'bg-danger-light border-danger'
//             }`}
//           >
//             <div className="flex items-start gap-4">
//               <div className="flex-shrink-0">
//                 {scanResult.type === 'success' ? (
//                   scanResult.data?.isLate ? (
//                     <Clock size={36} className="text-warning" />
//                   ) : (
//                     <CheckCircle size={36} className="text-success" />
//                   )
//                 ) : scanResult.type === 'flagged' ? (
//                   <AlertTriangle size={36} className="text-orange-500" />
//                 ) : (
//                   <XCircle size={36} className="text-danger" />
//                 )}
//               </div>

//               <div className="flex-1">
//                 {scanResult.type === 'success' ? (
//                   <>
//                     <p
//                       className={`font-bold text-lg ${
//                         scanResult.data?.isLate ? 'text-warning' : 'text-success'
//                       }`}
//                     >
//                       {scanResult.data?.scanType === 'entry'
//                         ? '✓ ENTRY APPROVED'
//                         : '✓ EXIT RECORDED'}
//                       {scanResult.data?.isLate && ' — LATE ARRIVAL'}
//                     </p>
//                     <p className="text-primary font-bold text-xl mt-1">
//                       {scanResult.data?.person?.name}
//                     </p>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-lg">
//                         {scanResult.data?.person?.admissionNumber}
//                       </span>
//                       <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-lg">
//                         {scanResult.data?.person?.class}
//                       </span>
//                       {scanResult.data?.isLate && (
//                         <span className="bg-warning/20 text-warning text-xs font-semibold px-2 py-1 rounded-lg">
//                           {scanResult.data?.minutesLate} mins late
//                         </span>
//                       )}
//                     </div>
//                   </>
//                 ) : scanResult.type === 'flagged' ? (
//                   <>
//                     <p className="font-bold text-lg text-orange-600">⚠️ WATCHLIST ALERT</p>
//                     <p className="text-orange-700 text-sm mt-1">{scanResult.message}</p>
//                     <p className="text-orange-600 text-xs font-semibold mt-2">
//                       Contact admin immediately. Do not allow entry.
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <p className="font-bold text-lg text-danger">✗ ACCESS DENIED</p>
//                     <p className="text-danger/80 text-sm mt-1">{scanResult.message}</p>
//                   </>
//                 )}
//               </div>

//               {scanResult.type === 'success' && scanResult.data?.person?.photo && (
//                 <img
//                   src={scanResult.data.person.photo}
//                   alt="Student"
//                   className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow"
//                 />
//               )}
//             </div>
//           </div>
//         )}

//         {/* Recent scans */}
//         <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
//           <div className="flex items-center gap-2 mb-3">
//             <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
//             <h3 className="text-white/70 text-sm font-semibold">
//               Recent Scans — {selectedGate}
//             </h3>
//           </div>

//           {recentScans.length === 0 ? (
//             <p className="text-white/30 text-xs text-center py-4">No scans at this gate yet</p>
//           ) : (
//             <div className="space-y-2">
//               {recentScans.map((scan) => (
//                 <div
//                   key={scan._id}
//                   className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
//                 >
//                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
//                     <User size={14} className="text-white/50" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-white text-xs font-semibold truncate">
//                       {scan.student
//                         ? `${scan.student.firstName} ${scan.student.lastName}`
//                         : 'Staff/Visitor'}
//                     </p>
//                     <p className="text-white/30 text-xs">
//                       {scan.student?.admissionNumber} · {scan.student?.class}
//                     </p>
//                   </div>
//                   <div className="flex flex-col items-end gap-1">
//                     <span
//                       className={`text-xs font-bold px-2 py-0.5 rounded-full ${
//                         scan.scanType === 'entry'
//                           ? 'bg-success/20 text-success'
//                           : 'bg-danger/20 text-danger'
//                       }`}
//                     >
//                       {scan.scanType === 'entry' ? 'IN' : 'OUT'}
//                     </span>
//                     <span className="text-white/30 text-xs">{formatTime(scan.timestamp)}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ScanLine,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  LogOut,
  Shield,
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const GATES = ['Main Gate', 'Back Gate', 'Staff Entrance', 'Sports Gate'];

export default function GuardPage() {
  const { user, logout, isInitialized } = useAuthStore();
  const router = useRouter();

  const [selectedGate, setSelectedGate] = useState('Main Gate');
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef(null);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/auth/login');
      return;
    }
    if (isInitialized && user && !['guard', 'admin', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await api.get(
          `/scans/recent?limit=8&gate=${encodeURIComponent(selectedGate)}`
        );
        setRecentScans(data);
      } catch {
        // silent
      }
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 15000);
    return () => clearInterval(interval);
  }, [selectedGate]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [scanResult]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const { data } = await api.post('/scans/process', {
        qrCodeData: scanInput.trim(),
        gate: selectedGate,
      });

      setScanResult({ type: 'success', data });

      const { data: recent } = await api.get(
        `/scans/recent?limit=8&gate=${encodeURIComponent(selectedGate)}`
      );
      setRecentScans(recent);
    } catch (error) {
      const message = error.response?.data?.message || 'Scan failed. Please try again.';
      const status = error.response?.data?.status;

      setScanResult({
        type: status === 'flagged' ? 'flagged' : 'error',
        message,
        data: error.response?.data,
      });
    } finally {
      setIsScanning(false);
      setScanInput('');
      setTimeout(() => setScanResult(null), 5000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Nairobi',
    });

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(0,212,170,0.2),_transparent_35%),linear-gradient(180deg,#081010_0%,#0f1818_100%)] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/20 rounded-3xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Shield size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-semibold">Guard Command Center</h1>
            <p className="text-gray-300 text-sm">Fast access to incidents, visitors, reports and lockdown controls.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="text-right">
            <p className="text-white text-sm font-semibold">{user.name}</p>
            <p className="text-gray-400 text-xs capitalize">{user.role.replace('_', ' ')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
              {currentTime.toLocaleTimeString('en-KE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'Africa/Nairobi',
              })}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-danger/10 hover:text-danger"
            >
              <LogOut size={16} className="inline-block mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] mb-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-accent/80">Gate Scanner</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Ready to scan</h2>
                <p className="mt-2 text-sm text-gray-400 max-w-xl">
                  Select the gate and enter a QR code or admission number to register entry or exit quickly.
                </p>
              </div>
              <div className="rounded-3xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">
                Active gate
                <div className="mt-2 text-xl text-white">{selectedGate}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {GATES.map((gate) => (
                <button
                  key={gate}
                  onClick={() => setSelectedGate(gate)}
                  className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${
                    selectedGate === gate
                      ? 'border-accent bg-accent/20 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-accent/30 hover:bg-white/10'
                  }`}
                >
                  {gate}
                </button>
              ))}
            </div>

            <form onSubmit={handleScan} className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-300">Scan or enter code</label>
              <input
                ref={inputRef}
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="QR code, admission number or ID"
                className="min-h-[60px] rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-white outline-none transition focus:border-accent"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isScanning || !scanInput.trim()}
                className="inline-flex items-center justify-center rounded-3xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isScanning ? (
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Process Scan'
                )}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
              <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/incidents')}
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-semibold text-white transition hover:border-accent hover:bg-white/10"
                >
                  Report Incident
                  <span className="block text-xs text-gray-400 mt-1">Create incident reports immediately</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/visitors')}
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-semibold text-white transition hover:border-accent hover:bg-white/10"
                >
                  Manage Visitors
                  <span className="block text-xs text-gray-400 mt-1">Sign in and sign out visitors</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/reports')}
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-semibold text-white transition hover:border-accent hover:bg-white/10"
                >
                  Submit Report
                  <span className="block text-xs text-gray-400 mt-1">File security and incident reports</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/lockdown')}
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-semibold text-white transition hover:border-accent hover:bg-white/10"
                >
                  Lockdown Status
                  <span className="block text-xs text-gray-400 mt-1">View or initiate lockdown events</span>
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
              <h3 className="text-lg font-semibold text-white mb-3">Info</h3>
              <p className="text-sm text-gray-400">
                Guard accounts have full access to incident reporting, visitor registration, report submission, and lockdown actions.
              </p>
              <div className="mt-4 grid gap-3 text-sm text-gray-300">
                <div className="rounded-2xl bg-white/5 p-4">Create new incident reports instantly.</div>
                <div className="rounded-2xl bg-white/5 p-4">Register visitors and sign them out safely.</div>
                <div className="rounded-2xl bg-white/5 p-4">Submit and track reports from the field.</div>
                <div className="rounded-2xl bg-white/5 p-4">Trigger or release lockdown if authorized.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scan result and recent scans */}
        <div className="grid gap-4 xl:grid-cols-[1.75fr_1fr]">
          {/* Scan Result */}
          {scanResult && (
            <div
              className={`rounded-2xl p-5 border-2 transition-all ${
                scanResult.type === 'success'
                  ? scanResult.data?.isLate
                    ? 'bg-warning-light border-warning'
                    : 'bg-success-light border-success'
                  : scanResult.type === 'flagged'
                  ? 'bg-orange-50 border-orange-400'
                  : 'bg-danger-light border-danger'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {scanResult.type === 'success' ? (
                    scanResult.data?.isLate ? (
                      <Clock size={36} className="text-warning" />
                    ) : (
                      <CheckCircle size={36} className="text-success" />
                    )
                  ) : scanResult.type === 'flagged' ? (
                    <AlertTriangle size={36} className="text-orange-500" />
                  ) : (
                    <XCircle size={36} className="text-danger" />
                  )}
                </div>

                <div className="flex-1">
                  {scanResult.type === 'success' ? (
                    <>
                      <p
                        className={`font-bold text-lg ${
                          scanResult.data?.isLate ? 'text-warning' : 'text-success'
                        }`}
                      >
                        {scanResult.data?.scanType === 'entry'
                          ? '✓ ENTRY APPROVED'
                          : '✓ EXIT RECORDED'}
                        {scanResult.data?.isLate && ' — LATE ARRIVAL'}
                      </p>
                      <p className="text-primary font-bold text-xl mt-1">
                        {scanResult.data?.person?.name}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-lg">
                          {scanResult.data?.person?.admissionNumber}
                        </span>
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-lg">
                          {scanResult.data?.person?.class}
                        </span>
                        {scanResult.data?.isLate && (
                          <span className="bg-warning/20 text-warning text-xs font-semibold px-2 py-1 rounded-lg">
                            {scanResult.data?.minutesLate} mins late
                          </span>
                        )}
                      </div>
                    </>
                  ) : scanResult.type === 'flagged' ? (
                    <>
                      <p className="font-bold text-lg text-orange-600">⚠️ WATCHLIST ALERT</p>
                      <p className="text-orange-700 text-sm mt-1">{scanResult.message}</p>
                      <p className="text-orange-600 text-xs font-semibold mt-2">
                        Contact admin immediately. Do not allow entry.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-danger">✗ ACCESS DENIED</p>
                      <p className="text-danger/80 text-sm mt-1">{scanResult.message}</p>
                    </>
                  )}
                </div>

                {scanResult.type === 'success' && scanResult.data?.person?.photo && (
                  <img
                    src={scanResult.data.person.photo}
                    alt="Student"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow"
                  />
                )}
              </div>
            </div>
          )}

          {/* Recent scans */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <h3 className="text-white/70 text-sm font-semibold">
                Recent Scans — {selectedGate}
              </h3>
            </div>

            {recentScans.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-4">No scans at this gate yet</p>
            ) : (
              <div className="space-y-2">
                {recentScans.map((scan) => (
                  <div
                    key={scan._id}
                    className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-white/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">
                        {scan.student
                          ? `${scan.student.firstName} ${scan.student.lastName}`
                          : 'Staff/Visitor'}
                      </p>
                      <p className="text-white/30 text-xs">
                        {scan.student?.admissionNumber} · {scan.student?.class}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          scan.scanType === 'entry'
                            ? 'bg-success/20 text-success'
                            : 'bg-danger/20 text-danger'
                        }`}
                      >
                        {scan.scanType === 'entry' ? 'IN' : 'OUT'}
                      </span>
                      <span className="text-white/30 text-xs">{formatTime(scan.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}