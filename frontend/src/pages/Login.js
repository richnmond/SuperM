import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaArrowRight,
  FaEnvelope,
  FaLock,
  FaShoppingCart,
  FaUser,
} from 'react-icons/fa';

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

  const toggleMode = () => {
    setIsSignup((current) => !current);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden min-h-screen overflow-hidden bg-emerald-950 lg:block">
          <img
            src={`${process.env.PUBLIC_URL}/login-business.png`}
            alt="SuperM business management app in a supermarket"
            className="absolute inset-0 h-full w-full object-fill"
          />
        </section>

        <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-700 text-white shadow-sm">
                  <FaShoppingCart />
                </span>
                <span>
                  <span className="block text-lg font-black leading-5">SuperM</span>
                  <span className="block text-sm text-slate-600">Retail control</span>
                </span>
              </Link>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-bold uppercase text-primary-700">
                  {isSignup ? 'Create your workspace' : 'Welcome back'}
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  {isSignup ? 'Start using SuperM' : 'Sign in to SuperM'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {isSignup
                    ? 'Create an account for your store and begin organizing daily operations.'
                    : 'Enter your account details to continue to your retail dashboard.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignup && (
                  <div>
                    <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-700">
                      Username
                    </label>
                    <div className="relative">
                      <FaUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required={isSignup}
                        autoComplete="username"
                        placeholder="Store admin"
                        className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                    Email address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={isSignup ? 'new-password' : 'current-password'}
                      placeholder="At least 6 characters"
                      className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {submitting ? 'Please wait...' : (isSignup ? 'Create account' : 'Sign in')}
                  {!submitting && <FaArrowRight className="text-xs" />}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-200 pt-6 text-center">
                <p className="text-sm text-slate-600">
                  {isSignup ? 'Already have an account?' : 'New to SuperM?'}{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="font-bold text-primary-700 transition hover:text-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-100"
                  >
                    {isSignup ? 'Sign in' : 'Create an account'}
                  </button>
                </p>
                <Link to="/owner" className="mt-4 inline-block text-xs font-semibold text-slate-500 transition hover:text-primary-800">
                  Platform owner sign in
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
