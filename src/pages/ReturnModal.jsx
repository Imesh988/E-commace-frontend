import React, { useState } from 'react';
import { returnApi } from '../services/api';
import { toast } from 'react-toastify';

const ReturnModal = ({ orderId, shippingId, onClose, onSuccess }) => {
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('');
  const [evidenceImg, setEvidenceImg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await returnApi.createReturn({
        order_id: orderId,
        shipping_id: shippingId,
        qty,
        reason,
        evidence_img: evidenceImg
      });
      toast.success('Return request submitted successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Return Order</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-700">Order ID</label>
            <input
              type="text"
              value={orderId}
              disabled
              className="w-full border rounded-xl p-2 bg-gray-100"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-700">Shipping ID</label>
            <input
              type="text"
              value={shippingId}
              disabled
              className="w-full border rounded-xl p-2 bg-gray-100"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-700">Quantity</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
              className="w-full border rounded-xl p-2"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-700">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows="3"
              className="w-full border rounded-xl p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">Evidence Image URL (optional)</label>
            <input
              type="text"
              value={evidenceImg}
              onChange={(e) => setEvidenceImg(e.target.value)}
              className="w-full border rounded-xl p-2"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnModal;