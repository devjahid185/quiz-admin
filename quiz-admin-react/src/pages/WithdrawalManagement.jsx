import { useEffect, useState } from 'react';
import api, { ensureCsrf } from '../api';

export default function WithdrawalManagement() {
  const [requests, setRequests] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    payment_method: '',
    date_from: '',
    date_to: '',
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.payment_method) params.append('payment_method', filters.payment_method);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    api.get(`/admin/withdrawal/requests?${params.toString()}`)
      .then(res => {
        if (res.data.success) {
          setRequests(res.data.data || []);
          setStatistics(res.data.statistics || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleViewDetails = (request) => {
    api.get(`/admin/withdrawal/request/${request.id}`)
      .then(res => {
        if (res.data.success) {
          setSelectedRequest(res.data.data);
          setShowDetailsModal(true);
          setAdminNotes(res.data.data.admin_notes || '');
        }
      })
      .catch(() => {});
  };

  const handleApprove = async (id) => {
    if (!confirm('Are you sure you want to approve this withdrawal request?')) return;

    setActionLoading(true);
    try {
      await ensureCsrf();
      const res = await api.post(`/admin/withdrawal/request/${id}/approve`, {
        admin_notes: adminNotes,
      });
      if (res.data.success) {
        fetchRequests();
        setShowDetailsModal(false);
        alert('Withdrawal request approved successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    if (!confirm('Are you sure you want to reject this withdrawal request? Amount will be refunded to user.')) return;

    setActionLoading(true);
    try {
      await ensureCsrf();
      const res = await api.post(`/admin/withdrawal/request/${id}/reject`, {
        admin_notes: adminNotes,
      });
      if (res.data.success) {
        fetchRequests();
        setShowDetailsModal(false);
        alert('Withdrawal request rejected and amount refunded');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('Mark this withdrawal as completed?')) return;

    setActionLoading(true);
    try {
      await ensureCsrf();
      const res = await api.post(`/admin/withdrawal/request/${id}/complete`, {
        admin_notes: adminNotes,
      });
      if (res.data.success) {
        fetchRequests();
        setShowDetailsModal(false);
        alert('Withdrawal marked as completed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${colors[status] || colors.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methods = {
      bkash: 'bg-green-100 text-green-700',
      nagad: 'bg-blue-100 text-blue-700',
      rocket: 'bg-purple-100 text-purple-700',
      bank: 'bg-indigo-100 text-indigo-700',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${methods[method] || 'bg-gray-100 text-gray-700'}`}>
        {method.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Withdrawal Management</h1>
        <p className="mt-2 text-sm text-slate-500">Manage user withdrawal requests</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow p-6 border border-yellow-200">
            <div className="text-sm font-medium text-yellow-700">Pending</div>
            <div className="text-2xl font-bold text-yellow-900 mt-2">{statistics.pending || 0}</div>
            <div className="text-xs text-yellow-600 mt-1">৳{parseFloat(statistics.total_amount_pending || 0).toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 border border-blue-200">
            <div className="text-sm font-medium text-blue-700">Processing</div>
            <div className="text-2xl font-bold text-blue-900 mt-2">{statistics.processing || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow p-6 border border-green-200">
            <div className="text-sm font-medium text-green-700">Completed</div>
            <div className="text-2xl font-bold text-green-900 mt-2">{statistics.completed || 0}</div>
            <div className="text-xs text-green-600 mt-1">৳{parseFloat(statistics.total_amount_completed || 0).toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow p-6 border border-red-200">
            <div className="text-sm font-medium text-red-700">Rejected</div>
            <div className="text-2xl font-bold text-red-900 mt-2">{statistics.rejected || 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={filters.payment_method}
              onChange={e => setFilters({ ...filters, payment_method: e.target.value })}
            >
              <option value="">All Methods</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={filters.date_from}
              onChange={e => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={filters.date_to}
              onChange={e => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading requests...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Withdrawal Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Fee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Net Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Payment Method</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      No withdrawal requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">#{req.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{req.user?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{req.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ৳{parseFloat(req.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ৳{parseFloat(req.fee).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ৳{parseFloat(req.net_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentMethodBadge(req.payment_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetails(req)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Withdrawal Request Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Request ID</label>
                  <div className="text-lg font-semibold">#{selectedRequest.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">User</label>
                  <div className="font-semibold">{selectedRequest.user?.name}</div>
                  <div className="text-sm text-gray-500">{selectedRequest.user?.email}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <div className="text-lg font-semibold text-gray-900">৳{parseFloat(selectedRequest.amount).toFixed(2)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fee</label>
                  <div className="text-gray-600">৳{parseFloat(selectedRequest.fee).toFixed(2)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Net Amount</label>
                  <div className="text-lg font-semibold text-green-600">৳{parseFloat(selectedRequest.net_amount).toFixed(2)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Method</label>
                  <div>{getPaymentMethodBadge(selectedRequest.payment_method)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Account Number</label>
                  <div className="font-semibold">{selectedRequest.account_number}</div>
                </div>
                {selectedRequest.account_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Name</label>
                    <div>{selectedRequest.account_name}</div>
                  </div>
                )}
                {selectedRequest.bank_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bank Name</label>
                    <div>{selectedRequest.bank_name}</div>
                  </div>
                )}
                {selectedRequest.branch_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Branch Name</label>
                    <div>{selectedRequest.branch_name}</div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Request Date</label>
                  <div>{new Date(selectedRequest.created_at).toLocaleString()}</div>
                </div>
                {selectedRequest.processed_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Processed Date</label>
                    <div>{new Date(selectedRequest.processed_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">User Notes</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedRequest.notes}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Admin Notes</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows="3"
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes..."
                />
              </div>
              {selectedRequest.processed_by && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Processed By</label>
                  <div>{selectedRequest.processedBy?.name || 'N/A'}</div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
              {selectedRequest.status === 'approved' && (
                <button
                  onClick={() => handleComplete(selectedRequest.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  Mark as Completed
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
