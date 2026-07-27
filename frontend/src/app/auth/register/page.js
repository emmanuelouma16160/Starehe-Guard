// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Shield, Mail, Lock, User, Phone, ChevronRight } from 'lucide-react';
// import useAuthStore from '@/store/useAuthStore';
// import toast from 'react-hot-toast';

// const ROLES = [
//   { value: 'parent', label: 'Parent/Guardian', description: 'Track your child\'s school activity' },
//   { value: 'teacher', label: 'Teacher', description: 'Monitor student attendance' },
//   { value: 'guard', label: 'Security Guard', description: 'Manage gate operations' },
//   { value: 'admin', label: 'Administrator', description: 'Full system management' },
// ];

// export default function RegisterPage() {
//   const router = useRouter();
//   const { register } = useAuthStore();
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//     name: '',
//     phone: '',
//     role: '',
//     assignedGate: 'Main Gate',
//     assignedClass: '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate passwords match
//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     // Validate role
//     if (!formData.role) {
//       toast.error('Please select a role');
//       return;
//     }

//     setLoading(true);
//     try {
//       const result = await register({
//         email: formData.email,
//         password: formData.password,
//         name: formData.name,
//         phone: formData.phone,
//         role: formData.role,
//         assignedGate: formData.assignedGate,
//         assignedClass: formData.assignedClass,
//       });

//       if (result.success) {
//         toast.success('Registration successful! Please login.');
//         router.push('/auth/login');
//       } else {
//         toast.error(result.error || 'Registration failed');
//       }
//     } catch (error) {
//       toast.error('Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStep = () => {
//     switch(step) {
//       case 1:
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Choose Your Role *
//               </label>
//               <div className="grid gap-3">
//                 {ROLES.map((role) => (
//                   <button
//                     key={role.value}
//                     type="button"
//                     onClick={() => {
//                       setFormData(prev => ({ ...prev, role: role.value }));
//                       setStep(2);
//                     }}
//                     className={`p-4 rounded-xl border-2 text-left transition-all ${
//                       formData.role === role.value
//                         ? 'border-accent bg-accent/5'
//                         : 'border-gray-200 hover:border-accent/50'
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-semibold text-primary">{role.label}</p>
//                         <p className="text-sm text-gray-500">{role.description}</p>
//                       </div>
//                       <ChevronRight size={20} className="text-gray-400" />
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-4">
//             <button
//               type="button"
//               onClick={() => setStep(1)}
//               className="text-sm text-accent hover:text-accent-dark"
//             >
//               ← Back to role selection
//             </button>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Full Name *
//               </label>
//               <div className="relative">
//                 <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                   className="input pl-10"
//                   placeholder="John Doe"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email Address *
//               </label>
//               <div className="relative">
//                 <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="input pl-10"
//                   placeholder="you@school.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Phone Number *
//               </label>
//               <div className="relative">
//                 <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   required
//                   className="input pl-10"
//                   placeholder="0712345678"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Password *
//               </label>
//               <div className="relative">
//                 <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                   minLength={6}
//                   className="input pl-10"
//                   placeholder="Min 6 characters"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Confirm Password *
//               </label>
//               <div className="relative">
//                 <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   required
//                   className="input pl-10"
//                   placeholder="Confirm password"
//                 />
//               </div>
//             </div>

//             {formData.role === 'guard' && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Assigned Gate
//                 </label>
//                 <select
//                   name="assignedGate"
//                   value={formData.assignedGate}
//                   onChange={handleChange}
//                   className="input"
//                 >
//                   <option value="Main Gate">Main Gate</option>
//                   <option value="Back Gate">Back Gate</option>
//                   <option value="Staff Entrance">Staff Entrance</option>
//                   <option value="Sports Gate">Sports Gate</option>
//                 </select>
//               </div>
//             )}

//             {formData.role === 'teacher' && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Assigned Class
//                 </label>
//                 <select
//                   name="assignedClass"
//                   value={formData.assignedClass}
//                   onChange={handleChange}
//                   className="input"
//                 >
//                   <option value="Form 1">Form 1</option>
//                   <option value="Form 2">Form 2</option>
//                   <option value="Form 3">Form 3</option>
//                   <option value="Form 4">Form 4</option>
//                 </select>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="btn-primary w-full disabled:opacity-50"
//             >
//               {loading ? 'Creating Account...' : 'Create Account'}
//             </button>

//             <p className="text-center text-sm text-gray-500">
//               Already have an account?{' '}
//               <Link href="/auth/login" className="text-accent hover:underline">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <div className="p-3 bg-accent/10 rounded-2xl">
//               <Shield size={32} className="text-accent" />
//             </div>
//           </div>
//           <h1 className="text-2xl font-bold text-primary">Create Account</h1>
//           <p className="text-gray-500 text-sm mt-1">
//             Join the school security system
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-xl p-6">
//           <form onSubmit={handleSubmit}>
//             {renderStep()}
//           </form>
//         </div>

//         <div className="mt-6 text-center">
//           <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
//             <span className="inline-flex items-center gap-1">
//               <Shield size={12} />
//               Secure
//             </span>
//             <span className="w-px h-3 bg-gray-300" />
//             <span>End-to-end encrypted</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, User, Phone, ChevronRight } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'parent', label: 'Parent/Guardian', description: 'Track your child\'s school activity' },
  { value: 'teacher', label: 'Teacher', description: 'Monitor student attendance' },
  { value: 'guard', label: 'Security Guard', description: 'Manage gate operations' },
  { value: 'admin', label: 'Administrator', description: 'Full system management' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: '',
    assignedGate: 'Main Gate',
    assignedClass: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        assignedGate: formData.assignedGate,
        assignedClass: formData.assignedClass,
      });

      if (result.success) {
        toast.success('Registration successful! Please login.');
        router.push('/auth/login');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
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
          </div>
          <h1 className="text-2xl font-bold text-primary">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the school security system</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Choose Your Role *
                  </label>
                  <div className="grid gap-3">
                    {ROLES.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, role: role.value }));
                          setStep(2);
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.role === role.value
                            ? 'border-accent bg-accent/5'
                            : 'border-gray-200 hover:border-accent/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-primary">{role.label}</p>
                            <p className="text-sm text-gray-500">{role.description}</p>
                          </div>
                          <ChevronRight size={20} className="text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-accent hover:text-accent-dark"
                >
                  ← Back to role selection
                </button>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input pl-10"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
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
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="input pl-10"
                      placeholder="0712345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="input pl-10 pr-10"
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="input pl-10 pr-10"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {formData.role === 'guard' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Gate
                    </label>
                    <select
                      name="assignedGate"
                      value={formData.assignedGate}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="Main Gate">Main Gate</option>
                      <option value="Back Gate">Back Gate</option>
                      <option value="Staff Entrance">Staff Entrance</option>
                      <option value="Sports Gate">Sports Gate</option>
                    </select>
                  </div>
                )}

                {formData.role === 'teacher' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Class
                    </label>
                    <select
                      name="assignedClass"
                      value={formData.assignedClass}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="Form 1">Form 1</option>
                      <option value="Form 2">Form 2</option>
                      <option value="Form 3">Form 3</option>
                      <option value="Form 4">Form 4</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-accent hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}