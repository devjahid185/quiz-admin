import { useEffect, useState } from 'react';
import api, { ensureCsrf } from '../api';

export default function Profile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState(null);

  useEffect(()=>{
    let mounted = true;
    api.get('/admin/profile')
      .then(res => { if (mounted) {
        const payload = res.data.data || res.data;
        setAdmin(payload);
        setProfileForm({ name: payload.name || '', email: payload.email || '' });
      }})
      .catch(()=>{})
      .finally(()=> mounted && setLoading(false));
    return ()=> mounted = false;
  }, []);

  const submitProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage(null); setErrors(null);
    try {
      await ensureCsrf();
      const res = await api.put('/admin/profile/update', profileForm);
      setAdmin(res.data.data);
      setMessage('Profile information updated successfully.');
      import('../notify').then(m=>m.notify({ type: 'success', message: 'Profile updated' }));
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: 'Save failed' });
      const msg = err?.response?.data?.message || 'Save failed';
      import('../notify').then(m=>m.notify({ type: 'error', message: msg }));
    } finally { setSavingProfile(false); }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setMessage(null); setErrors(null);
    try {
      await ensureCsrf();
      await api.put('/admin/profile/password', pwForm);
      setMessage('Password changed successfully.');
      import('../notify').then(m=>m.notify({ type: 'success', message: 'Password changed' }));
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: 'Save failed' });
      const msg = err?.response?.data?.message || 'Save failed';
      import('../notify').then(m=>m.notify({ type: 'error', message: msg }));
    } finally { setSavingPassword(false); }
  };

  if (loading) return <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {message && <div className="mb-6 rounded-md bg-green-50 p-4 border-l-4 border-green-400"><div className="flex"><div className="ml-3"><p className="text-sm font-medium text-green-800">{message}</p></div></div></div>}
      {errors && <div className="mb-6 rounded-md bg-red-50 p-4 border-l-4 border-red-400"><div className="flex"><div className="ml-3"><ul className="list-disc list-inside text-sm text-red-700">{Object.values(errors).flat().map((e,i)=>(<li key={i}>{e}</li>))}</ul></div></div></div>}

      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0 mb-4 text-center md:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Overview</h3>
            <p className="mt-1 text-sm text-gray-600">Your personal account details.</p>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4">{(admin.name||'A').charAt(0).toUpperCase()}</div>
              <h2 className="text-xl font-bold text-gray-900">{admin.name}</h2>
              <p className="text-sm text-gray-500">{admin.email}</p>
              <div className="mt-4 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold tracking-wide uppercase">Super Admin</div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 p-4 text-center"><p className="text-xs text-gray-500">Member since {new Date(admin.created_at).toLocaleDateString()}</p></div>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Profile Information</h3>
              <form onSubmit={submitProfile}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                      <input type="text" value={profileForm.name} onChange={e=>setProfileForm({...profileForm,name:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3 transition duration-200 placeholder-gray-400" required />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                      <input type="email" value={profileForm.email} onChange={e=>setProfileForm({...profileForm,email:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3 transition duration-200 placeholder-gray-400" required />
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-right">
                  <button type="submit" disabled={savingProfile} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">Save Changes</button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Update Password</h3>
              <p className="text-sm text-gray-500 mb-6">Ensure your account is using a long, random password to stay secure.</p>

              <form onSubmit={submitPassword}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input type="password" value={pwForm.current_password} onChange={e=>setPwForm({...pwForm,current_password:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" required />
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" value={pwForm.password} onChange={e=>setPwForm({...pwForm,password:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" required />
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" value={pwForm.password_confirmation} onChange={e=>setPwForm({...pwForm,password_confirmation:e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" required />
                  </div>
                </div>

                <div className="mt-6 text-right">
                  <button type="submit" disabled={savingPassword} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Update Password</button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
