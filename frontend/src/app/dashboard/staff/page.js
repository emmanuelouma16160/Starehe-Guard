'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Shield, UserCheck } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/auth/users?limit=100');
      const staffUsers = (data.users || []).filter((user) =>
        ['super_admin', 'admin', 'guard', 'teacher'].includes(user.role)
      );
      setStaff(staffUsers);
    } catch (error) {
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.includes(search)
  );

  return (
    <>
      <TopBar title="Staff Management" subtitle="View and manage staff accounts" />
      <div className="p-6 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full pl-10"
              placeholder="Search staff by name, email, or phone"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Shield size={18} />
            Total staff: {staff.length}
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-500">
                    Loading staff members...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-500">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member._id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{member.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{member.email}</td>
                    <td className="px-4 py-3 text-slate-600">{member.phone}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{member.role}</td>
                    <td className="px-4 py-3 text-slate-600">{member.isActive ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
