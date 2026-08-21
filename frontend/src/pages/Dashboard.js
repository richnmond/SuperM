import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
});

const compactNumber = new Intl.NumberFormat('en-NG');

const Dashboard = () => {
  const { user, updateBusinessName } = useAuth();
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessNameInput, setBusinessNameInput] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    setBusinessNameInput(user?.businessName || '');
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, salesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/sales/summary`),
        axios.get(`${API_BASE_URL}/api/sales`),
      ]);

      setSummary(summaryRes.data);
      setRecentSales(salesRes.data.slice(0, 10));
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessNameSave = async (e) => {
    e.preventDefault();
    const trimmedName = businessNameInput.trim();

    if (!trimmedName) {
      toast.error('Please enter a business name');
      return;
    }

    const success = await updateBusinessName(trimmedName);
    if (success) {
      toast.success('Business name updated');
    }
  };

  const chartData = useMemo(
    () =>
      recentSales
        .slice()
        .reverse()
        .map((sale) => ({
          date: new Date(sale.createdAt).toLocaleDateString('en-NG', {
            month: 'short',
            day: 'numeric',
          }),
          amount: Number(sale.totalAmount || 0),
        })),
    [recentSales]
  );

  const averageSale =
    summary.totalSales > 0 ? summary.totalRevenue / summary.totalSales : 0;

  const stats = [
    {
      name: 'Total Revenue',
      value: currencyFormatter.format(summary.totalRevenue || 0),
      detail: `${currencyFormatter.format(averageSale)} average sale`,
      icon: BanknotesIcon,
      accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
    {
      name: 'Sales Completed',
      value: compactNumber.format(summary.totalSales || 0),
      detail: `${recentSales.length} shown in recent activity`,
      icon: ShoppingBagIcon,
      accent: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    },
    {
      name: 'Products Managed',
      value: compactNumber.format(summary.totalProducts || 0),
      detail: 'Active catalog coverage',
      icon: CubeIcon,
      accent: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    },
    {
      name: 'Low Stock',
      value: compactNumber.format(summary.lowStockProducts || 0),
      detail: summary.lowStockProducts > 0 ? 'Needs restocking review' : 'Inventory looks healthy',
      icon: ExclamationTriangleIcon,
      accent:
        summary.lowStockProducts > 0
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1fr_420px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                Live dashboard
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString('en-NG', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">
              {user?.businessName || 'SuperM Store'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Monitor sales, revenue, product coverage, and restocking signals from one focused retail command center.
            </p>

            <div className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                ['Revenue', currencyFormatter.format(summary.totalRevenue || 0)],
                ['Transactions', compactNumber.format(summary.totalSales || 0)],
                ['Catalog items', compactNumber.format(summary.totalProducts || 0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleBusinessNameSave} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <PencilSquareIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">Business profile</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Used on receipts and reports</p>
              </div>
            </div>
            <label htmlFor="businessName" className="mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Business name
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row xl:flex-col">
              <input
                id="businessName"
                type="text"
                value={businessNameInput}
                onChange={(e) => setBusinessNameInput(e.target.value)}
                placeholder="Enter your business name"
                className="min-h-[42px] flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex min-h-[42px] items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.name}</p>
                <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{stat.value}</p>
              </div>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${stat.accent}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
              {stat.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase text-emerald-700 dark:text-emerald-300">Sales trend</p>
              <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Recent revenue movement</h2>
            </div>
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [currencyFormatter.format(value), 'Revenue']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#047857"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-950">
                <ArrowTrendingUpIcon className="h-10 w-10 text-slate-400" />
                <p className="mt-3 font-bold text-slate-950 dark:text-white">No sales data yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sales will appear here after checkout activity.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
            <div>
              <p className="text-sm font-semibold uppercase text-emerald-700 dark:text-emerald-300">Activity</p>
              <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Recent sales</h2>
            </div>
            <span className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {recentSales.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Items</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <tr key={sale._id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {new Date(sale.createdAt).toLocaleString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {sale.items?.length || 0} items
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-bold text-slate-950 dark:text-white">
                        {currencyFormatter.format(sale.totalAmount || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      No recent sales found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
