'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, X } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar title="Notifications" subtitle="Recent system notifications" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 p-3">
                <Bell size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-primary">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Latest</p>
                <p className="text-2xl font-semibold text-primary">
                  {notifications[0]?.title || 'No notifications'}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gray-100 p-3">
                <X size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Unread</p>
                <p className="text-2xl font-semibold text-primary">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="card p-8 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              No notifications found.
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification._id || notification.id || notification.createdAt} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-primary">
                      {notification.title || 'Notification'}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {notification.message || notification.body || 'No description available.'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.createdAt || notification.createdAtAt || notification.updatedAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
