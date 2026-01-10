import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

export default function UsersEdit() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', main_balance: 0, coin_balance: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    let mounted = true;
    api.get('/admin/users/' + id)
      .then(res => { if (mounted) {
        const payload = res.data.data;
        setForm({
          name: payload.name || '',
          email: payload.email || '',
          main_balance: payload.main_balance ?? 0,
          coin_balance: payload.coin_balance ?? 0,
          password: '',
          password_confirmation: ''
        });
      }})
      .catch(()=>{})
      .finally(()=> mounted && setLoading(false));
    return ()=> mounted = false;
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ensureCsrf();
      await api.put('/admin/users/' + id, form);
      import('../notify').then(m=>m.notify({ type: 'success', message: 'User updated' }));
      navigate('/admin/users');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Save failed';
      import('../notify').then(m=>m.notify({ type: 'error', message: msg }));
    } finally { setSaving(false); }
  }

  if (loading) return <div className="container mx-auto py-8">Loading...</div>

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        <Link to="/admin/users" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to List
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
        <form onSubmit={submit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2 mb-2">Account Details</h3>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" />
            </div>

            <div className="col-span-2 mt-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-2 mb-2">Security</h3>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input type="password" name="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" />
              <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password.</p>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={e=>setForm({...form,password_confirmation:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" />
            </div>

            <div className="col-span-2 mt-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-2 mb-2">Wallet Management</h3>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Balance (৳)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">৳</span></div>
                <input type="number" step="0.01" name="main_balance" value={form.main_balance} onChange={e=>setForm({...form,main_balance:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 p-3 transition duration-200 placeholder-gray-400" />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Coin Balance</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">🪙</span></div>
                <input type="number" name="coin_balance" value={form.coin_balance} onChange={e=>setForm({...form,coin_balance:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 p-3 transition duration-200 placeholder-gray-400" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Link to="/admin/users" className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</Link>
            <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold">{saving ? 'Updating...' : 'Update User'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
