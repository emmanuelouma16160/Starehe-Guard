'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Send, Eye, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'security',
    description: '',
    priority: 'normal',
    shift: 'day',
  });

  const categories = [
    'security',
    'maintenance',
    'incident',
    'visitor',
    'student',
    'staff',
    'other'
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const endpoint = user?.role === 'admin' || user?.role === 'super_admin' 
        ? '/reports/all' 
        : '/reports';
      const { data } = await api.get(endpoint);
      setReports(data);
    } catch (error) {
      toast.error('Failed to load reports');
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
      const { data } = await api.post('/reports', {
        ...formData,
        reportedBy: user.id,
        status: 'pending',
      });
      toast.success('Report submitted successfully');
      setShowModal(false);
      setFormData({
        title: '',
        category: 'security',
        description: '',
        priority: 'normal',
        shift: 'day',
      });
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (reportId, status) => {
    try {
      await api.put(`/reports/${reportId}/status`, { status });
      toast.success(`Report ${status}`);
      fetchReports();
    } catch (error) {
      toast.error('Failed to update report status');
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      normal: 'bg-blue-100 text-blue-700',
    };
    return styles[priority] || styles.normal;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewed: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return styles[status] || styles.pending;
  };

  const getCategoryLabel = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <>
      <TopBar 
        title="Reports" 
        subtitle={isAdmin ? "Review and manage guard reports" : "Submit and track your reports"} 
      />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-primary">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Eye size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Reviewed</p>
                <p className="text-2xl font-bold text-primary">
                  {reports.filter(r => r.status === 'reviewed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-primary">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-primary">{reports.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primary">All Reports</h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus size={18} />
            New Report
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : reports.length === 0 ? (
            <div className="card text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">No reports found</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-primary">{report.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(report.priority)}`}>
                        {report.priority.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {getCategoryLabel(report.category)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{report.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>Reported by: {report.reportedBy?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{new Date(report.createdAt).toLocaleString()}</span>
                      {report.shift && (
                        <>
                          <span>•</span>
                          <span>Shift: {report.shift}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isAdmin && report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(report._id, 'reviewed')}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Mark as Reviewed"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(report._id, 'resolved')}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                          title="Mark as Resolved"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Report Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-primary">Submit Report</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      title: '',
                      category: 'security',
                      description: '',
                      priority: 'normal',
                      shift: 'day',
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="label">Report Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="Brief title of the report"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="input"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {getCategoryLabel(cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Priority *</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      required
                      className="input"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Shift *</label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    <option value="day">Day (6AM - 6PM)</option>
                    <option value="night">Night (6PM - 6AM)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="input"
                    placeholder="Detailed description of the report..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        title: '',
                        category: 'security',
                        description: '',
                        priority: 'normal',
                        shift: 'day',
                      });
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">{selectedReport.title}</h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(selectedReport.priority)}`}>
                      {selectedReport.priority.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(selectedReport.status)}`}>
                      {selectedReport.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {getCategoryLabel(selectedReport.category)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="mt-1">{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Reported By</p>
                    <p className="font-medium">{selectedReport.reportedBy?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Shift</p>
                    <p className="font-medium capitalize">{selectedReport.shift || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Reported At</p>
                    <p className="font-medium">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedReport.updatedAt !== selectedReport.createdAt && (
                    <div>
                      <p className="text-xs text-gray-400">Last Updated</p>
                      <p className="font-medium">{new Date(selectedReport.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {isAdmin && selectedReport.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport._id, 'reviewed');
                        setSelectedReport(null);
                      }}
                      className="btn-outline flex-1"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport._id, 'resolved');
                        setSelectedReport(null);
                      }}
                      className="btn-success flex-1"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport._id, 'rejected');
                        setSelectedReport(null);
                      }}
                      className="btn-danger flex-1"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}