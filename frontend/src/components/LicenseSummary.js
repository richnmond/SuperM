import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';

const LicenseSummary = () => {
  const [license, setLicense] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/licenses/current`)
      .then((response) => setLicense(response.data.license))
      .catch(() => setLicense(null));
  }, []);

  if (!license) return null;

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"><ShieldCheckIcon className="h-5 w-5" /></span>
        <div><p className="text-sm font-bold text-slate-950 dark:text-white">Current license</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{license.plan} plan · Expires {new Date(license.expiryDate).toLocaleDateString()}</p></div>
      </div>
      <span className="inline-flex items-center gap-2 bg-emerald-100 px-3 py-1.5 text-xs font-bold capitalize text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"><span className="h-1.5 w-1.5 bg-current" />{license.status}</span>
    </section>
  );
};

export default LicenseSummary;