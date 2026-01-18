import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

// --- ICONS (SVG) ---
const Icons = {
  Back: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Wallet: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Coin: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Block: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  Edit: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
};

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals State
  const [balanceModal, setBalanceModal] = useState({ show: false, type: 'main' }); // type: 'main' or 'coin'
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState('add'); // 'add' or 'deduct'
  const [rejectModal, setRejectModal] = useState({ show: false, id: null });
  const [rejectReason, setRejectReason] = useState('');

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      await ensureCsrf();
      const [uRes, hRes, wRes] = await Promise.all([
        api.get(`/admin/users/${id}`),
        api.get(`/admin/users/${id}/history`),
        api.get(`/admin/withdrawal/requests?user_id=${id}&per_page=100`)
      ]);

      setUser(uRes.data?.data || uRes.data);
      setHistory(hRes.data?.data || hRes.data || []);
      setWithdrawals(wRes.data?.data || wRes.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Actions
  const toggleBlockUser = async () => {
    if (!window.confirm(`Are you sure you want to ${user.blocked ? 'unblock' : 'block'} this user?`)) return;
    try {
      const res = await api.post(`/admin/users/${id}/toggle-block`);
      if (res.data.success) {
        setUser({ ...user, blocked: !user.blocked });
        alert(`User ${user.blocked ? 'unblocked' : 'blocked'} successfully`);
      }
    } catch (e) {
      alert('Action failed');
    }
  };

  const handleBalanceUpdate = async () => {
    if (!balanceAmount || isNaN(balanceAmount)) return alert('Enter valid amount');
    
    const amount = parseFloat(balanceAmount);
    const isMain = balanceModal.type === 'main';
    const current = isMain ? parseFloat(user.main_balance) : parseInt(user.coin_balance);
    
    let newBalance = balanceAction === 'add' ? current + amount : current - amount;
    if (newBalance < 0) newBalance = 0;

    // Prepare payload (API requires name/email too)
    const payload = {
      name: user.name,
      email: user.email,
      [isMain ? 'main_balance' : 'coin_balance']: newBalance
    };

    try {
      await api.put(`/admin/users/${id}`, payload);
      setUser({ ...user, [isMain ? 'main_balance' : 'coin_balance']: newBalance });
      setBalanceModal({ show: false, type: 'main' });
      setBalanceAmount('');
      alert('Balance updated successfully!');
    } catch (e) {
      alert('Failed to update balance');
    }
  };

  const handleWithdrawalAction = async (wid, action, notes = null) => {
    if (action === 'approve' && !window.confirm('Approve this request?')) return;
    if (action === 'complete' && !window.confirm('Mark as completed?')) return;

    try {
      const endpoint = action === 'reject' ? 'reject' : action === 'complete' ? 'complete' : 'approve';
      const body = notes ? { admin_notes: notes } : {};
      
      await api.post(`/admin/withdrawal/request/${wid}/${endpoint}`, body);
      
      // Refresh withdrawals locally
      const updatedList = withdrawals.map(w => w.id === wid ? { ...w, status: action === 'reject' ? 'rejected' : action === 'approve' ? 'approved' : 'completed' } : w);
      setWithdrawals(updatedList);
      
      if (action === 'reject') {
        setRejectModal({ show: false, id: null });
        setRejectReason('');
      }
    } catch (e) {
      alert(`Failed to ${action} request`);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!user) return <div className="p-10 text-center text-red-500">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-gray-100 rounded-full transition">
                <Icons.Back />
              </button>
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {user.name}
                  {user.blocked && <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-600 border border-red-200">BLOCKED</span>}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span>{user.email}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={toggleBlockUser}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-sm ${user.blocked ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'}`}
              >
                <Icons.Block /> {user.blocked ? 'Unblock User' : 'Block User'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md transition">
                <Icons.Edit /> Edit Profile
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 mt-8 border-b border-gray-100">
            {['overview', 'wallet', 'withdrawals', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Cards */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Icons.Wallet /></div>
                <p className="text-blue-100 text-sm font-medium">Main Balance</p>
                <h2 className="text-3xl font-bold mt-1">৳ {Number(user.main_balance).toFixed(2)}</h2>
                <button 
                  onClick={() => setBalanceModal({ show: true, type: 'main' })}
                  className="mt-4 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium backdrop-blur-sm transition"
                >
                  Adjust Balance
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Icons.Coin /></div>
                <p className="text-amber-100 text-sm font-medium">Coin Balance</p>
                <h2 className="text-3xl font-bold mt-1">{user.coin_balance}</h2>
                <button 
                  onClick={() => setBalanceModal({ show: true, type: 'coin' })}
                  className="mt-4 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium backdrop-blur-sm transition"
                >
                  Adjust Coins
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Activity Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 text-sm">Total Withdrawals</span>
                  <span className="font-bold text-gray-800">{withdrawals.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 text-sm">Pending Requests</span>
                  <span className="font-bold text-orange-600">{withdrawals.filter(w => w.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 text-sm">Total Transactions</span>
                  <span className="font-bold text-gray-800">{history.length}</span>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="text-xs text-gray-400">Full Name</label><p className="font-medium">{user.name}</p></div>
                <div><label className="text-xs text-gray-400">Email</label><p className="font-medium">{user.email}</p></div>
                <div><label className="text-xs text-gray-400">Phone</label><p className="font-medium">{user.phone || 'N/A'}</p></div>
                <div><label className="text-xs text-gray-400">Username</label><p className="font-medium">{user.username || 'N/A'}</p></div>
                <div><label className="text-xs text-gray-400">IP Address</label><p className="font-medium">{user.last_ip || 'Unknown'}</p></div>
                <div><label className="text-xs text-gray-400">Device</label><p className="font-medium">{user.device_id ? 'Registered' : 'N/A'}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Withdrawal History</h3>
              <div className="flex gap-2">
                {['All', 'Pending', 'Approved'].map(f => (
                  <button key={f} className="px-3 py-1 text-xs font-medium bg-white border rounded-md hover:bg-gray-50 transition">{f}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                    <th className="p-4">ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {withdrawals.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-400">No records found</td></tr>}
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 text-sm text-gray-600">#{w.id}</td>
                      <td className="p-4 font-bold text-gray-900">৳{Number(w.amount).toFixed(2)}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium uppercase">{w.payment_method}</span></td>
                      <td className="p-4 text-sm text-gray-600">{w.account_number}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          w.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          w.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {w.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleWithdrawalAction(w.id, 'approve')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><Icons.Check /></button>
                            <button onClick={() => setRejectModal({ show: true, id: w.id })} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><Icons.X /></button>
                          </div>
                        )}
                        {w.status === 'approved' && (
                          <button onClick={() => handleWithdrawalAction(w.id, 'complete')} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition">Mark Completed</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h3 className="font-bold text-gray-800">Transaction History</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Balance After</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${h.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {h.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">{h.description}</td>
                      <td className={`p-4 font-medium ${h.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {h.type === 'credit' ? '+' : '-'}{h.category === 'coin' ? '' : '৳'}{Math.abs(h.amount || h.coins)}
                      </td>
                      <td className="p-4 text-sm text-gray-500">{h.balance_after}</td>
                      <td className="p-4 text-sm text-gray-400">{new Date(h.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Adjust Balance */}
      {balanceModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">Adjust {balanceModal.type === 'main' ? 'Main' : 'Coin'} Balance</h3>
              <button onClick={() => setBalanceModal({ show: false, type: 'main' })} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button 
                  onClick={() => setBalanceAction('add')} 
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${balanceAction === 'add' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                >
                  Add (+)
                </button>
                <button 
                  onClick={() => setBalanceAction('deduct')} 
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${balanceAction === 'deduct' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                >
                  Deduct (-)
                </button>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input 
                type="number" 
                value={balanceAmount} 
                onChange={(e) => setBalanceAmount(e.target.value)} 
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="0.00" 
              />
              <p className="text-xs text-gray-500 mt-2">
                Current: {balanceModal.type === 'main' ? `৳ ${user.main_balance}` : user.coin_balance} 
                {' '} → {' '} 
                <span className="font-bold text-indigo-600">
                  New: {balanceAmount ? (balanceAction === 'add' ? (parseFloat(balanceModal.type === 'main' ? user.main_balance : user.coin_balance) + parseFloat(balanceAmount)) : (parseFloat(balanceModal.type === 'main' ? user.main_balance : user.coin_balance) - parseFloat(balanceAmount))) : '-'}
                </span>
              </p>
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setBalanceModal({ show: false, type: 'main' })} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleBalanceUpdate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md">Update Balance</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reject Withdrawal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-5 border-b"><h3 className="font-bold text-lg text-red-600">Reject Request</h3></div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection</label>
              <textarea 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                className="w-full p-3 border rounded-xl h-24 focus:ring-2 focus:ring-red-500 outline-none" 
                placeholder="Optional notes for user..." 
              />
            </div>
            <div className="p-5 border-t flex justify-end gap-3">
              <button onClick={() => setRejectModal({ show: false, id: null })} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => handleWithdrawalAction(rejectModal.id, 'reject', rejectReason)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}