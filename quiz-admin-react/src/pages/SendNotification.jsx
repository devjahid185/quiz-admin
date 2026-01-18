import { useState, useEffect } from 'react';
import api from '../api';

export default function SendNotification() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    body: '',
    image: ''
  });

  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    last_page: 1
  });

  // Fetch users with device tokens
  const fetchUsers = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      let url = `/admin/notifications/users?page=${page}`;
      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setUsers(res.data.data);
        setPagination({
          total: res.data.pagination.total,
          current_page: res.data.pagination.current_page,
          last_page: res.data.pagination.last_page
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search);
  }, [search]);

  // Handle select all
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Handle individual user selection
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        const newSelected = prev.filter(id => id !== userId);
        setSelectAll(newSelected.length === users.length);
        return newSelected;
      } else {
        const newSelected = [...prev, userId];
        setSelectAll(newSelected.length === users.length);
        return newSelected;
      }
    });
  };

  // Send notification
  const handleSend = async (sendToAll = false) => {
    if (!form.title.trim() || !form.body.trim()) {
      alert('Please fill in title and body');
      return;
    }

    if (!sendToAll && selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: form.title,
        body: form.body,
        image: form.image || null
      };

      if (sendToAll) {
        const res = await api.post('/admin/notifications/send-to-all', payload);
        if (res.data.success) {
          alert(`Notification sent successfully! ${res.data.stats.success_count} device(s) received.`);
          setForm({ title: '', body: '', image: '' });
          setSelectedUsers([]);
          setSelectAll(false);
        } else {
          alert(res.data.message || 'Failed to send notification');
        }
      } else {
        payload.user_ids = selectedUsers;
        const res = await api.post('/admin/notifications/send', payload);
        if (res.data.success) {
          alert(`Notification sent successfully! ${res.data.stats.success_count} device(s) received.`);
          setForm({ title: '', body: '', image: '' });
          setSelectedUsers([]);
          setSelectAll(false);
        } else {
          alert(res.data.message || 'Failed to send notification');
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Push Notification</h1>
        <p className="text-gray-600">Send notifications to users via Firebase Cloud Messaging</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Notification title"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Notification message"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">Enter a valid image URL (optional)</p>
          </div>
        </div>
      </div>

      {/* User Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Users</h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleSend(false)}
              disabled={sending || selectedUsers.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {sending ? 'Sending...' : `Send to Selected (${selectedUsers.length})`}
            </button>
            <button
              onClick={() => handleSend(true)}
              disabled={sending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {sending ? 'Sending...' : 'Send to All Users'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search users by name or email..."
          />
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found with device tokens
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Select All ({users.length} users)
              </label>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devices</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.profile_image_url ? (
                              <img
                                src={user.profile_image_url}
                                alt={user.name}
                                className="h-8 w-8 rounded-full mr-2"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {user.device_tokens_count || 0} device(s)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchUsers(pagination.current_page - 1, search)}
                    disabled={pagination.current_page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchUsers(pagination.current_page + 1, search)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
