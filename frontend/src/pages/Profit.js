import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';

const FILTERS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'year', label: 'This Year' },
  { key: 'custom', label: 'Custom Range' }
];

const metricCard = (title, value, Icon, accent, change, helper) => {
  const isPositive = change >= 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-50">{value}</p>
          {helper && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{helper}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {isPositive ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
        <span>{Number(change || 0).toFixed(1)}%</span>
      </div>
    </div>
  );
};

const formatMoney = (val) => `₦${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatPercent = (val) => `${Number(val || 0).toFixed(1)}%`;

const buildSummaryChartData = (summary) => [
  { name: 'Revenue', value: summary.revenue.value, color: '#16a34a' },
  { name: 'COGS', value: summary.cogs.value, color: '#f59e0b' },
  { name: 'Net Profit', value: summary.netProfit.value, color: '#0f172a' }
];

const formatChartDate = (isoDate) => {
  const date = new Date(isoDate);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const buildTrendData = (trend) => trend.map((item) => ({
  date: item.date,
  name: formatChartDate(item.date),
  revenue: item.revenue,
  grossProfit: item.grossProfit,
  netProfit: item.netProfit
}));

const groupWeeklyTrend = (trend) => {
  const weeks = {};
  trend.forEach((item) => {
    const date = new Date(item.date);
    const weekStart = new Date(date);
    const day = date.getDay();
    weekStart.setDate(date.getDate() - ((day + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    if (!weeks[label]) {
      weeks[label] = { period: label, revenue: 0, netProfit: 0 };
    }
    weeks[label].revenue += item.revenue;
    weeks[label].netProfit += item.netProfit;
  });
  return Object.values(weeks);
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const startOfWeek = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfWeek = () => {
  const date = startOfWeek();
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
};

const startOfMonth = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  date.setHours(23, 59, 59, 999);
  return date;
};

const startOfLastMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1, 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfLastMonth = () => {
  const date = new Date();
  date.setDate(0);
  date.setHours(23, 59, 59, 999);
  return date;
};

const startOfYear = () => {
  const date = new Date();
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfYear = () => {
  const date = new Date();
  date.setMonth(11, 31);
  date.setHours(23, 59, 59, 999);
  return date;
};

const formatInputDate = (date) => date.toISOString().slice(0, 10);

const getFilterRange = (filterKey) => {
  switch (filterKey) {
    case 'today':
      return { label: 'Today', startDate: startOfToday(), endDate: endOfToday() };
    case 'week':
      return { label: 'This Week', startDate: startOfWeek(), endDate: endOfWeek() };
    case 'month':
      return { label: 'This Month', startDate: startOfMonth(), endDate: endOfMonth() };
    case 'lastMonth':
      return { label: 'Last Month', startDate: startOfLastMonth(), endDate: endOfLastMonth() };
    case 'year':
      return { label: 'This Year', startDate: startOfYear(), endDate: endOfYear() };
    default:
      return { label: 'Custom Range', startDate: startOfMonth(), endDate: endOfMonth() };
  }
};

const Profit = () => {
  const [summary, setSummary] = useState({
    revenue: { value: 0, change: 0 },
    cogs: { value: 0, change: 0 },
    grossProfit: { value: 0, change: 0 },
    expenses: { value: 0, change: 0 },
    netProfit: { value: 0, change: 0 },
    profitMargin: { value: 0, change: 0 }
  });
  const [profitTrend, setProfitTrend] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('month');
  const [filterLabel, setFilterLabel] = useState('This Month');
  const [startDate, setStartDate] = useState(formatInputDate(startOfMonth()));
  const [endDate, setEndDate] = useState(formatInputDate(endOfMonth()));
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const range = getFilterRange(selectedFilter);
    if (selectedFilter !== 'custom') {
      setFilterLabel(range.label);
      setStartDate(formatInputDate(range.startDate));
      setEndDate(formatInputDate(range.endDate));
    }
  }, [selectedFilter]);

  useEffect(() => {
    loadSummary();
  }, [selectedFilter, startDate, endDate]);

  const chartTrendData = useMemo(() => buildTrendData(profitTrend), [profitTrend]);

  const salesProfitSeries = useMemo(() => {
    if (!chartTrendData.length) return [];
    const dailySeries = chartTrendData.map((item) => ({
      date: item.date,
      period: item.name,
      revenue: item.revenue,
      netProfit: item.netProfit
    }));
    if (dailySeries.length <= 28) {
      return dailySeries.map(({ period, revenue, netProfit }) => ({ period, revenue, netProfit }));
    }
    return groupWeeklyTrend(dailySeries);
  }, [chartTrendData]);

  const isWeeklyView = salesProfitSeries.length > 0 && salesProfitSeries.length <= 12 && chartTrendData.length > 28;

  const loadSummary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('startDate', new Date(startDate).toISOString());
      params.append('endDate', new Date(endDate).toISOString());
      const { data } = await axios.get(`${API_BASE_URL}/api/profit/summary?${params.toString()}`);
      setSummary(data);
      setProfitTrend(data.profitTrend || []);
      setExpenseCategories(data.topExpenseCategories || []);
      setLastUpdated(new Date());
    } catch (error) {
      toast.error('Unable to fetch profit summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue vs cost of goods vs expenses.</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <CalendarIcon className="h-4 w-4" />
            Viewing: {filterLabel}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setSelectedFilter(filter.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedFilter === filter.key
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {selectedFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
            </div>
          )}

          <button
            onClick={loadSummary}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {metricCard('Revenue', formatMoney(summary.revenue.value), BanknotesIcon, 'bg-emerald-500', summary.revenue.change, 'Sum of all completed sales')}
        {metricCard('COGS', formatMoney(summary.cogs.value), ChartBarIcon, 'bg-amber-500', summary.cogs.change, 'Cost of goods sold')}
        {metricCard('Gross Profit', formatMoney(summary.grossProfit.value), BanknotesIcon, 'bg-blue-500', summary.grossProfit.change, 'Revenue minus COGS')}
        {metricCard('Operating Expenses', formatMoney(summary.expenses.value), ArrowTrendingDownIcon, 'bg-red-500', summary.expenses.change, 'Approved expenses total')}
        {metricCard('Net Profit', formatMoney(summary.netProfit.value), ChartBarIcon, 'bg-slate-800', summary.netProfit.change, 'Gross profit minus operating expenses')}
        {metricCard('Profit Margin', formatPercent(summary.profitMargin.value), ChartBarIcon, 'bg-violet-500', summary.profitMargin.change, 'Net profit divided by revenue')}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue vs COGS vs Net Profit</p>
              <h2 className="text-xl font-semibold text-gray-900">Period Comparison</h2>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildSummaryChartData(summary)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="value" fill="#2563eb">
                  {buildSummaryChartData(summary).map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Profit Trend</p>
              <h2 className="text-xl font-semibold text-gray-900">Revenue & Profit over Time</h2>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Amount']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="grossProfit" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="netProfit" stroke="#0f172a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expense Category Breakdown</p>
              <h2 className="text-xl font-semibold text-gray-900">Top Categories</h2>
            </div>
          </div>
          <div className="flex h-80 flex-col items-center justify-center gap-4">
            {expenseCategories.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    label={({ category }) => category}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[ '#6366f1', '#34d399', '#fbbf24', '#f97316', '#ef4444' ][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Total']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-500">No expense categories found for this range.</div>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Daily/Weekly Sales & Profit</p>
              <h2 className="text-xl font-semibold text-gray-900">Sales Performance</h2>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesProfitSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Amount']} />
                <Legend />
                <Bar dataKey="revenue" barSize={24} fill="#2563eb" />
                <Line type="monotone" dataKey="netProfit" stroke="#ef4444" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Viewing {isWeeklyView ? 'weekly' : 'daily'} sales and profit for the selected date range.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profit;
