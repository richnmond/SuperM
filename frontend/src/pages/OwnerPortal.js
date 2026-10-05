import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';

const OWNER_TOKEN_KEY = 'superm_owner_token';
const minimumLicenseDays = 30;

const getMinimumExpiryDate = (startDate) => {
  const minimumDate = new Date(startDate);
  minimumDate.setUTCDate(minimumDate.getUTCDate() + minimumLicenseDays);
  return minimumDate.toISOString().slice(0, 10);
};

const OwnerPortal = () => {
  const [token, setToken] = useState(() => localStorage.getItem(OWNER_TOKEN_KEY));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [activity, setActivity] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [licenseStatusFilter, setLicenseStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [licenseBusinessId, setLicenseBusinessId] = useState('');
  const [licensePlan, setLicensePlan] = useState('starter');
  const [licenseStartDate, setLicenseStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [licenseExpiryDate, setLicenseExpiryDate] = useState(() => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const ownerRequest = (method, path, data) => axios({
    method,
    url: `${API_BASE_URL}/api/owner${path}`,
    data,
    headers: { Authorization: `Bearer ${token}` },
  });

  const loadDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [dashboardResponse, activityResponse, licensesResponse] = await Promise.all([
        ownerRequest('get', '/dashboard'),
        ownerRequest('get', '/activity'),
        ownerRequest('get', '/licenses'),
      ]);
      setStats(dashboardResponse.data.stats);
      setActivity(activityResponse.data);
      setLicenses(licensesResponse.data);
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem(OWNER_TOKEN_KEY);
        setToken(null);
        toast.error('Owner session expired. Please sign in again.');
      } else {
        toast.error(error.response?.data?.message || 'Could not load owner dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (licenseFilter !== 'all') params.set('license', licenseFilter);
      const [filtered, all] = await Promise.all([
        ownerRequest('get', `/businesses?${params.toString()}`, null),
        ownerRequest('get', '/businesses', null),
      ]);
      setBusinesses(filtered.data);
      setAllBusinesses(all.data);
      if (selected) {
        const updatedSelection = filtered.data.find((business) => business._id === selected._id);
        setSelected(updatedSelection || null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load businesses');
    }
  };

  useEffect(() => {
    if (token) loadDashboard();
  }, [token]);

  useEffect(() => {
    if (token) loadBusinesses();
  }, [token, search, statusFilter, licenseFilter]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/owner/login`, { email: email.trim(), password });
      localStorage.setItem(OWNER_TOKEN_KEY, response.data.token);
      setToken(response.data.token);
      setPassword('');
      toast.success('Owner access granted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Owner sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const refresh = async () => {
    await Promise.all([loadDashboard(), loadBusinesses()]);
  };

  const changeBusinessStatus = async (business) => {
    const status = business.status === 'active' ? 'suspended' : 'active';
    try {
      await ownerRequest('patch', `/businesses/${business._id}/status`, { status });
      toast.success(`${business.name} ${status === 'active' ? 'reactivated' : 'suspended'}`);
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update business');
    }
  };

  const changeUserStatus = async (user) => {
    try {
      await ownerRequest('patch', `/users/${user._id}/status`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'suspended' : 'reactivated'}`);
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update user');
    }
  };

  const addBranch = async (event) => {
    event.preventDefault();
    if (!selected || !branchName.trim()) return;
    try {
      await ownerRequest('post', `/businesses/${selected._id}/branches`, { name: branchName.trim(), location: branchLocation.trim() });
      setBranchName('');
      setBranchLocation('');
      toast.success('Branch added');
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add branch');
    }
  };

  const createLicense = async (event) => {
    event.preventDefault();
    try {
      await ownerRequest('post', '/licenses', {
        businessId: licenseBusinessId,
        plan: licensePlan,
        startDate: licenseStartDate,
        expiryDate: licenseExpiryDate,
      });
      setLicenseBusinessId('');
      toast.success('License created');
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create license');
    }
  };

  const setLicenseStatus = async (license) => {
    const status = license.status === 'suspended' ? 'active' : 'suspended';
    try {
      await ownerRequest('patch', `/licenses/${license._id}/status`, { status });
      toast.success(`License ${status}`);
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update license');
    }
  };

  const extendLicense = async (event, license) => {
    event.preventDefault();
    const days = Number(new FormData(event.currentTarget).get('days'));
    try {
      await ownerRequest('post', `/licenses/${license._id}/extend`, { days });
      toast.success(`License extended by ${days} days`);
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not extend license');
    }
  };

  const setLicenseExpiry = async (event, license) => {
    event.preventDefault();
    const expiryDate = new FormData(event.currentTarget).get('expiryDate');
    try {
      await ownerRequest('patch', `/licenses/${license._id}/expiry`, { expiryDate });
      toast.success('License expiry date updated');
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update expiry date');
    }
  };

  const changeLicensePlan = async (license, plan) => {
    try {
      await ownerRequest('patch', `/licenses/${license._id}/plan`, { plan });
      toast.success('License plan updated');
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update plan');
    }
  };

  const copyLicenseKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success('License key copied');
    } catch (error) {
      toast.error('Clipboard access is unavailable');
    }
  };

  const removeBranch = async (branch) => {
    if (!selected) return;
    try {
      await ownerRequest('delete', `/businesses/${selected._id}/branches/${branch._id}`);
      toast.success('Branch removed');
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove branch');
    }
  };

  const logout = () => {
    localStorage.removeItem(OWNER_TOKEN_KEY);
    setToken(null);
    setStats(null);
    setBusinesses([]);
    setAllBusinesses([]);
    setActivity([]);
    setLicenses([]);
    setSelected(null);
  };

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e8eee9] px-4 py-10 text-slate-950">
        <div className="grid w-full max-w-5xl overflow-hidden border border-slate-200 bg-white shadow-xl md:grid-cols-[1.05fr_0.95fr]">
          <section className="flex min-h-[420px] flex-col justify-between bg-[#173d32] p-8 text-white sm:p-12">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center bg-[#d0e7a8] text-[#173d32]"><ShieldCheckIcon className="h-6 w-6" /></span>
              <div><p className="font-black">SuperM</p><p className="text-xs text-emerald-100">Platform control</p></div>
            </div>
            <div className="max-w-md py-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d0e7a8]">Owner workspace</p>
              <h1 className="mt-4 text-4xl font-black leading-tight">Platform oversight, in one place.</h1>
              <p className="mt-4 text-sm leading-6 text-emerald-50/80">Review business accounts, licenses, users, branches, and system activity.</p>
            </div>
            <p className="text-xs text-emerald-100/70">Restricted access · Owner credentials only</p>
          </section>
          <section className="flex items-center px-6 py-10 sm:px-12">
            <form onSubmit={handleLogin} className="w-full">
              <p className="text-sm font-bold text-emerald-800">SECURE SIGN IN</p>
              <h2 className="mt-2 text-3xl font-black">Owner login</h2>
              <p className="mt-2 text-sm text-slate-600">Use the platform owner account provisioned by your server administrator.</p>
              <label className="mt-8 block text-sm font-semibold" htmlFor="owner-email">Email address</label>
              <input id="owner-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full border border-slate-300 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
              <label className="mt-5 block text-sm font-semibold" htmlFor="owner-password">Password</label>
              <input id="owner-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full border border-slate-300 px-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
              <button disabled={submitting} className="mt-7 flex h-12 w-full items-center justify-center gap-2 bg-[#173d32] px-4 text-sm font-bold text-white hover:bg-[#225442] disabled:opacity-60">
                {submitting ? 'Verifying access...' : 'Enter owner workspace'} {!submitting && <ArrowRightOnRectangleIcon className="h-4 w-4" />}
              </button>
              <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-emerald-800 hover:underline">Return to business sign in</Link>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const statCards = [
    ['Registered businesses', stats?.totalBusinesses ?? '—', BuildingStorefrontIcon, 'text-emerald-800 bg-emerald-50'],
    ['Registered users', stats?.totalUsers ?? '—', UsersIcon, 'text-sky-800 bg-sky-50'],
    ['Branches', stats?.totalBranches ?? '—', BuildingStorefrontIcon, 'text-amber-800 bg-amber-50'],
    ['Active licenses', stats?.activeLicenses ?? '—', CheckBadgeIcon, 'text-teal-800 bg-teal-50'],
    ['Expired licenses', stats?.expiredLicenses ?? '—', ClockIcon, 'text-rose-800 bg-rose-50'],
  ];
  const visibleLicenses = licenseStatusFilter === 'all'
    ? licenses
    : licenses.filter((license) => license.effectiveStatus === licenseStatusFilter);

  return (
    <main className="min-h-screen bg-[#f3f5f2] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-[#173d32] text-[#d0e7a8]"><ShieldCheckIcon className="h-6 w-6" /></span>
            <div><p className="font-black leading-5">SuperM Owner</p><p className="text-xs text-slate-500">Platform management</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-slate-500 sm:inline">RESTRICTED CONSOLE</span>
            <button type="button" onClick={logout} title="Sign out" className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50"><ArrowRightOnRectangleIcon className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-800">Control room</p><h1 className="mt-2 text-3xl font-black">Platform overview</h1><p className="mt-1 text-sm text-slate-600">Business accounts, access, licenses, and recent events.</p></div>
          <button type="button" disabled={loading} onClick={refresh} className="h-10 border border-slate-300 bg-white px-4 text-sm font-bold hover:bg-slate-50 disabled:opacity-60">{loading ? 'Refreshing...' : 'Refresh data'}</button>
        </section>

        <section className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map(([label, value, Icon, tone]) => (
            <div key={label} className="min-w-0 bg-white p-5">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold text-slate-500">{label}</p><span className={`flex h-9 w-9 shrink-0 items-center justify-center ${tone}`}><Icon className="h-5 w-5" /></span></div>
              <p className="mt-3 text-3xl font-black tabular-nums">{value}</p>
            </div>
          ))}
        </section>

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div><h2 className="font-black">Licensing</h2><p className="mt-1 text-xs text-slate-500">Issue and maintain organization entitlements</p></div>
            <div className="flex items-center gap-3"><span className="text-xs font-semibold text-slate-500">{visibleLicenses.length} licenses</span><select aria-label="Filter license status" value={licenseStatusFilter} onChange={(event) => setLicenseStatusFilter(event.target.value)} className="h-9 border border-slate-300 bg-white px-2 text-sm"><option value="all">All licenses</option><option value="active">Active</option><option value="expired">Expired</option><option value="suspended">Suspended</option><option value="pending">Pending</option></select></div>
          </div>
          <form onSubmit={createLicense} className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1.5fr)_1fr_1fr_1fr_auto] xl:items-end">
            <label className="text-xs font-bold text-slate-600">Business<select required value={licenseBusinessId} onChange={(event) => setLicenseBusinessId(event.target.value)} className="mt-1 h-10 w-full border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"><option value="">Choose unlicensed business</option>{allBusinesses.filter((business) => !business.license).map((business) => <option key={business._id} value={business._id}>{business.name}</option>)}</select></label>
            <label className="text-xs font-bold text-slate-600">Plan<select value={licensePlan} onChange={(event) => setLicensePlan(event.target.value)} className="mt-1 h-10 w-full border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"><option value="starter">Starter</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select></label>
            <label className="text-xs font-bold text-slate-600">Start date<input type="date" required value={licenseStartDate} onChange={(event) => setLicenseStartDate(event.target.value)} className="mt-1 h-10 w-full border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900" /></label>
            <label className="text-xs font-bold text-slate-600">Expiry date<input type="date" required min={getMinimumExpiryDate(licenseStartDate)} value={licenseExpiryDate} onChange={(event) => setLicenseExpiryDate(event.target.value)} className="mt-1 h-10 w-full border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900" /></label>
            <button type="submit" disabled={!allBusinesses.some((business) => !business.license)} className="inline-flex h-10 items-center justify-center gap-2 bg-[#173d32] px-4 text-sm font-bold text-white hover:bg-[#225442] disabled:cursor-not-allowed disabled:opacity-50"><PlusIcon className="h-4 w-4" />Create license</button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-white text-[11px] uppercase text-slate-500"><tr><th className="px-5 py-3 font-bold">Business / key</th><th className="px-3 py-3 font-bold">Plan</th><th className="px-3 py-3 font-bold">Start</th><th className="px-3 py-3 font-bold">Expires</th><th className="px-3 py-3 font-bold">Status</th><th className="px-5 py-3 font-bold">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{visibleLicenses.map((license) => <tr key={license._id}>
                <td className="px-5 py-3"><p className="font-bold">{license.business?.name || 'Business unavailable'}</p><button type="button" onClick={() => copyLicenseKey(license.key)} className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 hover:underline"><ClipboardDocumentIcon className="h-3.5 w-3.5" />{license.key}</button></td>
                <td className="px-3 py-3"><select aria-label={`Plan for ${license.business?.name || 'business'}`} value={license.plan} onChange={(event) => changeLicensePlan(license, event.target.value)} className="h-8 border border-slate-300 bg-white px-2 text-xs"><option value="starter">Starter</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select></td>
                <td className="px-3 py-3 text-xs text-slate-600">{new Date(license.startDate).toLocaleDateString()}</td><td className="px-3 py-3 text-xs text-slate-600">{new Date(license.expiryDate).toLocaleDateString()}</td>
                <td className="px-3 py-3"><span className={`inline-flex px-2 py-1 text-[11px] font-bold ${license.effectiveStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : license.effectiveStatus === 'suspended' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{license.effectiveStatus}</span></td>
                <td className="px-5 py-3"><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => setLicenseStatus(license)} className="text-xs font-bold text-emerald-800 hover:underline">{license.status === 'suspended' ? 'Reactivate' : 'Suspend'}</button><form onSubmit={(event) => setLicenseExpiry(event, license)} className="flex items-center gap-1"><input name="expiryDate" aria-label={`Set expiry date for ${license.business?.name || 'license'}`} type="date" required min={getMinimumExpiryDate(license.startDate)} defaultValue={new Date(license.expiryDate).toISOString().slice(0, 10)} className="h-8 border border-slate-300 px-2 text-xs" /><button type="submit" className="text-xs font-bold text-slate-700 hover:underline">Set expiry</button></form><form onSubmit={(event) => extendLicense(event, license)} className="flex items-center gap-1"><input name="days" aria-label={`Days to extend ${license.business?.name || 'license'}`} type="number" min="1" max="3650" defaultValue="30" className="h-8 w-16 border border-slate-300 px-2 text-xs" /><button type="submit" className="text-xs font-bold text-slate-700 hover:underline">Extend days</button></form></div></td>
              </tr>)}{visibleLicenses.length === 0 && <tr><td colSpan="6" className="px-5 py-8 text-center text-sm text-slate-500">No licenses match this filter.</td></tr>}</tbody>
            </table>
          </div>
        </section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
          <section className="min-w-0 border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div><h2 className="font-black">Businesses</h2><p className="mt-1 text-xs text-slate-500">{businesses.length} matching accounts</p></div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <label className="relative min-w-[190px] flex-1 sm:flex-none"><MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input aria-label="Search businesses" placeholder="Search businesses" value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-full border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-700" /></label>
                <select aria-label="Business status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 border border-slate-300 bg-white px-2 text-sm"><option value="all">All status</option><option value="active">Active</option><option value="suspended">Suspended</option></select>
                <select aria-label="License status" value={licenseFilter} onChange={(event) => setLicenseFilter(event.target.value)} className="h-9 border border-slate-300 bg-white px-2 text-sm"><option value="all">All licenses</option><option value="active">Active</option><option value="expired">Expired</option></select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[660px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-5 py-3 font-bold">Business</th><th className="px-3 py-3 font-bold">Users</th><th className="px-3 py-3 font-bold">Branches</th><th className="px-3 py-3 font-bold">License expires</th><th className="px-3 py-3 font-bold">Status</th><th className="px-5 py-3" /></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {businesses.map((business) => {
                    return <tr key={business._id} onClick={() => setSelected(business)} className={`cursor-pointer hover:bg-emerald-50/50 ${selected?._id === business._id ? 'bg-emerald-50' : ''}`}>
                      <td className="px-5 py-3.5"><p className="font-bold">{business.name}</p><p className="mt-0.5 text-xs text-slate-500">Added {new Date(business.createdAt).toLocaleDateString()}</p></td>
                      <td className="px-3 py-3.5 tabular-nums">{business.users?.length || 0}</td><td className="px-3 py-3.5 tabular-nums">{business.branches?.length || 0}</td>
                      <td className={`px-3 py-3.5 text-xs ${business.license?.effectiveStatus === 'expired' ? 'font-semibold text-rose-700' : 'text-slate-600'}`}>{business.license?.expiryDate ? new Date(business.license.expiryDate).toLocaleDateString() : 'No license'}</td>
                      <td className="px-3 py-3.5"><span className={`inline-flex px-2 py-1 text-[11px] font-bold ${business.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{business.status}</span></td>
                      <td className="px-5 py-3.5 text-right"><button type="button" onClick={(event) => { event.stopPropagation(); changeBusinessStatus(business); }} className="text-xs font-bold text-emerald-800 hover:underline">{business.status === 'active' ? 'Suspend' : 'Reactivate'}</button></td>
                    </tr>;
                  })}
                  {businesses.length === 0 && <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">No businesses match these filters.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="min-w-0 border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-black">Business details</h2><p className="mt-1 text-xs text-slate-500">Users and branch overview</p></div>{selected && <button type="button" onClick={() => setSelected(null)} title="Close details" className="p-1 text-slate-500 hover:bg-slate-100"><XMarkIcon className="h-5 w-5" /></button>}</div>
            {selected ? <div className="max-h-[640px] space-y-5 overflow-y-auto p-5">
              <div><p className="text-xs font-bold uppercase text-slate-500">Business</p><h3 className="mt-1 text-xl font-black">{selected.name}</h3><p className="mt-1 text-xs text-slate-500">License {selected.license?.effectiveStatus || 'not issued'}{selected.license?.expiryDate ? ` · expires ${new Date(selected.license.expiryDate).toLocaleDateString()}` : ''}</p></div>
              <div><div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-bold">Users</h4><span className="text-xs text-slate-500">{selected.users?.length || 0} accounts</span></div>
                <div className="divide-y divide-slate-100 border-y border-slate-100">{selected.users?.map((user) => <div key={user._id} className="flex items-center justify-between gap-2 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.username}</p><p className="truncate text-xs text-slate-500">{user.email} · {user.role}</p></div><button type="button" onClick={() => changeUserStatus(user)} className={`shrink-0 text-xs font-bold ${user.isActive ? 'text-rose-700' : 'text-emerald-800'} hover:underline`}>{user.isActive ? 'Suspend' : 'Reactivate'}</button></div>)}{!selected.users?.length && <p className="py-4 text-sm text-slate-500">No linked users.</p>}</div>
              </div>
              <div><div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-bold">Branches</h4><span className="text-xs text-slate-500">{selected.branches?.length || 0} locations</span></div>
                <div className="divide-y divide-slate-100 border-y border-slate-100">{selected.branches?.map((branch) => <div key={branch._id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold">{branch.name}</p><p className="text-xs text-slate-500">{branch.location || 'No location provided'}</p></div><button type="button" onClick={() => removeBranch(branch)} className="shrink-0 text-xs font-bold text-rose-700 hover:underline">Remove</button></div>)}{!selected.branches?.length && <p className="py-4 text-sm text-slate-500">No branches recorded.</p>}</div>
                <form onSubmit={addBranch} className="mt-3 space-y-2"><input value={branchName} onChange={(event) => setBranchName(event.target.value)} placeholder="Branch name" aria-label="Branch name" required className="h-9 w-full border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700" /><div className="flex gap-2"><input value={branchLocation} onChange={(event) => setBranchLocation(event.target.value)} placeholder="Location (optional)" aria-label="Branch location" className="h-9 min-w-0 flex-1 border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700" /><button type="submit" title="Add branch" className="flex h-9 w-10 shrink-0 items-center justify-center bg-[#173d32] text-white hover:bg-[#225442]"><PlusIcon className="h-5 w-5" /></button></div></form>
              </div>
            </div> : <div className="flex min-h-64 items-center justify-center px-8 text-center text-sm text-slate-500">Select a business to review its account, users, and branches.</div>}
          </section>
        </div>

        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-black">System activity</h2><p className="mt-1 text-xs text-slate-500">Recent registrations and owner account actions</p></div>
          <div className="grid gap-x-8 px-5 sm:grid-cols-2 xl:grid-cols-3">{activity.slice(0, 9).map((event, index) => <div key={`${event.action}-${event.createdAt}-${index}`} className="flex min-w-0 gap-3 border-b border-slate-100 py-3"><span className="mt-1 h-2 w-2 shrink-0 bg-emerald-700" /><div className="min-w-0"><p className="text-sm text-slate-800">{event.description}</p><p className="mt-1 text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</p></div></div>)}{activity.length === 0 && <p className="py-6 text-sm text-slate-500">No activity recorded yet.</p>}</div>
        </section>
      </div>
    </main>
  );
};

export default OwnerPortal;