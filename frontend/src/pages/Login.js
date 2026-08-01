import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, register, user } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignup) {
      const success = await register(username.trim(), email.trim(), password);
      if (success) {
        setIsSignup(false);
        setPassword('');
      }
    } else {
      await login(email.trim(), password);
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex items-center justify-center bg-slate-900 p-8 text-white lg:p-12">
          <div className="max-w-md">
            <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
              SuperM Management
            </div>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Manage your Business with confidence.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Track products, handle sales, monitor profits, and keep suppliers and expenses organized from a single elegant dashboard.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary-300">•</span>
                <span>Fast retail workflows for busy store teams.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary-300">•</span>
                <span>Real-time visibility into stock and business performance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary-300">•</span>
                <span>Secure sign-in and a modern interface built for everyday use.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-8 sm:p-10 lg:p-12">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignup ? 'Create Account' : 'Login'}
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              {isSignup ? 'Sign up to start using the system.' : 'Sign in to continue.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={isSignup}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="w-full mt-4 text-sm text-primary-700 hover:text-primary-800"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account click to continue? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
