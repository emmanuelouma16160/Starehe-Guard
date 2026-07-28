'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, User, Shield, AlertCircle } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const CLASSES = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
const STREAMS = ['A', 'B', 'C', 'D', 'E', 'East', 'West', 'North', 'South'];

const ParentSection = ({ title, type, required = false, parentDetails, handleChange }) => {
  const data = parentDetails[type];
  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-primary text-sm mb-3 flex items-center gap-2">
        {title}
        {required && <span className="text-danger text-xs">*</span>}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label text-xs">Full Name</label>
          <input
            name={`${type}.name`}
            value={data.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className="input"
          />
        </div>
        <div>
          <label className={`label text-xs ${required ? 'text-danger' : ''}`}>
            Phone Number {required && '*'}
          </label>
          <input
            name={`${type}.phone`}
            value={data.phone}
            onChange={handleChange}
            placeholder="0712345678"
            className={`input ${required ? 'border-accent/30 focus:border-accent' : ''}`}
            required={required}
          />
        </div>
        <div>
          <label className="label text-xs">Email</label>
          <input
            name={`${type}.email`}
            value={data.email}
            onChange={handleChange}
            placeholder="parent@email.com"
            className="input"
          />
        </div>
        <div>
          <label className="label text-xs">National ID</label>
          <input
            name={`${type}.nationalId`}
            value={data.nationalId}
            onChange={handleChange}
            placeholder="12345678"
            className="input"
          />
        </div>
      </div>
    </div>
  );
};

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    admissionNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    class: '',
    stream: '',
    yearOfAdmission: new Date().getFullYear(),
    photo: '',
    // ===== IMPROVEMENT: Parent Details =====
    parentDetails: {
      father: { name: '', phone: '', email: '', nationalId: '' },
      mother: { name: '', phone: '', email: '', nationalId: '' },
      guardian: { name: '', phone: '', email: '', nationalId: '' },
      emergency: { name: '', phone: '', email: '', relationship: '' },
    },
    medicalInfo: {
      bloodGroup: '',
      allergies: '',
      conditions: '',
      medications: '',
      emergencyNotes: '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        parentDetails: {
          ...prev.parentDetails,
          [parent]: {
            ...prev.parentDetails[parent],
            [field]: value,
          },
        },
      }));
    } else if (name.includes('_')) {
      const [category, field] = name.split('_');
      setFormData(prev => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/students', formData);
      toast.success('Student created successfully! Parents will be notified.');
      router.push('/dashboard/students');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar title="Add New Student" subtitle="Create student record with parent details" />
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Students
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h2 className="font-bold text-primary text-lg border-b border-gray-100 pb-3 mb-4">
              <User size={18} className="inline mr-2 text-accent" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Admission Number *</label>
                <input
                  name="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                  required
                  placeholder="ADM/2025/001"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Year of Admission *</label>
                <input
                  name="yearOfAdmission"
                  type="number"
                  value={formData.yearOfAdmission}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label">First Name *</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Kamau"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Date of Birth *</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Class *</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select class</option>
                  {CLASSES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Stream</label>
                <select
                  name="stream"
                  value={formData.stream}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select stream</option>
                  {STREAMS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Photo URL</label>
                <input
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* ===== IMPROVEMENT: Parent Details Section ===== */}
          <div className="card border-2 border-accent/20">
            <h2 className="font-bold text-primary text-lg border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <span className="text-accent">👨‍👩‍👦</span> Parent/Guardian Details
              <span className="text-xs text-accent font-normal ml-2">
                (Notifications will be sent to these contacts)
              </span>
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Parents with phone numbers will automatically receive SMS notifications 
                when their child enters or leaves the school.
              </p>
            </div>

            <ParentSection 
              title="👨 Father" 
              type="father" 
              parentDetails={formData.parentDetails} 
              handleChange={handleChange} 
            />
            <ParentSection 
              title="👩 Mother" 
              type="mother" 
              parentDetails={formData.parentDetails} 
              handleChange={handleChange} 
            />
            <ParentSection 
              title="👤 Guardian (Optional)" 
              type="guardian" 
              parentDetails={formData.parentDetails} 
              handleChange={handleChange} 
            />

            <div className="bg-danger-light rounded-xl p-4 border border-danger/20">
              <h3 className="font-semibold text-danger text-sm mb-3 flex items-center gap-2">
                <span>🚨</span> Emergency Contact
                <span className="text-xs text-danger/70 font-normal">(Required)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Full Name *</label>
                  <input
                    name="emergency.name"
                    value={formData.parentDetails.emergency.name}
                    onChange={handleChange}
                    placeholder="Emergency Contact Name"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label text-xs text-danger">Phone Number *</label>
                  <input
                    name="emergency.phone"
                    value={formData.parentDetails.emergency.phone}
                    onChange={handleChange}
                    placeholder="0712345678"
                    className="input border-danger/30 focus:border-danger"
                    required
                  />
                </div>
                <div>
                  <label className="label text-xs">Email</label>
                  <input
                    name="emergency.email"
                    value={formData.parentDetails.emergency.email}
                    onChange={handleChange}
                    placeholder="emergency@email.com"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label text-xs">Relationship</label>
                  <input
                    name="emergency.relationship"
                    value={formData.parentDetails.emergency.relationship}
                    onChange={handleChange}
                    placeholder="e.g. Aunt, Uncle, Neighbor"
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card">
            <h2 className="font-bold text-primary text-lg border-b border-gray-100 pb-3 mb-4">
              <Shield size={18} className="inline mr-2 text-accent" />
              Medical Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.medicalInfo.bloodGroup}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select blood group</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Allergies</label>
                <input
                  name="allergies"
                  value={formData.medicalInfo.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Peanuts, Penicillin"
                  className="input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Medical Conditions</label>
                <textarea
                  name="conditions"
                  value={formData.medicalInfo.conditions}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any known medical conditions..."
                  className="input resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Medications</label>
                <textarea
                  name="medications"
                  value={formData.medicalInfo.medications}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Current medications..."
                  className="input resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Emergency Notes</label>
                <textarea
                  name="emergencyNotes"
                  value={formData.medicalInfo.emergencyNotes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any additional emergency information..."
                  className="input resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Student & Notify Parents'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}