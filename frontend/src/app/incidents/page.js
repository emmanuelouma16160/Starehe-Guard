'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Eye, CheckCircle, Clock, X, Flag, Users, MapPin } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const INCIDENT_TYPES = [
  'suspicious_activity',
  'trespassing',
  'theft',
  'vandalism',
  'harassment',
  'medical_emergency',
  'fire',
  'other'
];

const INCIDENT_LABELS = {
  suspicious_activity: 'Suspicious Activity',
  trespassing: 'Trespassing',
  theft: 'Theft',
  vandalism: 'Vandalism',
  harassment: 'Harassment',
  medical_emergency: 'Medical Emergency',
  fire: 'Fire',
  other: 'Other'
};

const INCIDENT_SEVERITY = ['low', 'medium', 'high', 'critical'];

export default function IncidentsPage() {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'suspicious_activity',
    severity: 'medium',
    description: '',
    location: '',
    witnessName: '',
    witnessPhone: '',
    actionsTaken: '',
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const endpoint = isAdmin ? '/incidents/all' : '/incidents';
      const { data } = await api.get(endpoint);
      setIncidents(data);
    } catch (error) {
      toast.error('Failed to load incidents');
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
      const { data } = await api.post('/incidents', {
        ...formData,
        reportedBy: user.id,
        status: 'pending',
      });
      toast.success('Incident reported successfully');
      setShowModal(false);
      setFormData({
        type: 'suspicious_activity',
        severity: 'medium',
        description: '',
        location: '',
        witnessName: '',
        witnessPhone: '',
        actionsTaken: '',
      });
      fetchIncidents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to report incident');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (incidentId, status) => {
    try {
      await api.put(`/incidents/${incidentId}/status`, { status });
      toast.success(`Incident ${status}`);
      fetchIncidents();
    } catch (error) {
      toast.error('Failed to update incident');
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      critical: 'bg-red-600 text-white',
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700',
    };
    return styles[severity] || styles.medium;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      investigating: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || styles.pending;
  };

  return (
    <>
      <TopBar 
        title="Incidents" 
        subtitle={isAdmin ? "Review and manage all incidents" : "Report and track incidents"} 
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
                  {incidents.filter(i => i.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Flag size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Investigating</p>
                <p className="text-2xl font-bold text-primary">
                  {incidents.filter(i => i.status === 'investigating').length}
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
                  {incidents.filter(i => i.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <AlertTriangle size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-primary">{incidents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primary">All Incidents</h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn-danger"
          >
            <Plus size={18} />
            Report Incident
          </button>
        </div>

        {/* Incidents List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="card text-center py-12">
              <AlertTriangle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">No incidents reported</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <div key={incident._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-primary">
                        {INCIDENT_LABELS[incident.type] || incident.type}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(incident.status)}`}>
                        {incident.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{incident.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {incident.location || 'Unknown location'}
                      </span>
                      <span>•</span>
                      <span>Reported by: {incident.reportedBy?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{new Date(incident.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedIncident(incident)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Report Incident Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  Report Incident
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
                    <label className="label">Incident Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="input"
                    >
                      {INCIDENT_TYPES.map(type => (
                        <option key={type} value={type}>
                          {INCIDENT_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Severity *</label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      required
                      className="input"
                    >
                      {INCIDENT_SEVERITY.map(sev => (
                        <option key={sev} value={sev}>
                          {sev.charAt(0).toUpperCase() + sev.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="input"
                    placeholder="Detailed description of the incident..."
                  />
                </div>

                <div>
                  <label className="label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="Where did the incident occur?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Witness Name</label>
                    <input
                      type="text"
                      name="witnessName"
                      value={formData.witnessName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Name of witness"
                    />
                  </div>
                  <div>
                    <label className="label">Witness Phone</label>
                    <input
                      type="tel"
                      name="witnessPhone"
                      value={formData.witnessPhone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="0712345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Actions Taken</label>
                  <textarea
                    name="actionsTaken"
                    value={formData.actionsTaken}
                    onChange={handleInputChange}
                    rows={2}
                    className="input"
                    placeholder="What actions were taken immediately?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-danger flex-1 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Report Incident'}
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

        {/* Incident Details Modal */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">Incident Details</h2>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-primary">
                    {INCIDENT_LABELS[selectedIncident.type] || selectedIncident.type}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityBadge(selectedIncident.severity)}`}>
                    {selectedIncident.severity.toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(selectedIncident.status)}`}>
                    {selectedIncident.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="mt-1">{selectedIncident.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="font-medium">{selectedIncident.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Reported By</p>
                    <p className="font-medium">{selectedIncident.reportedBy?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Reported At</p>
                    <p className="font-medium">{new Date(selectedIncident.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedIncident.witnessName && (
                    <div>
                      <p className="text-xs text-gray-400">Witness</p>
                      <p className="font-medium">{selectedIncident.witnessName}</p>
                    </div>
                  )}
                  {selectedIncident.actionsTaken && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Actions Taken</p>
                      <p className="font-medium">{selectedIncident.actionsTaken}</p>
                    </div>
                  )}
                </div>

                {isAdmin && selectedIncident.status !== 'closed' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    {selectedIncident.status === 'pending' && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedIncident._id, 'investigating');
                          setSelectedIncident(null);
                        }}
                        className="btn-outline flex-1"
                      >
                        Start Investigation
                      </button>
                    )}
                    {selectedIncident.status === 'investigating' && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedIncident._id, 'resolved');
                          setSelectedIncident(null);
                        }}
                        className="btn-success flex-1"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedIncident._id, 'closed');
                        setSelectedIncident(null);
                      }}
                      className="btn-primary flex-1"
                    >
                      Close Incident
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