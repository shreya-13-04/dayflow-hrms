import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Signup() {
  const navigate = useNavigate();

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
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight font-serif">Create Dayflow Workspace</h2>
        <p className="mt-1 text-xs text-stone-500">Setup your organization's People Operations platform</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-stone-200/90 py-6 px-6 shadow-subtle rounded-lg sm:px-8">
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-plum-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Organization Name</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Acme Technologies"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-plum-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  placeholder="alex@acme.com"
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
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-plum-800"
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-2.5 mt-2">
              <span>Create Workspace</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="text-plum-900 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
