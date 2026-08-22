import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ADMIN');

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    if (!companyName || !firstName || !lastName || !email || !password) {
      setApiError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setApiError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setApiError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await signup({
        companyName,
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
        role,
      });

      setSuccessMsg(res.message || `Account created successfully! Employee ID: ${res.user?.employeeId}`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setApiError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans text-stone-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-[#581c38] text-white shadow-xs font-serif text-xl font-bold mb-3">
          D
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight font-serif">Create Dayflow Workspace</h2>
        <p className="mt-1 text-xs text-stone-600 font-medium">Setup your organization's People Operations platform</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-stone-200/90 py-6 px-6 shadow-subtle rounded-lg sm:px-8">
          {apiError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100/90 rounded mb-4 border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`py-1.5 px-3 rounded transition-all cursor-pointer ${
                role === 'ADMIN' ? 'bg-[#581c38] text-white shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900 bg-transparent'
              }`}
            >
              Admin / HR
            </button>
            <button
              type="button"
              onClick={() => setRole('EMPLOYEE')}
              className={`py-1.5 px-3 rounded transition-all cursor-pointer ${
                role === 'EMPLOYEE' ? 'bg-[#581c38] text-white shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900 bg-transparent'
              }`}
            >
              Employee
            </button>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">Company / Organization Name *</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Technologies"
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38] focus:ring-1 focus:ring-[#581c38]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">First Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38] focus:ring-1 focus:ring-[#581c38]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38] focus:ring-1 focus:ring-[#581c38]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">Work Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@acme.com"
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38] focus:ring-1 focus:ring-[#581c38]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38] focus:ring-1 focus:ring-[#581c38]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38] focus:ring-1 focus:ring-[#581c38]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38] focus:ring-1 focus:ring-[#581c38]"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" disabled={loading}>
              {loading ? (
                <span>Generating Workspace...</span>
              ) : (
                <>
                  <span className="text-white font-semibold">Create Account & Assign Employee ID</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 text-white" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-stone-600 font-medium">
              Already registered?{' '}
              <Link to="/login" className="text-[#581c38] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
