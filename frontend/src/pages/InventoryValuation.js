import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';

const PAGE_SIZE = 10;
const categories = ['Groceries', 'Beverages', 'Snacks', 'Dairy', 'Meat', 'Produce', 'Household', 'Other'];

const InventoryValuation = () => {
  const [products, setProducts] = useState([]);
  const [totals, setTotals] = useState({ totalCostValue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const requestRef = useRef(null);

  const fetchValuation = async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/valuation`, { signal: controller.signal });
      setProducts(Array.isArray(response.data?.products) ? response.data.products : []);
      setTotals(response.data?.totals || { totalCostValue: 0 });
    } catch (fetchError) {
      if (axios.isCancel(fetchError) || fetchError.name === 'CanceledError') return;
      const message = fetchError.response?.data?.message || 'Failed to load inventory valuation.';
      setError(message);
      toast.error(message);
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchValuation();
    return () => requestRef.current?.abort();
  }, []);

  const formatMoney = (value) => `₦${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const summary = useMemo(() => {
    const totalUnits = products.reduce((sum, product) => sum + Math.max(0, Number(product.availableStock || 0)), 0);
    return {
      totalInventoryValue: Number(totals.totalCostValue || 0),
      totalProducts: products.length,
      totalUnits,
      lowStock: products.filter((product) => product.stockStatus === 'Low Stock').length,
      outOfStock: products.filter((product) => Number(product.availableStock || 0) === 0).length
    };
  }, [products, totals]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch = !term || [product.name, product.barcode, product.category].some((value) => String(value || '').toLowerCase().includes(term));
      const matchesCategory = !category || product.category === category;
      const matchesStatus = !stockStatus || product.stockStatus === stockStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      let aValue;
      let bValue;
      if (sortBy === 'quantity') {
        aValue = Number(a.availableStock || 0);
        bValue = Number(b.availableStock || 0);
      } else if (sortBy === 'unitCost') {
        aValue = Number(a.costPrice || 0);
        bValue = Number(b.costPrice || 0);
      } else if (sortBy === 'stockValue') {
        aValue = Number(a.totalCostValue || 0);
        bValue = Number(b.totalCostValue || 0);
      } else {
        aValue = String(a.name || '').toLowerCase();
        bValue = String(b.name || '').toLowerCase();
      }
      const comparison = typeof aValue === 'string' ? aValue.localeCompare(bValue) : aValue - bValue;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [products, search, category, stockStatus, sortBy, sortDirection]);

  useEffect(() => setPage(1), [search, category, stockStatus, sortBy, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortIndicator = (field) => sortBy === field ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : '';
  const metricCards = [
    { label: 'Total Inventory Value', value: formatMoney(summary.totalInventoryValue), icon: CubeIcon, color: 'bg-primary-700' },
    { label: 'Total Products', value: summary.totalProducts.toLocaleString(), icon: ArchiveBoxIcon, color: 'bg-slate-700' },
    { label: 'Total Units in Stock', value: summary.totalUnits.toLocaleString(), icon: CubeIcon, color: 'bg-blue-700' },
    { label: 'Low-Stock Products', value: summary.lowStock.toLocaleString(), icon: ExclamationTriangleIcon, color: 'bg-amber-600' },
    { label: 'Out-of-Stock Products', value: summary.outOfStock.toLocaleString(), icon: ExclamationTriangleIcon, color: 'bg-red-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-medium text-primary-700">Inventory</p><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Valuation</h1></div>
        <button type="button" onClick={fetchValuation} disabled={loading} className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60">
          <ArrowPathIcon className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metricCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 dark:border-slate-800 dark:bg-slate-900">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white ${color}`}><Icon className="h-5 w-5" /></div>
            <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 border-b border-gray-200 p-4 md:grid-cols-[minmax(220px,1fr)_180px_180px] dark:border-slate-800">
          <div className="relative"><MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, SKU, or barcode" className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={stockStatus} onChange={(event) => setStockStatus(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">All stock statuses</option><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option></select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-950/60"><tr>
              <th className="px-4 py-3 text-left"><button type="button" onClick={() => toggleSort('name')}>Product{sortIndicator('name')}</button></th>
              <th className="px-4 py-3 text-left">SKU / Barcode</th><th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right"><button type="button" onClick={() => toggleSort('quantity')}>Quantity{sortIndicator('quantity')}</button></th>
              <th className="px-4 py-3 text-right"><button type="button" onClick={() => toggleSort('unitCost')}>Unit Cost{sortIndicator('unitCost')}</button></th>
              <th className="px-4 py-3 text-right"><button type="button" onClick={() => toggleSort('stockValue')}>Stock Value{sortIndicator('stockValue')}</button></th>
              <th className="px-4 py-3 text-left">Stock Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {loading ? <tr><td colSpan="7" className="px-6 py-12 text-center"><div className="flex flex-col items-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div><p className="mt-3 text-gray-500">Loading inventory valuation...</p></div></td></tr>
              : error ? <tr><td colSpan="7" className="px-6 py-12 text-center"><p className="font-medium text-red-700">Unable to load inventory valuation</p><p className="mt-1 text-gray-500">{error}</p><button type="button" onClick={fetchValuation} className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white">Retry</button></td></tr>
              : filteredProducts.length === 0 ? <tr><td colSpan="7" className="px-6 py-12 text-center"><p className="font-medium text-gray-900 dark:text-white">No inventory products match your filters.</p><button type="button" onClick={() => { setSearch(''); setCategory(''); setStockStatus(''); }} className="mt-3 text-sm font-medium text-primary-700 hover:underline">Clear filters</button></td></tr>
              : pagedProducts.map((product) => {
                const quantity = Math.max(0, Number(product.availableStock || 0));
                const status = quantity === 0 ? 'Out of Stock' : quantity <= Number(product.reorderLevel || 0) ? 'Low Stock' : 'In Stock';
                const statusClass = status === 'Out of Stock' ? 'bg-red-100 text-red-700' : status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
                return <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-slate-950/40"><td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{product.name}</td><td className="px-4 py-3 text-gray-500">{product.barcode || '—'}</td><td className="px-4 py-3 text-gray-500">{product.category || '—'}</td><td className="px-4 py-3 text-right">{quantity.toLocaleString()} {product.unit || 'Piece'}</td><td className="px-4 py-3 text-right">{formatMoney(product.costPrice)}</td><td className="px-4 py-3 text-right font-medium">{formatMoney(product.totalCostValue)}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{status}</span></td></tr>;
              })}
            </tbody>
          </table>
        </div>

        {!loading && !error && filteredProducts.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-sm dark:border-slate-800"><p className="text-gray-500">Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length}</p><div className="flex gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">Next</button></div></div>}
      </div>
    </div>
  );
};

export default InventoryValuation;
