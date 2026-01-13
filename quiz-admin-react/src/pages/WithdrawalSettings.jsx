import { useEffect, useState } from 'react';
import api, { ensureCsrf } from '../api';

export default function WithdrawalSettings() {
  const [settings, setSettings] = useState([]);
  const [activeSetting, setActiveSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    minimum_amount: 100.00,
    maximum_amount: 50000.00,
    fee_percentage: 2.50,
    fee_fixed: 5.00,
    processing_days: 1,
    description: '',
    payment_methods: ['bkash', 'nagad', 'rocket', 'bank'],
    is_active: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchActiveSetting();
  }, []);

  const fetchSettings = () => {
    setLoading(true);
    api.get('/admin/withdrawal/settings')
      .then(res => {
        if (res.data.success) {
          setSettings(res.data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchActiveSetting = () => {
    api.get('/admin/withdrawal/settings/active')
      .then(res => {
        if (res.data.success) {
          setActiveSetting(res.data.data);
        }
      })
      .catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate maximum > minimum
    if (formData.maximum_amount && formData.maximum_amount <= formData.minimum_amount) {
      setError('Maximum amount must be greater than minimum amount');
      return;
    }

    try {
      await ensureCsrf();
      
      if (editing) {
        const res = await api.put(`/admin/withdrawal/settings/${editing.id}`, formData);
        if (res.data.success) {
          fetchSettings();
          fetchActiveSetting();
          resetForm();
        }
      } else {
        const res = await api.post('/admin/withdrawal/settings', formData);
        if (res.data.success) {
          fetchSettings();
          fetchActiveSetting();
          resetForm();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || (editing ? 'Failed to update setting' : 'Failed to create setting'));
    }
  };

  const handleEdit = (setting) => {
    setEditing(setting);
    setFormData({
      minimum_amount: parseFloat(setting.minimum_amount),
      maximum_amount: setting.maximum_amount ? parseFloat(setting.maximum_amount) : null,
      fee_percentage: parseFloat(setting.fee_percentage),
      fee_fixed: parseFloat(setting.fee_fixed),
      processing_days: setting.processing_days,
      description: setting.description || '',
      payment_methods: setting.payment_methods || [],
      is_active: setting.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;

    try {
      await ensureCsrf();
      const res = await api.delete(`/admin/withdrawal/settings/${id}`);
      if (res.data.success) {
        fetchSettings();
        fetchActiveSetting();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete setting');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await ensureCsrf();
      const res = await api.post(`/admin/withdrawal/settings/${id}/toggle-active`);
      if (res.data.success) {
        fetchSettings();
        fetchActiveSetting();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle setting');
    }
  };

  const togglePaymentMethod = (method) => {
    const methods = formData.payment_methods || [];
    if (methods.includes(method)) {
      setFormData({ ...formData, payment_methods: methods.filter(m => m !== method) });
    } else {
      setFormData({ ...formData, payment_methods: [...methods, method] });
    }
  };

  const resetForm = () => {
    setFormData({
      minimum_amount: 100.00,
      maximum_amount: 50000.00,
      fee_percentage: 2.50,
      fee_fixed: 5.00,
      processing_days: 1,
      description: '',
      payment_methods: ['bkash', 'nagad', 'rocket', 'bank'],
      is_active: false,
    });
    setEditing(null);
    setShowForm(false);
    setError('');
  };

  const calculateFeeExample = (amount) => {
    if (amount <= 0) return { fee: 0, net: 0 };
    const percentageFee = (amount * formData.fee_percentage) / 100;
    const fee = percentageFee + formData.fee_fixed;
    const net = amount - fee;
    return { fee: fee.toFixed(2), net: net.toFixed(2) };
  };

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Withdrawal Settings</h1>
          <p className="mt-2 text-sm text-slate-500">Manage withdrawal rules and fees</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          {showForm ? 'Cancel' : '+ Add New Setting'}
        </button>
      </div>

      {/* Active Setting Card */}
      {activeSetting && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 mb-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">ACTIVE</span>
                <span className="text-sm text-green-700 font-medium">Current Withdrawal Settings</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-xs text-green-600">Min Amount</div>
                  <div className="text-lg font-bold text-green-900">৳{parseFloat(activeSetting.minimum_amount).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-green-600">Max Amount</div>
                  <div className="text-lg font-bold text-green-900">
                    {activeSetting.maximum_amount ? `৳${parseFloat(activeSetting.maximum_amount).toFixed(2)}` : 'Unlimited'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-600">Fee</div>
                  <div className="text-lg font-bold text-green-900">
                    {activeSetting.fee_percentage}% + ৳{parseFloat(activeSetting.fee_fixed).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-600">Processing</div>
                  <div className="text-lg font-bold text-green-900">{activeSetting.processing_days} day(s)</div>
                </div>
              </div>
              {activeSetting.payment_methods && activeSetting.payment_methods.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-green-600 mb-1">Payment Methods</div>
                  <div className="flex gap-2 flex-wrap">
                    {activeSetting.payment_methods.map(method => (
                      <span key={method} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                        {method.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">
            {editing ? 'Edit Withdrawal Setting' : 'Create New Withdrawal Setting'}
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.minimum_amount}
                  onChange={e => setFormData({ ...formData, minimum_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Amount (৳) (Leave empty for unlimited)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.maximum_amount || ''}
                  onChange={e => setFormData({ ...formData, maximum_amount: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fee Percentage (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.fee_percentage}
                  onChange={e => setFormData({ ...formData, fee_percentage: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fixed Fee (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.fee_fixed}
                  onChange={e => setFormData({ ...formData, fee_fixed: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Processing Days *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.processing_days}
                  onChange={e => setFormData({ ...formData, processing_days: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Standard withdrawal settings"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Methods *
                </label>
                <div className="flex gap-3 flex-wrap">
                  {['bkash', 'nagad', 'rocket', 'bank'].map(method => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.payment_methods?.includes(method)}
                        onChange={() => togglePaymentMethod(method)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{method.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="text-sm font-semibold text-gray-700">Set as Active (will deactivate others)</span>
                </label>
              </div>
            </div>

            {formData.minimum_amount > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-900">
                  <strong>Fee Calculation Example:</strong> For ৳{formData.minimum_amount.toFixed(2)} withdrawal
                  <br />
                  <span className="text-xs">
                    Fee: ৳{calculateFeeExample(formData.minimum_amount).fee} | Net Amount: ৳{calculateFeeExample(formData.minimum_amount).net}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                {editing ? 'Update Setting' : 'Create Setting'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settings List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading settings...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Withdrawal Settings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Amount Range</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Fee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Processing</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Payment Methods</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Created</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No withdrawal settings found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  settings.map((setting) => (
                    <tr key={setting.id} className={`hover:bg-gray-50 ${setting.is_active ? 'bg-green-50/30' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {setting.is_active ? (
                          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ৳{parseFloat(setting.minimum_amount).toFixed(2)} - {setting.maximum_amount ? `৳${parseFloat(setting.maximum_amount).toFixed(2)}` : 'Unlimited'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {setting.fee_percentage}% + ৳{parseFloat(setting.fee_fixed).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{setting.processing_days} day(s)</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {setting.payment_methods?.map(method => (
                            <span key={method} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              {method}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(setting.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleActive(setting.id)}
                            className={`px-3 py-1 text-xs rounded-lg font-medium ${
                              setting.is_active
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {setting.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleEdit(setting)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(setting.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
