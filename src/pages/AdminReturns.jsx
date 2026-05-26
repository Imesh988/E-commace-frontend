import { useState, useEffect } from 'react';
import { adminRemark } from '../services/api';
import { 
  RefreshCw, 
  DollarSign, 
  AlertCircle,
  Search,
  Package,
  MessageSquare
} from 'lucide-react';
import SuperAdminNavbar from '../layout/SuperadminNav';

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  
  const [statusForm, setStatusForm] = useState({ 
    status: '', 
    admin_remark: '', 
    refund_amount: '' 
  });
  
  const [refundForm, setRefundForm] = useState({
    refund_amount: ''
  });

  const [tempRefundAmounts, setTempRefundAmounts] = useState({});

  useEffect(() => {
    fetchAllReturns();
  }, []);

  const fetchAllReturns = async () => {
    setLoading(true);
    try {
      const res = await adminRemark.getAllReturns();
      let returnsData = res.data.returns || [];
      // Normalise each return: convert status to number, refund_amount to number
      returnsData = returnsData.map(ret => ({
        ...ret,
        status: Number(ret.status),           // ensure status is a number
        refund_amount: ret.refund_amount ? Number(ret.refund_amount) : null
      }));
      setReturns(returnsData);
    } catch (err) {
      setError('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter(ret => 
    ret.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.order_id?.toString().includes(searchTerm) ||
    ret.return_id?.toString().includes(searchTerm)
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 0: return 'bg-amber-50 text-amber-600 border-amber-100';
      case 1: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 2: return 'bg-rose-50 text-rose-600 border-rose-100';
      case 3: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Pending ';
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
      refund_amount: ret.refund_amount || tempRefundAmounts[ret.return_id] || ''
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
      
      if (parseInt(statusForm.status) === 1 && statusForm.refund_amount) {
        setTempRefundAmounts(prev => ({
          ...prev,
          [selectedReturn.return_id]: statusForm.refund_amount
        }));
      }
      
      setStatusModalOpen(false);
      fetchAllReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const openRefundModal = (ret) => {
    if (ret.status !== 1) return;
    setSelectedReturn(ret);
    const savedAmount = ret.refund_amount || tempRefundAmounts[ret.return_id] || '';
    setRefundForm({ refund_amount: savedAmount });
    setRefundModalOpen(true);
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    const amount = parseFloat(refundForm.refund_amount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await adminRemark.processRefund({
        return_id: selectedReturn.return_id,
        shipping_id: selectedReturn.shipping_id,
        refund_amount: amount,
        status: 1
      });
      setRefundModalOpen(false);
      fetchAllReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Refund failed');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] font-sans text-slate-700">
      <SuperAdminNavbar onLogout={handleLogout} profile={profile} />
      
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by ID, name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 w-full md:w-[350px] bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={18} className="mr-2" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Return ID</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer Information</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Order & Qty</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Return Reason</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Remark</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Refund Amt</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-20 text-center">
                      <RefreshCw className="animate-spin inline text-teal-500 mb-2" size={24} />
                      <p className="text-slate-400 text-sm font-medium">Fetching return records...</p>
                    </td>
                  </tr>
                ) : filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-20 text-center">
                      <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Package className="text-slate-300" size={24} />
                      </div>
                      <p className="text-slate-400 text-sm font-medium">No return requests found match your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((ret) => (
                    <tr key={ret.return_id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">#{ret.return_id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs">
                            {ret.customer_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{ret.customer_name}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{ret.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-slate-700">Order: {ret.order_id}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Quantity: <span className="text-slate-600">{ret.qty}</span></div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-slate-500 leading-relaxed max-w-[180px] line-clamp-2 italic">"{ret.reason}"</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(ret.status)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${ret.status === 1 ? 'bg-emerald-500' : ret.status === 2 ? 'bg-rose-500' : ret.status === 3 ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                          {getStatusText(ret.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-slate-500 max-w-[200px] break-words">
                          {ret.admin_remark ? (
                            <span className="bg-slate-50 px-2 py-1 rounded-lg text-slate-600 italic">{ret.admin_remark}</span>
                          ) : (
                            <span className="text-slate-300 text-[11px] font-medium">— no remark —</span>
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-800">
                          {ret.refund_amount ? `$${parseFloat(ret.refund_amount).toLocaleString()}` : 
                           (tempRefundAmounts[ret.return_id] ? `$${parseFloat(tempRefundAmounts[ret.return_id]).toLocaleString()}` : '-')}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            onClick={() => openStatusModal(ret)}
                            className="p-2 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-xl transition-all text-slate-400 hover:text-teal-500"
                            title="Update Status"
                          >
                            <MessageSquare size={18} />
                          </button>
                          {ret.status === 1 && (
                            <button 
                              onClick={() => openRefundModal(ret)}
                              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-200"
                            >
                              <DollarSign size={14} /> Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Update Return Status */}
        {statusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
              <div className="p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Return Status</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">Update request for <span className="text-slate-900 font-bold">#{selectedReturn?.return_id}</span></p>
                
                <form onSubmit={handleStatusChange} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">New Status</label>
                    <select 
                      value={statusForm.status} 
                      onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-semibold text-slate-700"
                    >
                      <option value="0">Pending Review</option>
                      <option value="1">Approved</option>
                      <option value="2">Rejected</option>
                      <option value="3">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Admin Remark</label>
                    <textarea 
                      value={statusForm.admin_remark} 
                      onChange={(e) => setStatusForm({ ...statusForm, admin_remark: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-medium text-slate-700 min-h-[120px] resize-none"
                      placeholder="Write internal note or feedback for customer..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setStatusModalOpen(false)} 
                      className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-colors text-sm"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-teal-200 transition-all transform active:scale-[0.98] text-sm"
                    >
                      Update Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Process Refund */}
        {refundModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-10">
                <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mb-6 text-emerald-500">
                  <DollarSign size={32} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Issue Refund</h2>
                <p className="text-slate-400 text-sm mb-10 font-medium">Processing payment for return <span className="text-slate-900 font-bold">#{selectedReturn?.return_id}</span></p>
                
                <form onSubmit={handleRefund} className="space-y-8">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Refund Amount (USD)</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-300">$</div>
                      <input
                        type="number"
                        step="0.01"
                        value={refundForm.refund_amount}
                        onChange={(e) => setRefundForm({ refund_amount: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl pl-12 pr-6 py-5 text-3xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder:text-slate-200"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setRefundModalOpen(false)} 
                      className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-colors text-sm"
                    >
                      Go Back
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200 transition-all transform active:scale-[0.98] text-sm"
                    >
                      Pay Now
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReturns;