import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Eye, Search, CheckCircle, XCircle, Loader2, ImageOff, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const ManagePayments = () => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, paymentId: null });

  const location = useLocation();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const statusQ = statusFilter !== '' ? `&status=${statusFilter}` : '';
      const res = await fetch(`${API_BASE}/payments?limit=200${statusQ}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPayments(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    if (statusParam === 'pending') setStatusFilter('0');
  }, [location]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const updateStatus = async (paymentId, newStatus) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setIsViewOpen(false);
        fetchPayments();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, type: null, paymentId: null });
    }
  };

  const handleConfirmAction = () => {
    const { type, paymentId } = confirmModal;
    if (type === 'approve') updateStatus(paymentId, 1);
    else if (type === 'reject') updateStatus(paymentId, 2);
  };

  const getStatusText = (s) => ({ 0: 'Pending', 1: 'Approved', 2: 'Rejected' }[s] ?? 'Unknown');
  const getStatusColor = (s) => ({
    0: 'bg-yellow-100 text-yellow-700',
    1: 'bg-green-100 text-green-700',
    2: 'bg-red-100 text-red-700'
  }[s] ?? 'bg-gray-100 text-gray-600');

  const getSlipUrl = (slipPath) => {
    if (!slipPath) return null;
    if (slipPath.startsWith('http')) return slipPath;
    return `http://localhost:5000${slipPath}`;
  };

  const getQrUrl = (qrRef) => {
    if (!qrRef) return null;
    if (qrRef.startsWith('http')) return qrRef;
    return qrRef;
  };

  const filteredPayments = payments.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      p.payment_id?.toString().includes(q) ||
      p.username?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      getStatusText(p.status).toLowerCase().includes(q)
    );
  });

  const pendingCount = payments.filter(p => p.status === 0).length;

  return (
    <Layout pageTitle="Manage Payments" pageDescription="Review payment slips and approve or reject transactions.">
      {/* Summary Badges */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending', count: payments.filter(p => p.status === 0).length, color: 'bg-yellow-50 border-yellow-100 text-yellow-700', filter: '0' },
          { label: 'Approved', count: payments.filter(p => p.status === 1).length, color: 'bg-green-50 border-green-100 text-green-700', filter: '1' },
          { label: 'Rejected', count: payments.filter(p => p.status === 2).length, color: 'bg-red-50 border-red-100 text-red-700', filter: '2' },
        ].map(({ label, count, color, filter }) => (
          <button
            key={label}
            onClick={() => setStatusFilter(statusFilter === filter ? '' : filter)}
            className={`p-4 rounded-2xl border font-bold text-left transition-all hover:shadow-md ${color} ${statusFilter === filter ? 'ring-2 ring-offset-1 ring-current' : ''}`}
          >
            <p className="text-3xl font-black">{count}</p>
            <p className="text-sm mt-1">{label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none text-sm"
            />
          </div>
          <button onClick={fetchPayments} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span className="text-sm">Loading payments...</span>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Slip</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((pay) => (
                  <tr key={pay.payment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-700">#{pay.payment_id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{pay.username}</p>
                      <p className="text-xs text-gray-400">{pay.email}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-figma-blue">฿{parseFloat(pay.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {pay.payment_date ? new Date(pay.payment_date).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {pay.slip_id ? (
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">✓ Attached</span>
                      ) : (
                        <span className="text-xs text-gray-400">No slip</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(pay.status)}`}>
                        {getStatusText(pay.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setSelectedPayment(pay); setIsViewOpen(true); }}
                          className="p-2 text-figma-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {pay.status === 0 && (
                          <>
                            <button
                              onClick={() => setConfirmModal({ open: true, type: 'approve', paymentId: pay.payment_id })}
                              className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => setConfirmModal({ open: true, type: 'reject', paymentId: pay.payment_id })}
                              className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Detail Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Payment Detail">
        {selectedPayment && (
          <div className="space-y-5">
            {/* Status Banner */}
            <div className={`p-3 rounded-xl text-center font-bold text-sm ${getStatusColor(selectedPayment.status)}`}>
              {getStatusText(selectedPayment.status)}
            </div>

            {/* Slip Image */}
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Transfer Slip</p>
              {selectedPayment.slip_id ? (
                <SlipImage slipId={selectedPayment.slip_id} getSlipUrl={getSlipUrl} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                  <ImageOff size={32} className="mb-2" />
                  <p className="text-sm">No slip attached</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              {[
                { label: 'Payment ID', value: `#${selectedPayment.payment_id}` },
                { label: 'Customer', value: `${selectedPayment.username} (${selectedPayment.email})` },
                { label: 'Amount', value: `฿${parseFloat(selectedPayment.amount).toFixed(2)}` },
                { label: 'Payment Date', value: selectedPayment.payment_date ? new Date(selectedPayment.payment_date).toLocaleString() : '-' },
                { label: 'Completed At', value: selectedPayment.completed_at ? new Date(selectedPayment.completed_at).toLocaleString() : '-' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-800 text-right max-w-[200px]">{value}</span>
                </div>
              ))}
            </div>

            {selectedPayment.qr_ref && (
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Payment QR</p>
                <a href={getQrUrl(selectedPayment.qr_ref)} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={getQrUrl(selectedPayment.qr_ref)}
                    alt="Payment QR"
                    className="max-h-48 mx-auto object-contain rounded-xl border border-gray-100 bg-gray-50"
                  />
                </a>
              </div>
            )}

            {/* Action Buttons (only for pending) */}
            {selectedPayment.status === 0 && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal({ open: true, type: 'approve', paymentId: selectedPayment.payment_id })}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={18} /> Approve
                </button>
                <button
                  onClick={() => setConfirmModal({ open: true, type: 'reject', paymentId: selectedPayment.payment_id })}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsViewOpen(false)} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null, paymentId: null })}
        onConfirm={handleConfirmAction}
        title={confirmModal.type === 'approve' ? 'Approve Payment' : 'Reject Payment'}
        confirmLabel={confirmModal.type === 'approve' ? 'Approve' : 'Reject'}
        confirmColor={confirmModal.type === 'approve' ? 'green' : 'red'}
        message={
          confirmModal.type === 'approve'
            ? "Are you sure you want to approve this payment? Movies will be added to the user's library immediately."
            : 'Are you sure you want to reject this payment? The cart will remain intact.'
        }
      />
    </Layout>
  );
};

// Sub-component to fetch and show slip image
const SlipImage = ({ slipId, getSlipUrl }) => {
  const [slipPath, setSlipPath] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const getSlipData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/checkout/slip/${slipId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setSlipPath(data.data.slip_image);
      } catch {}
    };
    if (slipId) getSlipData();
  }, [slipId]);

  if (!slipPath) return (
    <div className="flex items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
      <Loader2 size={24} className="animate-spin mr-2" />
      <span className="text-sm">Loading slip...</span>
    </div>
  );

  if (imgError) return (
    <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
      <ImageOff size={32} className="mb-2" />
      <p className="text-sm">Cannot load slip image</p>
    </div>
  );

  return (
    <a href={getSlipUrl(slipPath)} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={getSlipUrl(slipPath)}
        alt="Transfer Slip"
        onError={() => setImgError(true)}
        className="w-full max-h-72 object-contain rounded-2xl border border-gray-100 bg-gray-50 hover:opacity-90 transition-opacity cursor-zoom-in"
      />
      <p className="text-center text-xs text-gray-400 mt-2">Click to view full size</p>
    </a>
  );
};

export default ManagePayments;
