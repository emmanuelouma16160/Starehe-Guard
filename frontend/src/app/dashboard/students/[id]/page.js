'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, Users, CalendarDays, MapPin, Phone, Mail } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await api.get(`/students/${params.id}`);
        setStudent(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load student details');
        router.push('/dashboard/students');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchStudent();
    }
  }, [params, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <>
      <TopBar title="Student Details" subtitle={`Admission ${student.admissionNumber}`} />
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => router.push('/dashboard/students')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent"
        >
          <ArrowLeft size={16} /> Back to students
        </button>

        <div className="card p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">{student.firstName} {student.lastName}</h1>
              <p className="text-sm text-gray-500">Admission Number: {student.admissionNumber}</p>
              <p className="text-sm text-gray-500">Class: {student.class}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/students/${student._id}/qrcode`)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-dark"
            >
              <QrCode size={16} /> View QR Code
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">Personal</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Users size={18} className="text-accent" />
                  {student.gender || 'N/A'}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <CalendarDays size={18} className="text-accent" />
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MapPin size={18} className="text-accent" />
                  {student.stream || 'No stream assigned'}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">Parent / Guardian</p>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                {student.parents?.length > 0 ? (
                  student.parents.map((parent) => (
                    <div key={parent._id} className="space-y-1">
                      <p className="font-semibold text-primary">{parent.name}</p>
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        {parent.email && (
                          <span className="flex items-center gap-2"><Mail size={14} /> {parent.email}</span>
                        )}
                        {parent.phone && (
                          <span className="flex items-center gap-2"><Phone size={14} /> {parent.phone}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No parent records available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 p-4 bg-gray-50">
            <h2 className="text-sm uppercase tracking-[0.2em] text-gray-500">Notes</h2>
            <p className="mt-3 text-sm text-gray-600">
              {student.medicalInfo?.emergencyNotes || 'No additional notes available.'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
