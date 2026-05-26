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
  <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-all duration-300">
    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Return Order</h2>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Order ID</label>
                <input
                    type="text"
                    value={orderId}
                    disabled
                    className="w-full border border-slate-100 rounded-xl p-3 bg-slate-50 text-slate-500 font-bold outline-none"
                />
            </div>
            <div className="mb-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Shipping ID</label>
                <input
                    type="text"
                    value={shippingId}
                    disabled
                    className="w-full border border-slate-100 rounded-xl p-3 bg-slate-50 text-slate-500 font-bold outline-none"
                />
            </div>
            <div className="mb-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quantity to Return</label>
                <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium"
                />
            </div>
            <div className="mb-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reason for Return</label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows="3"
                    className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium"
                    placeholder="Tell us why you want to return this item..."
                />
            </div>
            <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Evidence Image URL (Optional)</label>
                <input
                    type="text"
                    value={evidenceImg}
                    onChange={(e) => setEvidenceImg(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium"
                    placeholder="https://image-url.com/photo.jpg"
                />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Return'}
                </button>
            </div>
        </form>
    </div>
</div>
  );
};

export default ReturnModal;