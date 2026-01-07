import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

export default function UsersCreate() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', main_balance: 0, coin_balance: 0 });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ensureCsrf();
      await api.post('/admin/users', form);
      navigate('/admin/users');
    } catch (err) {
      alert('Save failed');
    } finally { setSaving(false); }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
        <Link to="/admin/users" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to List
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="text-lg font-medium text-slate-900">User Information</h3>
          <p className="mt-1 text-sm text-slate-500">Please fill in the details to register a new user.</p>
        </div>

        <form onSubmit={submit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 px-4 transition duration-200" placeholder="e.g. John Doe" />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 px-4 transition duration-200" placeholder="name@example.com" />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input type="password" name="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 px-4 transition duration-200" />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={e=>setForm({...form,password_confirmation:e.target.value})} required className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 px-4 transition duration-200" />
            </div>

            <div className="col-span-2 mt-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-2 mb-4">Wallet Configuration</h4>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Starting Balance (৳)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">৳</span></div>
                <input type="number" step="0.01" name="main_balance" value={form.main_balance} onChange={e=>setForm({...form,main_balance:e.target.value})} className="w-full pl-8 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 transition duration-200" />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Starting Coins</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">🪙</span></div>
                <input type="number" name="coin_balance" value={form.coin_balance} onChange={e=>setForm({...form,coin_balance:e.target.value})} className="w-full pl-8 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 transition duration-200" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold">{saving ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
