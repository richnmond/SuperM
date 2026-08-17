import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaChartLine,
  FaBoxOpen,
  FaCashRegister,
  FaShoppingBag,
  FaUserFriends,
  FaUsers,
  FaReceipt,
  FaDollarSign,
  FaMoon,
  FaSignOutAlt,
  FaShoppingCart,
  FaBars,
  FaTimes
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
  { to: '/app/customers', label: 'Customers', icon: FaUserFriends },
  { to: '/app/suppliers', label: 'Suppliers', icon: FaUsers },
  { to: '/app/expenses', label: 'Expenses', icon: FaReceipt },
  { to: '/app/profit', label: 'Profit', icon: FaDollarSign }
];

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[300px_1fr]">
        <div className="lg:hidden">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-700 text-lg text-white shadow-sm">
                <FaShoppingCart />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">SuperM</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Retail control</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </header>
        </div>

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[82%] max-w-[300px] transform overflow-y-auto bg-gradient-to-b from-blue-700 via-blue-800 to-slate-900 text-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:w-auto lg:max-w-none lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="flex min-h-screen flex-col justify-between px-5 py-6 lg:px-6 lg:py-8">
            <div className="space-y-8">
              <div className="rounded-3xl bg-white/10 p-4 shadow-inner shadow-black/10 backdrop-blur-xl lg:rounded-[2rem]">
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
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileMenu}
                      className={navClass}
                    >
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
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{user?.businessName || 'SuperM Store'}</p>
                  <p className="truncate text-xs text-blue-100/80">{user?.username} ({user?.role})</p>
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

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
