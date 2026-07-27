'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, ChevronRight, QrCode } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/useAuthStore';

const STATUS_BADGE = {
  inside: 'badge-success',
  outside: 'badge-gray',
  unknown: 'badge-gray',
};

export default function StudentsPage() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const endpoint = user?.role === 'parent' ? '/students/mine' : '/students';
        const params = new URLSearchParams({ page, limit: 20 });
        if (search) params.set('search', search);
        if (classFilter) params.set('class', classFilter);
        if (statusFilter) params.set('status', statusFilter);

        const { data } = await api.get(`${endpoint}${endpoint.includes('?') ? '&' : '?'}${params.toString()}`);
        setStudents(data.students);
        setPagination(data.pagination);
      } catch {
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timeout);
  }, [search, classFilter, statusFilter, page, user?.role]);

  return (
    <>
      <TopBar title="Student Management" subtitle="Manage students and their QR codes" />
      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or admission number..."
              className="input pl-9"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="input w-auto"
          >
            <option value="">All Classes</option>
            {['Form 1', 'Form 2', 'Form 3', 'Form 4'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input w-auto"
          >
            <option value="">All Status</option>
            <option value="inside">Inside</option>
            <option value="outside">Outside</option>
          </select>

          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link href="/dashboard/students/new" className="btn-primary whitespace-nowrap">
              <Plus size={16} /> Add Student
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {pagination.total || 0} students total
          </span>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No students found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Adm No.
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Class
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Last Seen
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {student.photo ? (
                            <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-accent font-bold text-sm">
                              {student.firstName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-primary">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-400 md:hidden">{student.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {student.admissionNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                      {student.class}
                    </td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[student.currentStatus]}>
                        {student.currentStatus === 'inside' ? 'Inside' : 'Outside'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                      {student.lastScanTime
                        ? new Date(student.lastScanTime).toLocaleString('en-KE', {
                            timeZone: 'Africa/Nairobi',
                          })
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/students/${student._id}/qrcode`}
                          className="p-1.5 text-accent hover:bg-accent-light rounded-lg transition-colors"
                          title="View QR Code"
                        >
                          <QrCode size={15} />
                        </Link>
                        <Link
                          href={`/dashboard/students/${student._id}`}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}