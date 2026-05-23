import React, { useState, useEffect } from 'react';
import { returnApi } from '../services/api';
import { toast } from 'react-toastify';

const CustomerReturns = () => {
  const [myReturns, setMyReturns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyReturns();
  }, []);

  const fetchMyReturns = async () => {
    setLoading(true);
    try {
      const res = await returnApi.getMyReturns();
      setMyReturns(res.data.returns || []);
    } catch (err) {
      toast.error('Failed to load your returns');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      0: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
      1: { label: 'Approved', color: 'bg-green-100 text-green-700' },
      2: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
      3: { label: 'Refunded', color: 'bg-blue-100 text-blue-700' }
    };
    const { label, color } = config[status] || config[0];
    return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{label}</span>;
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Return Requests</h1>
      {myReturns.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-dashed">
          <p className="text-gray-500">You haven't submitted any return requests yet.</p>
          <p className="text-sm text-gray-400 mt-2">Go to <strong>My Orders</strong> and click "Return Order" on delivered items.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl overflow-hidden shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Return ID</th>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Qty</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Admin Remark</th>
                <th className="p-3 text-left">Refund Amount</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {myReturns.map((ret) => (
                <tr key={ret.return_id} className="border-t">
                  <td className="p-3 font-mono text-sm">{ret.return_id}</td>
                  <td className="p-3">{ret.order_id}</td>
                  <td className="p-3">{ret.qty}</td>
                  <td className="p-3">{ret.reason}</td>
                  <td className="p-3">{getStatusBadge(ret.status)}</td>
                  <td className="p-3">{ret.admin_remark || '—'}</td>
                  <td className="p-3">{ret.refund_amount ? `LKR ${ret.refund_amount}` : '—'}</td>
                  <td className="p-3">{new Date(ret.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerReturns;