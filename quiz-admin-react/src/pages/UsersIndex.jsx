import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

export default function UsersIndex() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });

  // Fetch Users Function
  const fetchUsers = (page = 1, searchQuery = '') => {
    setLoading(true);
    let url = `/admin/users?page=${page}`;
    if (searchQuery) {
      url += `&search=${searchQuery}`;
    }

    api.get(url)
      .then(res => {
        const payload = res.data;
        if (payload.success) {
          setUsers(payload.data);
          setPagination(payload.pagination);
          setCurrentPage(payload.pagination.current_page);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Initial Load & Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(currentPage, search);
    }, 500); // টাইপ করার পর ০.৫ সেকেন্ড অপেক্ষা করবে

    return () => clearTimeout(delayDebounceFn);
  }, [search, currentPage]);

  // Handle Search Input
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // সার্চ করলে ১ নম্বর পেজে রিসেট হবে
  };

  // Actions
  const toggleBlock = async (id) => {
    try {
      await ensureCsrf();
      const res = await api.post('/admin/users/' + id + '/block');
      setUsers(u => u.map(x => x.id === id ? res.data.data : x));
    } catch (e) {
      alert('Failed to toggle block status');
    }
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await ensureCsrf();
      await api.delete('/admin/users/' + id);
      setUsers(u => u.filter(x => x.id !== id));
      // আইটেম ডিলিট করার পর পেজ রিফ্রেশ বা কাউন্ট আপডেট করার জন্য fetchUsers কল করতে পারেন
    } catch (e) {
      alert('Delete failed');
    }
  }

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 py-8">

      {/* Header Section */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-2 text-sm text-slate-500">Manage all registered users, balances and access.</p>
        </div>
        
        {/* Right Side: Search & Add Button */}
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                <input 
                    type="text" 
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    placeholder="Search users..." 
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            <Link to="/admin/users/create" className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow whitespace-nowrap">
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add New User
            </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow rounded-2xl overflow-hidden border border-slate-100 flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-grow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Info</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Main Balance</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Coins</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                 <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                        Loading data...
                    </td>
                 </tr>
              ) : users.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                        No users found matching your search.
                    </td>
                 </tr>
              ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <span className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-semibold text-lg">{(user.name||'').charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-900">৳ {Number(user.main_balance||0).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">🪙 {user.coin_balance}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.blocked ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Blocked</span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/users/${user.id}/edit`} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>

                          <button onClick={() => toggleBlock(user.id)} className={`p-2 rounded-lg transition-colors ${user.blocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                            {user.blocked ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            )}
                          </button>

                          <button onClick={() => remove(user.id)} className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && users.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of <span className="font-medium">{pagination.total}</span> results
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded border text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage === pagination.last_page}
                        className={`px-3 py-1 rounded border text-sm font-medium ${currentPage === pagination.last_page ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}