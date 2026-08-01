import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaChartLine,
  FaBoxOpen,
  FaCashRegister,
  FaShoppingBag,
  FaUsers,
  FaReceipt,
  FaDollarSign,
  FaMoon,
  FaSignOutAlt,
  FaShoppingCart
} from 'react-icons/fa';

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? 'bg-white text-primary-700 shadow-md'
      : 'text-white/80 hover:bg-white/10 hover:text-white'
  }`;

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: FaChartLine },
  { to: '/app/products', label: 'Products', icon: FaBoxOpen },
  { to: '/app/pos', label: 'POS', icon: FaCashRegister },
  { to: '/app/sales', label: 'Sales', icon: FaShoppingBag },
  { to: '/app/suppliers', label: 'Suppliers', icon: FaUsers },
  { to: '/app/expenses', label: 'Expenses', icon: FaReceipt },
  { to: '/app/profit', label: 'Profit', icon: FaDollarSign }
];

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[300px_1fr]">
        <aside className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-800 to-slate-900 text-white shadow-xl">
          <div className="flex h-full flex-col justify-between px-6 py-8">
            <div className="space-y-10">
              <div className="rounded-3xl bg-white/10 p-4 shadow-inner shadow-black/10 backdrop-blur-xl">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-blue-800 text-2xl font-black shadow-sm">
                  <FaShoppingCart />
                </div>
                <div className="mt-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-blue-200/80">SuperM</p>
                  <h1 className="mt-2 text-2xl font-bold text-white">Retail control</h1>
                  <p className="mt-2 text-sm text-blue-100/80">Modern inventory, POS, and sales tools for your store.</p>
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} className={navClass}>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg text-white">
                        <Icon />
                      </span>
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-xl font-semibold text-white">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user?.businessName || 'SuperM Store'}</p>
                  <p className="text-xs text-blue-100/80">{user?.username} ({user?.role})</p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <FaMoon />
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white text-blue-800 px-4 py-3 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-900"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
