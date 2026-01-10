import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard({ setAuth }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/admin/check")
      .then(() => {
        if (mounted) setError("");
      })
      .catch(() => {
        if (mounted) setError("Session invalid. Please login again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => (mounted = false);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Quizzes</div>
              <div className="text-3xl font-bold mt-2">0</div>
            </div>
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6"/></svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Questions</div>
              <div className="text-3xl font-bold mt-2">0</div>
            </div>
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M8 12h6"/></svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Users</div>
              <div className="text-3xl font-bold mt-2">0</div>
            </div>
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.616 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Active Quizzes</div>
              <div className="text-3xl font-bold mt-2">0</div>
            </div>
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/></svg>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 bg-white rounded-2xl shadow p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <p className="text-sm text-slate-500">Create quizzes, manage users and adjust settings quickly.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">Create Quiz</button>
            <button className="bg-white border border-slate-200 px-4 py-2 rounded hover:bg-slate-50 transition">Manage Users</button>
            <button className="bg-white border border-slate-200 px-4 py-2 rounded hover:bg-slate-50 transition">Settings</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">Placeholder for recent activity</div>
          <div className="p-4 bg-slate-50 rounded-lg">Placeholder for analytics</div>
          <div className="p-4 bg-slate-50 rounded-lg">Placeholder for announcements</div>
        </div>
      </div>
    </>
  );
}
