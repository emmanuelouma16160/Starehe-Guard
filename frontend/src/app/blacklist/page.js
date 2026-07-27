'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Search, AlertTriangle, X, User, Phone, CreditCard, Trash2 } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function BlacklistPage() {
  const { user } = useAuthStore();
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idNumber: '',
    reason: '',
    notes: '',
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      const { data } = await api.get('/blacklist');
      setBlacklist(data);
    } catch (error) {
      toast.error('Failed to load blacklist');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/blacklist', formData);
      toast.success('Person added to blacklist successfully');
      setShowModal(false);
      setFormData({
        name: '',
        phone: '',
        idNumber: '',
        reason: '',
        notes: '',
      });
      fetchBlacklist();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to blacklist');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/blacklist/${id}`);
      toast.success('Removed from blacklist');
      fetchBlacklist();
    } catch (error) {
      toast.error('Failed to remove from blacklist');
    } finally {
      setDeleting(null);
    }
  };

  const filteredBlacklist = blacklist.filter(person =>
    person.name?.toLowerCase().includes(search.toLowerCase()) ||
    person.phone?.includes(search) ||
    person.idNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <>
        <TopBar title="Blacklist" subtitle="Restricted access list" />
        <div className="p-6">
          <div className="card text-center py-12">
            <Shield size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-xl font-bold text-primary">Access Denied</h3>
            <p className="text-gray-500 mt-2">
              Only administrators can manage the blacklist.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Blacklist Management" subtitle="Manage people not allowed access to the school" />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Blacklisted</p>
                <p className="text-2xl font-bold text-primary">{blacklist.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or ID..."
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-danger flex-shrink-0"
          >
            <Plus size={18} />
            Add to Blacklist
          </button>
        </div>

        {/* Blacklist Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50 border-b border-red-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-red-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-red-700 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-red-700 uppercase">ID Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-red-700 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-red-700 uppercase">Added By</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-red-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredBlacklist.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      {search ? 'No matching results' : 'No people blacklisted'}
                    </td>
                  </tr>
                ) : (
                  filteredBlacklist.map((person) => (
                    <tr key={person._id} className="border-b border-gray-50 hover:bg-red-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-red-600" />
                          </div>
                          <span className="font-medium text-primary">{person.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span>{person.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-gray-400" />
                          <span>{person.idNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{person.reason || 'Not specified'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{person.addedBy?.name || 'Unknown'}</span>
                        <p className="text-xs text-gray-400">
                          {new Date(person.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRemove(person._id)}
                          disabled={deleting === person._id}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          title="Remove from blacklist"
                        >
                          {deleting === person._id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add to Blacklist Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  Add to Blacklist
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input"
                      placeholder="0712345678"
                    />
                  </div>
                  <div>
                    <label className="label">ID/Passport Number *</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      required
                      className="input"
                      placeholder="ID or Passport number"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Reason for Blacklisting *</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    <option value="">Select a reason...</option>
                    <option value="security_threat">Security Threat</option>
                    <option value="previous_incident">Previous Incident</option>
                    <option value="unauthorized_access">Unauthorized Access Attempt</option>
                    <option value="harassment">Harassment/Intimidation</option>
                    <option value="trespassing">Trespassing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="input"
                    placeholder="Additional details about this person..."
                  />
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Warning</p>
                      <p className="text-sm text-red-600">
                        Adding someone to the blacklist will automatically block their access to the school.
                        Guards will be notified if they attempt to enter.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-danger flex-1 disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add to Blacklist'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}