import { useEffect, useState } from 'react';
import api, { ensureCsrf } from '../api';

export default function CoinConversionSettings() {
  const [settings, setSettings] = useState([]);
  const [activeSetting, setActiveSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    coins_required: 100,
    main_balance_amount: 10.00,
    minimum_coins: 100,
    description: '',
    is_active: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchActiveSetting();
  }, []);

  const fetchSettings = () => {
    setLoading(true);
    api.get('/admin/coin-conversion')
      .then(res => {
        if (res.data.success) {
          setSettings(res.data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchActiveSetting = () => {
    api.get('/admin/coin-conversion/active')
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

    try {
      await ensureCsrf();
      
      if (editing) {
        const res = await api.put(`/admin/coin-conversion/${editing.id}`, formData);
        if (res.data.success) {
          fetchSettings();
          fetchActiveSetting();
          resetForm();
        }
      } else {
        const res = await api.post('/admin/coin-conversion', formData);
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
      coins_required: setting.coins_required,
      main_balance_amount: parseFloat(setting.main_balance_amount),
      minimum_coins: setting.minimum_coins,
      description: setting.description || '',
      is_active: setting.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;

    try {
      await ensureCsrf();
      const res = await api.delete(`/admin/coin-conversion/${id}`);
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
      const res = await api.post(`/admin/coin-conversion/${id}/toggle-active`);
      if (res.data.success) {
        fetchSettings();
        fetchActiveSetting();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle setting');
    }
  };

  const resetForm = () => {
    setFormData({
      coins_required: 100,
      main_balance_amount: 10.00,
      minimum_coins: 100,
      description: '',
      is_active: false,
    });
    setEditing(null);
    setShowForm(false);
    setError('');
  };

  const calculateRate = (coins, amount) => {
    if (amount > 0) {
      return (coins / amount).toFixed(2);
    }
    return '0.00';
  };

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Coin Conversion Settings</h1>
          <p className="mt-2 text-sm text-slate-500">Manage coin to main balance conversion rates</p>
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
                <span className="text-sm text-green-700 font-medium">Current Conversion Rate</span>
              </div>
              <h2 className="text-2xl font-bold text-green-900">
                {activeSetting.coins_required} Coins = ৳{parseFloat(activeSetting.main_balance_amount).toFixed(2)}
              </h2>
              <p className="text-sm text-green-700 mt-1">
                Rate: {calculateRate(activeSetting.coins_required, activeSetting.main_balance_amount)} coins per taka
              </p>
              {activeSetting.description && (
                <p className="text-sm text-green-600 mt-2">{activeSetting.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600">Minimum Coins</div>
              <div className="text-2xl font-bold text-green-900">{activeSetting.minimum_coins}</div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">
            {editing ? 'Edit Conversion Setting' : 'Create New Conversion Setting'}
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
                  Coins Required *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.coins_required}
                  onChange={e => setFormData({ ...formData, coins_required: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500 mt-1">How many coins needed for conversion</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Main Balance Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.main_balance_amount}
                  onChange={e => setFormData({ ...formData, main_balance_amount: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500 mt-1">Amount in taka (BDT)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Coins *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={formData.minimum_coins}
                  onChange={e => setFormData({ ...formData, minimum_coins: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum coins required to convert</p>
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
                  placeholder="e.g., 100 coins = 10 taka"
                />
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

            {formData.coins_required > 0 && formData.main_balance_amount > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-900">
                  <strong>Preview:</strong> {formData.coins_required} Coins = ৳{formData.main_balance_amount.toFixed(2)}
                  <br />
                  <span className="text-xs">Rate: {calculateRate(formData.coins_required, formData.main_balance_amount)} coins per taka</span>
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
            <h2 className="text-lg font-semibold text-gray-900">All Conversion Settings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Conversion Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Minimum Coins</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Created</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No conversion settings found. Create one to get started.
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
                          {setting.coins_required} Coins = ৳{parseFloat(setting.main_balance_amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {calculateRate(setting.coins_required, setting.main_balance_amount)} coins/taka
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{setting.minimum_coins}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{setting.description || '-'}</div>
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
