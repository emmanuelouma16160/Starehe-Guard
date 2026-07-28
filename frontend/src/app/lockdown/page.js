'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Lock, Unlock, Bell, Users, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function LockdownPage() {
  const { user } = useAuthStore();
  const [lockdownStatus, setLockdownStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [history, setHistory] = useState([]);

  const canControl = ['guard', 'admin', 'super_admin'].includes(user?.role);
  const isGuard = user?.role === 'guard';

  useEffect(() => {
    fetchLockdownStatus();
    fetchHistory();
  }, []);

  const fetchLockdownStatus = async () => {
    try {
      const { data } = await api.get('/lockdown/status');
      setLockdownStatus(data);
    } catch (error) {
      toast.error('Failed to fetch lockdown status');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/lockdown/history');
      setHistory(data);
    } catch {
      // Silent fail
    }
  };

  const triggerLockdown = async () => {
    setTriggering(true);
    try {
      await api.post('/lockdown/trigger', {
        triggeredBy: user.id,
        reason: notificationMessage || 'Security lockdown initiated',
      });
      toast.success('🚨 Lockdown has been triggered!');
      setShowConfirm(false);
      setNotificationMessage('');
      fetchLockdownStatus();
      fetchHistory();
    } catch (error) {
      toast.error('Failed to trigger lockdown');
    } finally {
      setTriggering(false);
    }
  };

  const releaseLockdown = async () => {
    setTriggering(true);
    try {
      await api.post('/lockdown/release', {
        releasedBy: user.id,
      });
      toast.success('✅ Lockdown has been released');
      fetchLockdownStatus();
      fetchHistory();
    } catch (error) {
      toast.error('Failed to release lockdown');
    } finally {
      setTriggering(false);
    }
  };

  const notifyAdmin = async () => {
    if (!notificationMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setNotifying(true);
    try {
      await api.post('/lockdown/notify', {
        message: notificationMessage,
        from: user.id,
      });
      toast.success('Notification sent to admin');
      setNotificationMessage('');
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setNotifying(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-red-600' : 'text-green-600';
  };

  const getStatusBg = (status) => {
    return status === 'active' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? Lock : Unlock;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <TopBar 
        title="Lockdown Management"
      subtitle={canControl ? 'Control and monitor school lockdown' : 'View lockdown status'}
      />
      <div className="p-6 space-y-5">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Current Status */}
            <div className={`card ${getStatusBg(lockdownStatus?.status)} border-2`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${lockdownStatus?.status === 'active' ? 'bg-red-100' : 'bg-green-100'}`}>
                  {lockdownStatus?.status === 'active' ? (
                    <Lock size={32} className="text-red-600" />
                  ) : (
                    <Unlock size={32} className="text-green-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Status: <span className={getStatusColor(lockdownStatus?.status)}>
                      {lockdownStatus?.status === 'active' ? '🔴 LOCKDOWN ACTIVE' : '🟢 NORMAL'}
                    </span>
                  </h2>
                  {lockdownStatus?.status === 'active' && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Triggered by: {lockdownStatus?.triggeredBy?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Time: {formatTime(lockdownStatus?.triggeredAt)}
                      </p>
                      {lockdownStatus?.reason && (
                        <p className="text-sm text-gray-600">
                          Reason: {lockdownStatus.reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-auto">
                  {canControl && (
                    <>
                      {lockdownStatus?.status === 'active' ? (
                        <button
                          onClick={() => setShowConfirm(true)}
                          disabled={triggering}
                          className="btn-success disabled:opacity-50"
                        >
                          {triggering ? 'Processing...' : 'Release Lockdown'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowConfirm(true)}
                          disabled={triggering}
                          className="btn-danger disabled:opacity-50"
                        >
                          {triggering ? 'Processing...' : 'Trigger Lockdown'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {canControl && (
              <div className="card">
                <h3 className="font-bold text-primary mb-3">Lockdown Controls</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield size={20} className="text-accent" />
                      <div>
                        <p className="text-sm font-medium">Lockdown Status</p>
                        <p className="text-xs text-gray-500">
                          {lockdownStatus?.status === 'active' ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-accent" />
                      <div>
                        <p className="text-sm font-medium">Last Trigger</p>
                        <p className="text-xs text-gray-500">
                          {lockdownStatus?.triggeredAt 
                            ? formatTime(lockdownStatus.triggeredAt)
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guard Notification */}
            {lockdownStatus?.status !== 'active' && canControl && (
              <div className="card">
                <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                  <Bell size={18} />
                  Notify Admin
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  If you notice any security concerns, notify the admin or start lockdown.
                </p>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <input
                    type="text"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Describe the security concern..."
                    className="input flex-1"
                  />
                  <button
                    onClick={notifyAdmin}
                    disabled={notifying || !notificationMessage.trim()}
                    className="btn-primary disabled:opacity-50"
                  >
                    <Send size={18} />
                    Notify
                  </button>
                </div>
              </div>
            )}

            {/* History */}
            <div className="card">
              <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                <Clock size={18} />
                Lockdown History
              </h3>
              {history.length === 0 ? (
                <p className="text-sm text-gray-400">No lockdown history available</p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div key={entry._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className={`p-2 rounded-full ${entry.action === 'trigger' ? 'bg-red-100' : 'bg-green-100'}`}>
                        {entry.action === 'trigger' ? (
                          <AlertTriangle size={16} className="text-red-600" />
                        ) : (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {entry.action === 'trigger' ? '🔴 Lockdown Triggered' : '✅ Lockdown Released'}
                        </p>
                        <p className="text-xs text-gray-400">
                          By: {entry.user?.name || 'Unknown'} • {formatTime(entry.createdAt)}
                        </p>
                        {entry.reason && (
                          <p className="text-xs text-gray-500">Reason: {entry.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className={`w-16 h-16 ${lockdownStatus?.status === 'active' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {lockdownStatus?.status === 'active' ? (
                  <Unlock size={32} className="text-green-600" />
                ) : (
                  <Lock size={32} className="text-red-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-primary">
                {lockdownStatus?.status === 'active' ? 'Release Lockdown?' : 'Trigger Lockdown?'}
              </h3>
              <p className="text-gray-500 mt-2">
                {lockdownStatus?.status === 'active' 
                  ? 'Are you sure you want to release the lockdown? Normal operations will resume.'
                  : 'Are you sure you want to trigger a school lockdown? This will restrict all movement.'}
              </p>
              {lockdownStatus?.status !== 'active' && (
                <div className="mt-4">
                  <label className="label text-left">Reason for lockdown *</label>
                  <input
                    type="text"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Brief reason for lockdown..."
                    className="input"
                    required
                  />
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={lockdownStatus?.status === 'active' ? releaseLockdown : triggerLockdown}
                  disabled={triggering || (!notificationMessage.trim() && lockdownStatus?.status !== 'active')}
                  className={`flex-1 disabled:opacity-50 ${lockdownStatus?.status === 'active' ? 'btn-success' : 'btn-danger'}`}
                >
                  {triggering ? 'Processing...' : (lockdownStatus?.status === 'active' ? 'Release' : 'Trigger')}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}