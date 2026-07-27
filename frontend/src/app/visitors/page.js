'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, LogOut, Clock, User, Shield, AlertTriangle, X, Camera } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const VISITOR_TYPES = ['parent', 'old_starehian', 'other'];
const VISITOR_TYPE_LABELS = {
  parent: 'Parent/Guardian',
  old_starehian: 'Old Starehian',
  other: 'Other Visitor'
};

const VISITOR_STATUS = {
  inside: 'Inside School',
  outside: 'Signed Out',
  pending: 'Pending'
};

export default function VisitorsPage() {
  const { user } = useAuthStore();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idNumber: '',
    visitorType: 'other',
    purpose: '',
    hostName: '',
    hostDepartment: '',
    expectedDuration: 60, // minutes
    vehicleNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showBlacklistAlert, setShowBlacklistAlert] = useState(false);
  const [blacklistedVisitor, setBlacklistedVisitor] = useState(null);

  // Check if a visitor is blacklisted
  const checkBlacklist = async (phone, idNumber) => {
    try {
      const { data } = await api.post('/blacklist/check', { phone, idNumber });
      return data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const { data } = await api.get('/visitors');
      setVisitors(data);
    } catch (error) {
      toast.error('Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Check blacklist first
    try {
      const blacklistCheck = await checkBlacklist(formData.phone, formData.idNumber);
      if (blacklistCheck?.blacklisted) {
        setBlacklistedVisitor(blacklistCheck);
        setShowBlacklistAlert(true);
        setSubmitting(false);
        return;
      }
    } catch (error) {
      console.error('Blacklist check failed:', error);
    }

    try {
      const payload = {
        ...formData,
        arrivalTime: new Date().toISOString(),
        status: 'inside',
        signedInBy: user.id,
        badgeNumber: `V${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
      };

      const { data } = await api.post('/visitors', payload);
      toast.success(`Visitor signed in successfully! Badge: ${data.badgeNumber}`);
      setShowModal(false);
      setFormData({
        name: '',
        phone: '',
        idNumber: '',
        visitorType: 'other',
        purpose: '',
        hostName: '',
        hostDepartment: '',
        expectedDuration: 60,
        vehicleNumber: '',
      });
      fetchVisitors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sign in visitor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async (visitorId) => {
    if (!visitorId) {
      toast.error('Invalid visitor selection');
      return;
    }

    setSigningOut(true);
    try {
      const { data } = await api.put(`/visitors/${visitorId}/signout`, {
        signOutTime: new Date().toISOString(),
        signedOutBy: user.id,
      });
      toast.success(data.message || 'Visitor signed out successfully');
      setShowSignOutModal(null);
      fetchVisitors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sign out visitor');
    } finally {
      setSigningOut(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      inside: 'bg-green-100 text-green-700',
      outside: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return styles[status] || styles.pending;
  };

  const getVisitorTypeBadge = (type) => {
    const styles = {
      parent: 'bg-blue-100 text-blue-700',
      old_starehian: 'bg-purple-100 text-purple-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return styles[type] || styles.other;
  };

  const filteredVisitors = visitors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search) ||
    v.badgeNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <TopBar title="Visitor Management" subtitle="Sign in and manage visitors" />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Clock size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Currently Inside</p>
                <p className="text-2xl font-bold text-primary">
                  {visitors.filter(v => v.status === 'inside').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <User size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today's Visitors</p>
                <p className="text-2xl font-bold text-primary">
                  {visitors.filter(v => new Date(v.arrivalTime).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Shield size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Parents</p>
                <p className="text-2xl font-bold text-primary">
                  {visitors.filter(v => v.visitorType === 'parent').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Eye size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Old Starehians</p>
                <p className="text-2xl font-bold text-primary">
                  {visitors.filter(v => v.visitorType === 'old_starehian').length}
                </p>
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
              placeholder="Search visitors by name, phone, or badge..."
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex-shrink-0"
          >
            <Plus size={18} />
            Sign In Visitor
          </button>
        </div>

        {/* Visitors Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Badge</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Visitor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Host</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Arrival</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No visitors found
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-accent">
                          {visitor.badgeNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-primary">{visitor.name}</p>
                          <p className="text-xs text-gray-400">{visitor.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getVisitorTypeBadge(visitor.visitorType)}`}>
                          {VISITOR_TYPE_LABELS[visitor.visitorType] || visitor.visitorType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-primary">{visitor.hostName || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{visitor.hostDepartment || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">
                          {new Date(visitor.arrivalTime).toLocaleTimeString('en-KE', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(visitor.arrivalTime).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(visitor.status)}`}>
                          {VISITOR_STATUS[visitor.status] || visitor.status}
                        </span>
                        {visitor.expectedDuration && visitor.status === 'inside' && (
                          <p className="text-xs text-gray-400 mt-1">
                            Expected: {visitor.expectedDuration} min
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {visitor.status === 'inside' && (
                            <button
                              onClick={() => setShowSignOutModal(visitor._id)}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition"
                              title="Sign Out"
                            >
                              <LogOut size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedVisitor(visitor)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sign In Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-primary">Sign In Visitor</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowBlacklistAlert(false);
                    setBlacklistedVisitor(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              {showBlacklistAlert && blacklistedVisitor ? (
                <div className="p-6">
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                    <AlertTriangle size={48} className="text-red-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-red-700">⚠️ BLACKLISTED VISITOR</h3>
                    <p className="text-red-600 mt-2">
                      This person is not allowed access to the school!
                    </p>
                    <div className="mt-4 bg-white rounded-lg p-4 text-left space-y-2">
                      <p><strong>Name:</strong> {blacklistedVisitor.name}</p>
                      <p><strong>ID Number:</strong> {blacklistedVisitor.idNumber}</p>
                      <p><strong>Phone:</strong> {blacklistedVisitor.phone}</p>
                      <p><strong>Reason:</strong> {blacklistedVisitor.reason || 'Not specified'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowBlacklistAlert(false);
                        setBlacklistedVisitor(null);
                      }}
                      className="btn-danger mt-4"
                    >
                      I Understand - Deny Access
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSignIn} className="p-6 space-y-4">
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
                      <label className="label">ID/Passport Number</label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="ID or Passport number"
                      />
                    </div>
                    <div>
                      <label className="label">Visitor Type *</label>
                      <select
                        name="visitorType"
                        value={formData.visitorType}
                        onChange={handleInputChange}
                        required
                        className="input"
                      >
                        {VISITOR_TYPES.map(type => (
                          <option key={type} value={type}>
                            {VISITOR_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Purpose of Visit *</label>
                      <input
                        type="text"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="e.g., Meeting with principal, Picking up child"
                      />
                    </div>
                    <div>
                      <label className="label">Host Name *</label>
                      <input
                        type="text"
                        name="hostName"
                        value={formData.hostName}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="Teacher/Staff name"
                      />
                    </div>
                    <div>
                      <label className="label">Host Department</label>
                      <input
                        type="text"
                        name="hostDepartment"
                        value={formData.hostDepartment}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="e.g., Administration, Science"
                      />
                    </div>
                    <div>
                      <label className="label">Expected Duration (minutes) *</label>
                      <input
                        type="number"
                        name="expectedDuration"
                        value={formData.expectedDuration}
                        onChange={handleInputChange}
                        required
                        min={5}
                        max={480}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Vehicle Number</label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="KBZ 123A"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Sign In Visitor'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setShowBlacklistAlert(false);
                        setBlacklistedVisitor(null);
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Sign Out Confirmation Modal */}
        {showSignOutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut size={32} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary">Sign Out Visitor</h3>
                <p className="text-gray-500 mt-2">
                  Confirm that this visitor is leaving the school premises.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleSignOut(showSignOutModal)}
                    disabled={signingOut}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {signingOut ? 'Processing...' : 'Confirm Sign Out'}
                  </button>
                  <button
                    onClick={() => setShowSignOutModal(null)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visitor Details Modal */}
        {selectedVisitor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">Visitor Details</h2>
                <button
                  onClick={() => setSelectedVisitor(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                    <User size={32} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">{selectedVisitor.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">Badge: {selectedVisitor.badgeNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-medium">{selectedVisitor.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">ID Number</p>
                    <p className="font-medium">{selectedVisitor.idNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="font-medium">{VISITOR_TYPE_LABELS[selectedVisitor.visitorType]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="font-medium">{VISITOR_STATUS[selectedVisitor.status]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Arrival Time</p>
                    <p className="font-medium">
                      {new Date(selectedVisitor.arrivalTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Duration</p>
                    <p className="font-medium">{selectedVisitor.expectedDuration} minutes</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Purpose</p>
                    <p className="font-medium">{selectedVisitor.purpose || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Host</p>
                    <p className="font-medium">
                      {selectedVisitor.hostName}
                      {selectedVisitor.hostDepartment && ` (${selectedVisitor.hostDepartment})`}
                    </p>
                  </div>
                  {selectedVisitor.vehicleNumber && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Vehicle</p>
                      <p className="font-medium">{selectedVisitor.vehicleNumber}</p>
                    </div>
                  )}
                  {selectedVisitor.signOutTime && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Sign Out Time</p>
                      <p className="font-medium">{new Date(selectedVisitor.signOutTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}