import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaArrowRight,
  FaChartLine,
  FaCheckCircle,
  FaEnvelope,
  FaLock,
  FaShoppingCart,
  FaStore,
  FaUser,
} from 'react-icons/fa';

const highlights = [
  'Inventory, sales, customers, and expenses in one secure workspace.',
  'Built for fast daily operations at the counter and back office.',
  'Clear reporting so owners can act on stock and profit movement.',
];

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
        <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-14">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(37,99,235,0.34),_transparent_42%),radial-gradient(circle_at_82%_18%,_rgba(16,185,129,0.22),_transparent_30%),radial-gradient(circle_at_18%_80%,_rgba(245,158,11,0.18),_transparent_28%)]" />
          <div className="relative z-10 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-xl text-blue-800 shadow-sm">
              <FaShoppingCart />
            </span>
            <div>
              <p className="text-xl font-black leading-5">SuperM</p>
              <p className="text-sm text-blue-100/80">Retail control</p>
            </div>
          </div>

          <div className="relative z-10 max-w-xl py-16">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-blue-100 shadow-sm backdrop-blur">
              <FaStore />
              Professional store management
            </div>
            <h1 className="mt-6 text-5xl font-black leading-tight xl:text-6xl">
              Run the store with calmer, clearer numbers.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
              Sign in to manage products, checkout, suppliers, customers, expenses, and profit from a focused business dashboard.
            </p>

            <div className="mt-9 grid max-w-lg grid-cols-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20 backdrop-blur">
              <div className="border-r border-white/10 p-5">
                <p className="text-3xl font-black">24/7</p>
                <p className="mt-1 text-sm text-slate-300">Access</p>
              </div>
              <div className="border-r border-white/10 p-5">
                <p className="text-3xl font-black">Fast</p>
                <p className="mt-1 text-sm text-slate-300">Checkout</p>
              </div>
              <div className="p-5">
                <p className="text-3xl font-black">Live</p>
                <p className="mt-1 text-sm text-slate-300">Reports</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 rounded-lg border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-300">Operations snapshot</p>
                <p className="mt-1 text-2xl font-black">Today is ready</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400 text-slate-950">
                <FaChartLine />
              </span>
            </div>
            <div className="space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                  <FaCheckCircle className="mt-1 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
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
                <p className="text-sm font-bold uppercase text-blue-700">
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
                        className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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
                      className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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
                      className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-400"
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
                    className="font-bold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    {isSignup ? 'Sign in' : 'Create an account'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
