import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckBadgeIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const LicenseGate = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadLicense = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/licenses/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnapshot(response.data);
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not verify this business license.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadLicense();
  }, [user, loadLicense]);

  const activate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/api/licenses/activate`, { licenseKey: licenseKey.trim() }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLicenseKey('');
      await loadLicense();
    } catch (error) {
      setMessage(error.response?.data?.message || 'License activation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-semibold text-slate-600">Verifying business license...</div>;
  }

  const license = snapshot?.license;
  const businessStatus = snapshot?.businessStatus;
  const isValid = businessStatus === 'active' && license?.status === 'active';
  if (isValid && license.activated) return children;

  const title = businessStatus === 'suspended'
    ? 'Business account suspended'
    : !license
      ? 'No license assigned'
      : license.status === 'expired'
        ? 'License expired'
        : license.status === 'suspended'
          ? 'License suspended'
          : license.status === 'pending'
            ? 'License not started'
            : 'Activate this installation';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2ed] px-4 py-10 text-slate-950">
      <section className="w-full max-w-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start gap-4 border-b border-slate-200 bg-[#173d32] px-6 py-6 text-white sm:px-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#d0e7a8] text-[#173d32]"><ShieldExclamationIcon className="h-6 w-6" /></span>
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d0e7a8]">SuperM licensing</p><h1 className="mt-1 text-2xl font-black">{title}</h1><p className="mt-2 text-sm text-emerald-50/80">The business workspace stays locked until its license is verified.</p></div>
        </div>
        <div className="space-y-5 p-6 sm:p-8">
          {license && <dl className="grid grid-cols-2 gap-3 border-y border-slate-200 py-4">
            <div><dt className="text-xs font-semibold text-slate-500">Plan</dt><dd className="mt-1 text-sm font-bold capitalize">{license.plan}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Status</dt><dd className="mt-1 text-sm font-bold capitalize">{license.status}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Starts</dt><dd className="mt-1 text-sm font-bold">{new Date(license.startDate).toLocaleDateString()}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Expires</dt><dd className="mt-1 text-sm font-bold">{new Date(license.expiryDate).toLocaleDateString()}</dd></div>
          </dl>}
          {isValid && !license.activated ? <form onSubmit={activate}>
            <label htmlFor="business-license-key" className="block text-sm font-bold">License key</label>
            <input id="business-license-key" value={licenseKey} onChange={(event) => setLicenseKey(event.target.value)} required autoComplete="off" placeholder="Enter the key supplied by your platform owner" className="mt-2 h-12 w-full border border-slate-300 px-3 font-mono text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
            <button type="submit" disabled={submitting} className="mt-3 flex h-11 w-full items-center justify-center gap-2 bg-[#173d32] px-4 text-sm font-bold text-white hover:bg-[#225442] disabled:opacity-60"><CheckBadgeIcon className="h-5 w-5" />{submitting ? 'Verifying key...' : 'Activate license'}</button>
          </form> : <p className="text-sm leading-6 text-slate-600">{businessStatus === 'suspended' || license?.status === 'suspended' || license?.status === 'expired'
            ? 'Contact the platform owner to reactivate or extend this license.'
            : !license
              ? 'Ask the platform owner to issue a license for your business, then refresh this page.'
              : 'Access will be available when the license start date is reached.'}</p>}
          {message && <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{message}</p>}
          <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4">
            <button type="button" onClick={loadLicense} className="text-sm font-bold text-emerald-800 hover:underline">Refresh license status</button>
            <button type="button" onClick={() => { logout(); navigate('/login'); }} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Sign out</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LicenseGate;