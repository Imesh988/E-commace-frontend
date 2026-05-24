import { useState, useEffect } from 'react';
import { adminRemark } from '../services/api';

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  
  // Status form (used when updating status)
  const [statusForm, setStatusForm] = useState({ 
    status: '', 
    admin_remark: '', 
    refund_amount: '' 
  });
  
  // Refund form (used when processing refund)
  const [refundForm, setRefundForm] = useState({
   
    refund_amount: ''
  });

  // Store refund amount temporarily for each return (when approved)
  const [tempRefundAmounts, setTempRefundAmounts] = useState({});

  useEffect(() => {
    fetchAllReturns();
  }, []);

  const fetchAllReturns = async () => {
    setLoading(true);
    try {
      const res = await adminRemark.getAllReturns();
      console.log('return data ', res.data);
      setReturns(res.data.returns || []);
    } catch (err) {
      setError('Failed to load returns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      case 3: return 'Refunded';
      default: return 'Unknown';
    }
  };

  const openStatusModal = (ret) => {
    setSelectedReturn(ret);
    setStatusForm({
      status: ret.status.toString(),
      admin_remark: ret.admin_remark || '',
      refund_amount: tempRefundAmounts[ret.return_id] || ''
    });
    setStatusModalOpen(true);
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      await adminRemark.updateReturnStatus(
        selectedReturn.return_id,
        parseInt(statusForm.status),
        statusForm.admin_remark
      );
      
      // If status is Approved (1), store the refund amount temporarily
      if (parseInt(statusForm.status) === 1 && statusForm.refund_amount) {
        setTempRefundAmounts(prev => ({
          ...prev,
          [selectedReturn.return_id]: statusForm.refund_amount
        }));
      }
      
      alert('Status updated successfully');
      setStatusModalOpen(false);
      fetchAllReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const openRefundModal = (ret) => {
  if (ret.status !== 1) {
    alert('Only approved returns can be refunded');
    return;
  }
  setSelectedReturn(ret);
  const savedAmount = tempRefundAmounts[ret.return_id] || '';
  setRefundForm({ refund_amount: savedAmount });
  setRefundModalOpen(true);
};

const handleRefund = async (e) => {
  e.preventDefault();
  // Validate refund amount
  const amount = parseFloat(refundForm.refund_amount);
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid refund amount');
    return;
  }

  try {
    console.log('Sending refund:', {
      return_id: selectedReturn.return_id,
      shipping_id: selectedReturn.shipping_id,
      refund_amount: amount,
      status: 1
    });

    await adminRemark.processRefund({
      return_id: selectedReturn.return_id,
      shipping_id: selectedReturn.shipping_id,
      refund_amount: amount,
      status: 1
    });
    alert('Refund processed successfully');
    setRefundModalOpen(false);
    fetchAllReturns();
  } catch (err) {
    console.error('Refund error:', err);
    alert(err.response?.data?.message || 'Refund failed');
  }
};

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin - Return Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && returns.length === 0 && <p>No returns found.</p>}
      {!loading && returns.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Return ID</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Order ID</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Reason</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Admin Remark</th>
                <th className="border p-2">Refund Amt</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret) => (
                <tr key={ret.return_id}>
                  <td className="border p-2">{ret.return_id}</td>
                  <td className="border p-2">{ret.customer_name} ({ret.email})</td>
                  <td className="border p-2">{ret.order_id}</td>
                  <td className="border p-2">{ret.qty}</td>
                  <td className="border p-2">{ret.reason}</td>
                  <td className="border p-2">{getStatusText(ret.status)}</td>
                  <td className="border p-2">{ret.admin_remark || '-'}</td>
                  <td className="border p-2">{tempRefundAmounts[ret.return_id] || '-'}</td>
                  <td className="border p-2 space-x-2">
                    <button onClick={() => openStatusModal(ret)} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">
                      Update Status
                    </button>
                    {ret.status === 1 && (
                      <button onClick={() => openRefundModal(ret)} className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                        Process Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Update Status */}
      {statusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Update Return Status</h2>
            <form onSubmit={handleStatusChange}>
              <div className="mb-3">
                <label className="block text-sm">Status</label>
                <select 
                  value={statusForm.status} 
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} 
                  className="border p-2 w-full rounded" required
                >
                  <option value="0">Pending</option>
                  <option value="1">Approved</option>
                  <option value="2">Rejected</option>
                  <option value="3">Refunded</option>
                </select>
              </div>

           

              <div className="mb-3">
                <label className="block text-sm">Admin Remark</label>
                <textarea 
                  value={statusForm.admin_remark} 
                  onChange={(e) => setStatusForm({ ...statusForm, admin_remark: e.target.value })} 
                  className="border p-2 w-full rounded" rows="2" 
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setStatusModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Process Refund */}
    {refundModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded w-96">
      <h2 className="text-xl font-bold mb-4">
        Process Refund for {selectedReturn?.return_id}
      </h2>
      <form onSubmit={handleRefund}>
        {/* refund_amount only */}
        <div className="mb-3">
          <label className="block text-sm">Refund Amount</label>
          <input
            type="number"
            step="0.01"
            value={refundForm.refund_amount}
            onChange={(e) => setRefundForm({ refund_amount: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setRefundModalOpen(false)}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Confirm Refund
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminReturns;