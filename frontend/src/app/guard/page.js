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
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1A1A' }}>
      {/* Header */}
      <header className="bg-primary border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">StaSentry</h1>
            <p className="text-accent/60 text-xs">Guard Interface</p>
          </div>
        </div>

        <div className="text-center hidden sm:block">
          <p className="text-white font-mono text-lg font-bold">
            {currentTime.toLocaleTimeString('en-KE', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
              timeZone: 'Africa/Nairobi',
            })}
          </p>
          <p className="text-white/40 text-xs">
            {currentTime.toLocaleDateString('en-KE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              timeZone: 'Africa/Nairobi',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm hidden sm:inline">{user.name}</span>
          <button
            onClick={handleLogout}
            className="p-2 text-white/40 hover:text-danger rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* Gate selector */}
        <div className="mb-4">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
            Current Gate
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GATES.map((gate) => (
              <button
                key={gate}
                onClick={() => setSelectedGate(gate)}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                  selectedGate === gate
                    ? 'bg-accent text-primary'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {gate}
              </button>
            ))}
          </div>
        </div>

        {/* Scan input */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ScanLine size={20} className="text-accent" />
            <h2 className="text-white font-semibold">Scan QR Code</h2>
          </div>

          <form onSubmit={handleScan} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan QR code or type admission number..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-accent transition-all"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isScanning || !scanInput.trim()}
              className="bg-accent hover:bg-accent-dark text-primary font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <ScanLine size={20} />
              )}
            </button>
          </form>

          <p className="text-white/30 text-xs mt-3 text-center">
            Position QR code in front of scanner or type manually
          </p>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div
            className={`rounded-2xl p-5 mb-4 border-2 transition-all ${
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
    </div>
  );
}