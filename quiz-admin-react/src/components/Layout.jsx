import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Notification from './Notification';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [alertModal, setAlertModal] = useState(null);
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const pollRef = useRef(null);

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

  // Alerts polling
  useEffect(() => {
    // Load last seen IDs from localStorage
    const loadLastSeen = () => {
      try {
        const saved = localStorage.getItem('admin_alert_last_seen');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return { withdrawal: 0, user: 0 };
    };

    let lastSeen = loadLastSeen();
    const playSound = () => {
      try {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      } catch (e) {
        // ignore autoplay block
      }
    };

    const poll = () => {
      api
        .get('/admin/alerts')
        .then((res) => {
          if (!res.data?.success) return;
          const latest = res.data.latest || {};
          const newAlerts = [];

          // Withdrawal alert
          if (latest.withdrawal && latest.withdrawal.id > (lastSeen.withdrawal || 0)) {
            newAlerts.push({
              type: 'withdrawal',
              title: 'New withdrawal request',
              message: `৳${parseFloat(latest.withdrawal.amount || 0).toFixed(2)} via ${latest.withdrawal.payment_method || ''}`,
              route: '/admin/withdrawals',
              id: latest.withdrawal.id,
            });
            lastSeen = { ...lastSeen, withdrawal: latest.withdrawal.id };
          }

          // New user alert
          if (latest.user && latest.user.id > (lastSeen.user || 0)) {
            newAlerts.push({
              type: 'user',
              title: 'New user joined',
              message: `${latest.user.name || 'New user'} (${latest.user.email || ''})`,
              route: '/admin/users',
              id: latest.user.id,
            });
            lastSeen = { ...lastSeen, user: latest.user.id };
          }

          if (newAlerts.length > 0) {
            // Show the latest alert (one at a time)
            setAlertModal(newAlerts[0]);
            playSound();
            try {
              localStorage.setItem('admin_alert_last_seen', JSON.stringify(lastSeen));
            } catch (e) {}
          }
        })
        .catch(() => {});
    };

    // Initial poll and interval
    poll();
    pollRef.current = setInterval(poll, 20000); // every 20s

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const closeAlert = () => setAlertModal(null);
  const viewAlert = () => {
    if (alertModal?.route) {
      navigate(alertModal.route);
    }
    setAlertModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex lg:pl-64">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Notification />
        {/* Hidden audio for alert sound */}
        <audio
  ref={audioRef}
  // টেস্ট করার জন্য এই অনলাইন লিংকটি ব্যবহার করুন। কাজ করলে পরে নিজের ফাইল দেবেন।
  src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
  preload="auto"
/>

        {/* Alert Modal */}
        {alertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
                    !
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">New Alert</div>
                    <div className="text-lg font-semibold text-gray-900">{alertModal.title}</div>
                  </div>
                </div>
                <button onClick={closeAlert} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="px-5 py-4">
                <p className="text-gray-700 text-sm">{alertModal.message}</p>
              </div>
              <div className="px-5 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={closeAlert}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Okay
                </button>
                <button
                  onClick={viewAlert}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        )}
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
