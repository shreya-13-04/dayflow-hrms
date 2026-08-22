import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('hr');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-stone-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-plum-900 text-white shadow-xs font-serif text-xl font-bold mb-3">
          D
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight font-serif">Dayflow HRMS</h2>
        <p className="mt-1 text-xs text-stone-500">Sign in to your People Operations workspace</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-stone-200/90 py-6 px-6 shadow-subtle rounded-lg sm:px-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded mb-5 border border-stone-200/80">
            <button
              type="button"
              onClick={() => setRole('hr')}
              className={`py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                role === 'hr' ? 'bg-plum-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Admin / HR
            </button>
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                role === 'employee' ? 'bg-plum-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Employee
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.morgan@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-plum-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-plum-800"
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-2.5 mt-2">
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-stone-500">
              Need a new workspace?{' '}
              <Link to="/signup" className="text-plum-900 font-semibold hover:underline">
                Create Organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
