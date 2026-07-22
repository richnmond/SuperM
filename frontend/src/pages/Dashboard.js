import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, updateBusinessName } = useAuth();
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0
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
    try {
      const [summaryRes, salesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/sales/summary'),
        axios.get('http://localhost:5000/api/sales')
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

  const stats = [
    {
      name: 'Total Revenue',
      value: `₦${summary.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      name: 'Total Sales',
      value: summary.totalSales,
      icon: ShoppingBagIcon,
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      name: 'Total Products',
      value: summary.totalProducts,
      icon: CubeIcon,
      change:'+3',
      changeType: 'positive'
    },
    {
      name: 'Low Stock Alert',
      value: summary.lowStockProducts,
      icon: ExclamationTriangleIcon,
      change: summary.lowStockProducts > 0 ? 'Action needed' : 'All good',
      changeType: summary.lowStockProducts > 0 ? 'negative' : 'positive'
    }
  ];

  const salesChartData = recentSales.map(sale => ({
    date: new Date(sale.createdAt).toLocaleDateString(),
    amount: sale.totalAmount
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            {user?.businessName ? `Welcome to ${user.businessName}` : 'Add your business name to personalize receipts and reports.'}
          </p>
        </div>
        <form onSubmit={handleBusinessNameSave} className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business Name
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="businessName"
              type="text"
              value={businessNameInput}
              onChange={(e) => setBusinessNameInput(e.target.value)}
              placeholder="Enter your business name"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
            <button
              type="submit"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-primary-500 rounded-md p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Sales</h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{sale.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
