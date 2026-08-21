import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBoxes,
  FaChartLine,
  FaCheckCircle,
  FaClipboardList,
  FaReceipt,
  FaShieldAlt,
  FaShoppingCart,
  FaStore,
  FaTabletAlt,
} from 'react-icons/fa';

const productImages = [
  '/landing-products/checkout.jpg',
  '/landing-products/stock.jpg',
  '/landing-products/margins.jpg',
];

const features = [
  {
    title: 'Inventory control',
    description: 'Track product quantities, stock warnings, suppliers, and selling prices from one reliable workspace.',
    icon: FaBoxes,
  },
  {
    title: 'Point of sale',
    description: 'Keep checkout moving with fast product lookup, cart totals, customer records, and receipt support.',
    icon: FaTabletAlt,
  },
  {
    title: 'Profit reporting',
    description: 'Understand revenue, expenses, margins, and profit movement with focused retail reports.',
    icon: FaChartLine,
  },
];

const operatingPoints = [
  'Live sales, inventory, and expense summaries',
  'Secure staff access for daily store operations',
  'Responsive screens for desktop counters and tablets',
];

const LandingPage = () => {
  return (
    <div className="landing-page min-h-screen bg-[#f7f4ee] text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm">
            <FaShoppingCart />
          </span>
          <span>
            <span className="block text-lg font-bold leading-5">SuperM</span>
            <span className="block text-sm text-slate-600">Business management</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
          <a href="#platform" className="transition hover:text-emerald-700">Platform</a>
          <a href="#workflow" className="transition hover:text-emerald-700">Workflow</a>
          <a href="#features" className="transition hover:text-emerald-700">Features</a>
        </nav>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          Open app <FaArrowRight className="text-xs" />
        </Link>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-14">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
              <FaShieldAlt />
              Built for busy retail teams
            </div>
            <h1 className="text-4xl font-black leading-[1.03] text-slate-950 sm:text-5xl lg:text-6xl">
              SuperM keeps your store organized from shelf to checkout.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
              Manage products, sales, suppliers, customers, expenses, and profit in a clean system designed for daily business operations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                Start managing <FaArrowRight />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-900 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
              >
                View features
              </a>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="p-4">
                <p className="text-2xl font-black text-slate-950">500+</p>
                <p className="mt-1 text-sm text-slate-600">Products</p>
              </div>
              <div className="p-4">
                <p className="text-2xl font-black text-slate-950">24/7</p>
                <p className="mt-1 text-sm text-slate-600">Insights</p>
              </div>
              <div className="p-4">
                <p className="text-2xl font-black text-slate-950">Fast</p>
                <p className="mt-1 text-sm text-slate-600">Checkout</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
            <div className="absolute inset-x-0 top-0 h-48 bg-emerald-800" />
            <div className="relative grid h-full min-h-[520px] grid-rows-[auto_1fr] p-5 sm:p-6">
              <div className="flex items-center justify-between rounded-md bg-white/95 p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Today at a glance</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">Store performance</h2>
                </div>
                <div className="rounded-md bg-amber-100 p-3 text-amber-700">
                  <FaStore />
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  {productImages.map((src, index) => (
                    <div key={src} className="flex items-center gap-4 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        <img
                          src={src}
                          alt={`Featured product ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {index === 0 ? 'Ready for checkout' : index === 1 ? 'Stock organized' : 'Margins visible'}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {index === 0 ? 'Fast item lookup' : index === 1 ? 'Live quantity tracking' : 'Profit-aware sales'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Revenue</p>
                      <p className="mt-1 text-3xl font-black text-slate-950">₦284,500</p>
                    </div>
                    <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">+12.5%</span>
                  </div>
                  <div className="mt-7 flex h-40 items-end gap-3">
                    {[42, 64, 52, 78, 68, 91, 84].map((height, index) => (
                      <div key={index} className="flex flex-1 items-end rounded-t-md bg-emerald-100">
                        <div
                          className="w-full rounded-t-md bg-emerald-700"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 space-y-3">
                    {operatingPoints.map((point) => (
                      <div key={point} className="flex items-start gap-3 text-sm text-slate-700">
                        <FaCheckCircle className="mt-1 shrink-0 text-emerald-700" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-0 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              ['Products', 'Keep every item, price, and stock level current.'],
              ['Sales', 'Capture purchases and review transaction history.'],
              ['Finance', 'Compare revenue, expenses, and profit clearly.'],
            ].map(([title, body]) => (
              <div key={title} className="border-slate-200 py-8 md:border-r md:px-8 first:md:pl-0 last:border-r-0">
                <p className="text-lg font-bold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-emerald-800">Daily workflow</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">A professional workspace for repeatable store operations.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [FaClipboardList, 'Update inventory', 'Add products, quantities, suppliers, and reorder details.'],
              [FaReceipt, 'Record sales', 'Process customer purchases and keep receipts searchable.'],
              [FaChartLine, 'Review profit', 'Measure performance after expenses and cost of goods.'],
            ].map(([Icon, title, body]) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                  <Icon />
                </div>
                <h3 className="mt-5 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase text-amber-300">Core features</p>
              <h2 className="mt-3 text-3xl font-black">Everything important stays visible.</h2>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-emerald-800">
                      <Icon />
                    </div>
                    <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
