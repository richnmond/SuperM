import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBoxes,
  FaChartLine,
  FaCheckCircle,
  FaShieldAlt,
  FaStore,
  FaTabletAlt,
  FaUsers,
} from 'react-icons/fa';

const features = [
  {
    title: 'Smart inventory control',
    description: 'Track stock levels, supplier activity, and product movement from one polished dashboard.',
    icon: FaBoxes,
  },
  {
    title: 'Fast checkout experience',
    description: 'Speed up sales with a friendly POS flow built for busy retail environments.',
    icon: FaTabletAlt,
  },
  {
    title: 'Clear business insights',
    description: 'Follow revenue, expenses, and profit trends with clean reports that stay easy to read.',
    icon: FaChartLine,
  },
];

const highlights = [
  'Instant access to live sales and expense summaries',
  'Secure authentication for your team and business operations',
  'Modern interface that feels great on desktop and tablet',
];

const stats = [
  { label: 'Products tracked', value: '500+' },
  { label: 'Sales insights', value: '24/7' },
  { label: 'Setup speed', value: 'Minutes' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-black backdrop-blur">
            SM
          </div>
          <div>
            <p className="text-lg font-semibold">SuperM</p>
            <p className="text-sm text-slate-300">Retail management made elegant</p>
          </div>
        </div>

        <Link
          to="/login"
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          Open app
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid items-center gap-10 rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-blue-950/40 backdrop-blur xl:grid-cols-[1.1fr_0.9fr] xl:p-12">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-200">
              <FaShieldAlt />
              Built for modern supermarkets
            </div>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Run your business with clarity, speed, and confidence.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              SuperM combines inventory, sales, suppliers, expenses, and profits into a refined management experience that helps your team stay ahead.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                Get started <FaArrowRight />
              </Link>
              <a
                href="#features"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/20"
              >
                Explore features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-3">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-sm text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Today overview</p>
                <h2 className="mt-1 text-2xl font-bold text-white">Store performance</h2>
              </div>
              <div className="rounded-full bg-emerald-500/15 p-3 text-emerald-400">
                <FaChartLine />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
                    <FaStore />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Inventory ready</p>
                    <p className="text-sm text-slate-400">Products, suppliers, and stock updates stay organized.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
                    <FaUsers />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Team friendly</p>
                    <p className="text-sm text-slate-400">Simple workflows help your staff move faster at checkout.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                  <Icon />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-16 rounded-[2rem] border border-white/10 bg-gradient-to-r from-blue-600/20 to-violet-600/20 p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">Why teams love it</p>
              <h2 className="mt-3 text-3xl font-bold text-white">Everything your supermarket needs, presented beautifully.</h2>
            </div>

            <div className="space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                  <FaCheckCircle className="mt-1 text-emerald-400" />
                  <p className="text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
