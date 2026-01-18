import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [openCats, setOpenCats] = useState(false);

  // Logout Function
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/logout');
    } catch (err) {
      // ignore
    }
    window.location = '/admin/login';
  };

  // Fetch Categories
  useEffect(() => {
    let mounted = true;
    api.get('/admin/categories')
      .then(res => { if (!mounted) return; setCategories(res.data.data); })
      .catch(() => {})
    return () => mounted = false;
  }, []);

  // Styles
  const asideClass = `fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 transform ${
    mobileOpen ? 'translate-x-0' : '-translate-x-full'
  } lg:translate-x-0 flex flex-col h-screen shadow-2xl border-r border-slate-800`;

  // Base link style
  const linkClass = ({ isActive }) =>
    `flex items-center px-4 py-2.5 my-1 transition-all duration-200 rounded-lg group ${
      isActive 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
        : 'hover:bg-slate-800 hover:text-white'
    }`;
    
  // Sub-menu link style (More padding left)
  const subLinkClass = ({ isActive }) =>
    `flex items-center pl-12 pr-4 py-2 text-sm transition-colors duration-200 rounded-lg ${
      isActive 
        ? 'text-indigo-400 font-medium' 
        : 'text-slate-500 hover:text-indigo-300'
    }`;

  // Section Header Style
  const sectionHeaderClass = "px-4 mt-6 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider";

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      ></div>

      <aside id="sidebar" className={asideClass}>
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 bg-slate-900/50 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider text-white">
            <span className="text-indigo-500 text-2xl">Q</span>uizAdmin
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          
          {/* --- MAIN SECTION --- */}
          <div className={sectionHeaderClass}>Main</div>
          
          <NavLink to="/admin/dashboard" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="mx-3 font-medium">Dashboard</span>
          </NavLink>

          {/* --- QUIZ MANAGEMENT SECTION --- */}
          <div className={sectionHeaderClass}>Quiz Management</div>

          <NavLink to="/admin/quizzes" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="mx-3 font-medium">All Quizzes</span>
          </NavLink>

          <NavLink to="/admin/feature-quizzes" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="mx-3 font-medium">Featured Quizzes</span>
          </NavLink>

          {/* Expandable Category Filter */}
          <div>
            <button
              type="button"
              onClick={() => setOpenCats(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5 my-1 text-slate-300 transition-colors duration-200 rounded-lg hover:bg-slate-800 hover:text-white group"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="mx-3 font-medium">Filter by Category</span>
              </div>
              <svg className={`w-4 h-4 transition-transform duration-200 ${openCats ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Items */}
            <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${openCats ? 'max-h-96' : 'max-h-0'}`}>
              <div className="py-1 space-y-1">
                {categories && categories.length ? (
                  categories.map(c => (
                    <NavLink 
                      key={c.id} 
                      to={`/admin/quizzes?category_id=${c.id}`} 
                      className={subLinkClass} 
                      onClick={() => setMobileOpen && setMobileOpen(false)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-2 group-hover:bg-indigo-400"></span>
                      {c.title}
                    </NavLink>
                  ))
                ) : (
                  <div className="pl-12 py-2 text-xs text-slate-500 italic">Loading categories...</div>
                )}
              </div>
            </div>
          </div>

          <NavLink to="/admin/features" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="mx-3 font-medium">Features (Tags)</span>
          </NavLink>

          <NavLink to="/admin/questions" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="mx-3 font-medium">Questions</span>
          </NavLink>

          {/* --- ORGANIZATION SECTION --- */}
          <div className={sectionHeaderClass}>Organization</div>

          <NavLink to="/admin/categories" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="mx-3 font-medium">Manage Categories</span>
          </NavLink>

          <NavLink to="/admin/sub-categories" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="mx-3 font-medium">Sub Categories</span>
          </NavLink>

          {/* --- SYSTEM SECTION --- */}
          <div className={sectionHeaderClass}>Administration</div>

          <NavLink to="/admin/leaderboard" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="mx-3 font-medium">Leaderboard</span>
          </NavLink>

          <NavLink to="/admin/users" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="mx-3 font-medium">Users</span>
          </NavLink>

          <NavLink to="/admin/coin-conversion" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="mx-3 font-medium">Coin Conversion</span>
          </NavLink>

          <NavLink to="/admin/withdrawals" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="mx-3 font-medium">Withdrawals</span>
          </NavLink>

          <NavLink to="/admin/banners" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <span className="mx-3 font-medium">Banners</span>
          </NavLink>

          <NavLink to="/admin/promotional-images" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8h18M3 12h18M3 16h18" />
            </svg>
            <span className="mx-3 font-medium">Promotional Images</span>
          </NavLink>

          <NavLink to="/admin/withdrawal-settings" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="mx-3 font-medium">Withdrawal Settings</span>
          </NavLink>

          <NavLink to="/admin/notifications" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="mx-3 font-medium">Send Notifications</span>
          </NavLink>

          <NavLink to="/admin/settings" className={linkClass} onClick={() => setMobileOpen && setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="mx-3 font-medium">Settings</span>
          </NavLink>

        </nav>

        {/* Footer / Logout */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <a href="#" onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-slate-400 rounded-lg hover:bg-red-600/10 hover:text-red-500 transition-colors group">
            <svg className="w-5 h-5 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="mx-3 font-medium">Logout</span>
          </a>
        </div>
      </aside>
    </>
  );
}