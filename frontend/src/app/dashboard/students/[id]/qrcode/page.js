'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function QRCodePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const { data: qrData } = await api.get(`/students/${id}/qrcode`);
        setData(qrData);
      } catch {
        toast.error('Failed to load QR code');
        router.push('/dashboard/students');
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [id, router]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!data?.qrImage) return;
    const link = document.createElement('a');
    link.download = `${data.admissionNumber}-qrcode.png`;
    link.href = data.qrImage;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <TopBar title="Student QR Code" subtitle="Print or download the student badge" />
      <div className="p-6 max-w-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="card text-center" id="qr-badge">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-bold text-2xl">S</span>
          </div>
          <h2 className="font-bold text-primary text-xl">{data?.name}</h2>
          <p className="text-gray-500 text-sm mt-1">{data?.class}</p>
          <p className="text-xs text-gray-400 font-mono mt-1">{data?.admissionNumber}</p>

          {data?.qrImage && (
            <div className="my-6 flex justify-center">
              <img src={data.qrImage} alt="Student QR Code" className="w-48 h-48 rounded-xl" />
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">Scan at school gate for entry/exit</p>
          <p className="text-xs font-mono text-gray-300 mt-1">{data?.qrCodeData}</p>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={handleDownload} className="btn-outline flex-1">
            <Download size={16} /> Download
          </button>
          <button onClick={handlePrint} className="btn-primary flex-1">
            <Printer size={16} /> Print Badge
          </button>
        </div>
      </div>
    </>
  );
}