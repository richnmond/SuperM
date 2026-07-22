import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const metricCard = (title, value, Icon, accent, helper) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{value}</p>
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
    <div className={`p-3 rounded-full ${accent}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
  </div>
);

const formatMoney = (val) => `₦${Number(val || 0).toFixed(2)}`;

const Profit = () => {
  const [summary, setSummary] = useState({
    revenue: 0,
    cogs: 0,
    expenses: 0,
    grossProfit: 0,
    netProfit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/profit/summary');
      setSummary(data);
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

  const profitMargin = summary.revenue ? ((summary.netProfit / summary.revenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue vs cost of goods vs expenses.</p>
        </div>
        <button
          onClick={loadSummary}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCard('Revenue', formatMoney(summary.revenue), BanknotesIcon, 'bg-emerald-500')}
        {metricCard('Cost of Goods', formatMoney(summary.cogs), ChartBarIcon, 'bg-amber-500')}
        {metricCard('Expenses', formatMoney(summary.expenses), ArrowTrendingDownIcon, 'bg-red-500')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Gross Profit</p>
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">{formatMoney(summary.grossProfit)}</p>
          <p className="text-xs text-gray-500 mt-1">Revenue minus cost of goods</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Profit</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">{formatMoney(summary.netProfit)}</p>
              <p className="text-xs text-gray-500 mt-1">After operating expenses</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowTrendingUpIcon className="h-5 w-5 text-primary-600" />
              <span className="text-gray-700 dark:text-gray-200">{profitMargin}% margin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profit;
