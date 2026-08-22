import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('hr');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!email || !password) {
      setApiError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-stone-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-[#581c38] text-white shadow-xs font-serif text-xl font-bold mb-3">
          D
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight font-serif">Dayflow HRMS</h2>
        <p className="mt-1 text-xs text-stone-600 font-medium">Sign in to your People Operations workspace</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-stone-200/90 py-6 px-6 shadow-subtle rounded-lg sm:px-8">
          {/* API Error Alert */}
          {apiError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Role selector info toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100/90 rounded mb-5 border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRole('hr')}
              className={`py-1.5 px-3 rounded transition-all cursor-pointer ${
                role === 'hr' ? 'bg-[#581c38] text-white shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900 bg-transparent'
              }`}
            >
              Admin / HR
            </button>
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`py-1.5 px-3 rounded transition-all cursor-pointer ${
                role === 'employee' ? 'bg-[#581c38] text-white shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900 bg-transparent'
              }`}
            >
              Employee
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.morgan@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38] focus:ring-1 focus:ring-[#581c38]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38] focus:ring-1 focus:ring-[#581c38]"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 mt-2">
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span className="text-white font-semibold">Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 text-white" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-stone-600 font-medium">
              Need a new workspace?{' '}
              <Link to="/signup" className="text-[#581c38] font-bold hover:underline">
                Create Organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
