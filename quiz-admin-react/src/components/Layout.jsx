import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/admin/check')
      .then((res) => {
        if (mounted) setAdmin(res.data);
      })
      .catch(() => {})
      .finally(() => {});

    return () => (mounted = false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 z-30">
          <div className="px-6 py-4 flex justify-between items-center">

            <div className="flex items-center lg:hidden">
              <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-indigo-600 focus:outline-none">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="ml-4 text-lg font-bold text-gray-800">Quiz Admin</span>
            </div>

            <h1 className="hidden lg:block text-xl font-semibold text-gray-800"></h1>

            <div className="flex items-center space-x-4">
              <Link to="/admin/profile" className="flex items-center space-x-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors duration-200 group">
                <span className="text-sm text-gray-600 font-medium group-hover:text-indigo-600 transition-colors">
                  {admin?.name ?? 'Admin User'}
                </span>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {(admin?.name ?? 'A').charAt(0)}
                </div>
              </Link>
            </div>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{
          children
        }</main>
      </div>
    </div>
  );
}
