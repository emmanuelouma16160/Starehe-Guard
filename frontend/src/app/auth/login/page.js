'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isInitialized && user) {
      // Redirect based on role
      const role = user.role;
      if (role === 'guard') {
        router.push('/guard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isInitialized, user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);
        const role = result.user.role;
        if (role === 'guard') {
          router.push('/guard');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <Shield size={32} className="text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-primary">StaSentry Pro</h1>
          </div>
          <p className="text-gray-500 text-sm">School Security Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                  placeholder="you@school.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-accent hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Shield size={12} />
              Secure
            </span>
            <span className="w-px h-3 bg-gray-300" />
            <span>SSL Encrypted</span>
            <span className="w-px h-3 bg-gray-300" />
            <span>v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}