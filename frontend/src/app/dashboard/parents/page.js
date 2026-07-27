'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ParentsPage() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const { data } = await api.get('/auth/users?limit=100&role=parent');
      setParents(data.users || []);
    } catch (error) {
      toast.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter((parent) =>
    parent.name?.toLowerCase().includes(search.toLowerCase()) ||
    parent.email?.toLowerCase().includes(search.toLowerCase()) ||
    parent.phone?.includes(search)
  );

  return (
    <>
      <TopBar title="Parents" subtitle="View registered parents and guardians" />
      <div className="p-6 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full pl-10"
              placeholder="Search parents by name, email, or phone"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Users size={18} />
            Total parents: {parents.length}
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
                    Loading parents...
                  </td>
                </tr>
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-500">
                    No parents found.
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => (
                  <tr key={parent._id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{parent.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{parent.email}</td>
                    <td className="px-4 py-3 text-slate-600">{parent.phone}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{parent.role}</td>
                    <td className="px-4 py-3 text-slate-600">{parent.isActive ? 'Active' : 'Inactive'}</td>
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
