'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Users, UserCheck, AlertTriangle, FileText, Shield, MessageCircle, Lock } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    incidents: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      try {
        const [studentsRes, incidentsRes] = await Promise.all([
          api.get('/students?limit=1'),
          api.get('/incidents?limit=1'),
        ]);

        if (!active) return;

        setStats({
          students: studentsRes.data.pagination?.total || 0,
          staff: 0,
          incidents: incidentsRes.data.pagination?.total || incidentsRes.data.incidents?.length || 0,
          messages: 0,
        });
      } catch {
        // Silent fail
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      active = false;
    };
  }, []);

  const role = user?.role;
  const quickActions = useMemo(() => [
    ...(role === 'parent'
      ? [
          {
            title: 'My Students',
            description: 'Track your children using admission numbers',
            href: '/dashboard/students',
            icon: Users,
            color: '#00D4AA',
            bg: 'rgba(0, 212, 170, 0.1)',
          },
          {
            title: 'Messages',
            description: 'Read school messages and notices',
            href: '/dashboard/messages',
            icon: MessageCircle,
            color: '#3B82F6',
            bg: 'rgba(59, 130, 246, 0.1)',
          },
        ]
      : []),
    ...((role === 'admin' || role === 'super_admin')
      ? [
          {
            title: 'Add Student',
            description: 'Register a new student with parent details',
            href: '/dashboard/students/new',
            icon: Users,
            color: '#00D4AA',
            bg: 'rgba(0, 212, 170, 0.1)',
          },
          {
            title: 'Manage Staff',
            description: 'Create and approve staff accounts',
            href: '/dashboard/staff',
            icon: UserCheck,
            color: '#3B82F6',
            bg: 'rgba(59, 130, 246, 0.1)',
          },
          {
            title: 'View Reports',
            description: 'Generate security reports',
            href: '/dashboard/reports',
            icon: FileText,
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
          },
        ]
      : []),
    ...(role === 'teacher'
      ? [
          {
            title: 'Students',
            description: 'Review student records and admissions',
            href: '/dashboard/students',
            icon: Users,
            color: '#00D4AA',
            bg: 'rgba(0, 212, 170, 0.1)',
          },
          {
            title: 'Messages',
            description: 'Read school messages and notices',
            href: '/dashboard/messages',
            icon: MessageCircle,
            color: '#3B82F6',
            bg: 'rgba(59, 130, 246, 0.1)',
          },
        ]
      : []),
    ...((role === 'guard' || role === 'admin' || role === 'super_admin')
      ? [
          {
            title: 'Report Incident',
            description: 'Log a security incident',
            href: '/dashboard/incidents/new',
            icon: AlertTriangle,
            color: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.1)',
          },
          {
            title: 'Generate Report',
            description: 'Create a new security report',
            href: '/dashboard/reports',
            icon: FileText,
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
          },
          {
            title: 'Lockdown Status',
            description: 'View and monitor lockdown status',
            href: '/dashboard/lockdown',
            icon: Lock,
            color: '#3B82F6',
            bg: 'rgba(59, 130, 246, 0.1)',
          },
        ]
      : []),
    ...(role === 'guard' || role === 'admin' || role === 'super_admin'
      ? [
          {
            title: 'Visitors',
            description: 'Register visitors and gate attendance',
            href: '/dashboard/visitors',
            icon: AlertTriangle,
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
          },
        ]
      : []),
  ], [role]);

  return (
    <>
      <TopBar title="Dashboard" subtitle="School Security Overview" />
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.05), rgba(0, 212, 170, 0.1))', borderColor: 'rgba(0, 212, 170, 0.2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0F1A1A]">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                You are logged in as <span className="font-semibold text-[#00D4AA]">{user?.role}</span>
              </p>
              {user?.phone && (
                <p className="text-xs text-slate-400 mt-1">📞 {user.phone}</p>
              )}
            </div>
            <div className="w-16 h-16 bg-[#00D4AA]/20 rounded-full flex items-center justify-center">
              <Shield size={32} className="text-[#00D4AA]" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#00D4AA]/10 rounded-xl">
                <Users size={20} className="text-[#00D4AA]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1A1A]">{loading ? '...' : stats.students}</p>
                <p className="text-xs text-slate-500">Total Students</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <UserCheck size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1A1A]">{loading ? '...' : stats.staff}</p>
                <p className="text-xs text-slate-500">Staff Members</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#EF4444]/10 rounded-xl">
                <AlertTriangle size={20} className="text-[#EF4444]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1A1A]">{loading ? '...' : stats.incidents}</p>
                <p className="text-xs text-slate-500">Total Incidents</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#F59E0B]/10 rounded-xl">
                <MessageCircle size={20} className="text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1A1A]">{loading ? '...' : stats.messages}</p>
                <p className="text-xs text-slate-500">Unread Messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-semibold text-[#0F1A1A] mb-4">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href} className="card hover:border-[#00D4AA]/30 group">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl" style={{ background: action.bg }}>
                      <Icon size={20} style={{ color: action.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0F1A1A] text-sm">{action.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}