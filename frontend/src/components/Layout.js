import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-primary-700 text-white' : 'text-primary-100 hover:bg-primary-500 hover:text-white'
  }`;

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-primary-600 text-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-md bg-white text-primary-700 font-black text-sm flex items-center justify-center shadow-sm">
                SM
              </div>
              <span className="font-bold tracking-wide">SuperM Management</span>
            </div>
            <nav className="flex gap-2">
              <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
              <NavLink to="/products" className={navClass}>Products</NavLink>
              <NavLink to="/pos" className={navClass}>POS</NavLink>
              <NavLink to="/sales" className={navClass}>Sales</NavLink>
              <NavLink to="/suppliers" className={navClass}>Suppliers</NavLink>
              <NavLink to="/expenses" className={navClass}>Expenses</NavLink>
              <NavLink to="/profit" className={navClass}>Profit</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 text-sm bg-white text-primary-700 rounded-md hover:bg-primary-50"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">
                {user?.businessName || 'Set your business name'}
              </div>
              <div className="text-xs text-primary-100">
                {user?.username} ({user?.role})
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 text-sm bg-white text-primary-700 rounded-md hover:bg-primary-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
