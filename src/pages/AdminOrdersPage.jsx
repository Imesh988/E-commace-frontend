import React, { useState, useEffect } from 'react';
import { adminRemark, orderApi } from '../services/api';
import { toast } from 'react-toastify';
import { Package, Truck, User, Search, Calendar, DollarSign, Hash, ShoppingBag, Eye, X, MapPin, Phone, Edit3, Save } from 'lucide-react';
import SuperAdminNavbar from '../layout/SuperadminNav';


const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editingTracking, setEditingTracking] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAllOrders();
      const ordersArray = res.data?.data || res.data?.orders || [];
      const normalised = ordersArray.map(order => ({
        ...order,
        status: Number(order.status),
        tracking_no: order.tracking_no || ''
      }));
      console.log('Normalised orders count:', normalised.length);
      setOrders(normalised);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success(`Order status updated to ${getStatusLabel(newStatus)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderApi.cancelOrder(orderId);
      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId ? { ...order, status: 5 } : order
        )
      );
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 5 });
      }
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    }
  };

  const updateTrackingNumber = async (orderId, trackingNo) => {
    try {

      console.log('updateTrackingNumber called with:', orderId, trackingNo);
      
      await adminRemark.updateTrackingNumber(orderId, trackingNo);
      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId ? { ...order, tracking_no: trackingNo } : order
        )
      );
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder({ ...selectedOrder, tracking_no: trackingNo });
      }
      toast.success('Tracking number updated');
      setEditingTracking(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update tracking number');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Processing';
      case 3: return 'Shipped';
      case 4: return 'Delivered';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      1: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
      2: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
      3: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
      4: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
      5: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' }
    };
    const c = config[status] || config[1];
    return `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`;
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_no || '');
    setEditingTracking(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setEditingTracking(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const filteredOrders = orders
    .filter(order => {
      const status = Number(order.status);
      if (activeTab === 'all') return true;
      if (activeTab === 'pending') return status === 1;
      if (activeTab === 'processing') return status === 2;
      if (activeTab === 'shipped') return status === 3;
      if (activeTab === 'delivered') return status === 4;
      if (activeTab === 'cancelled') return status === 5;
      return true;
    })
    .filter(order => {
      if (!searchTerm) return true;
      const userName = order.first_name || '';
      const lastName = order.last_name || '';
      const userEmail = order.email || '';
      const orderId = order.order_id || '';
      return (
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] to-[#eef2f0] flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-emerald-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-white to-[#eef2f0]">
      <SuperAdminNavbar onLogout={handleLogout} profile={profile} />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10 sticky top-0 z-10 bg-gradient-to-br from-[#f8faf9]/80 via-white/80 to-[#eef2f0]/80 backdrop-blur-md py-3 rounded-2xl">
          <button onClick={() => setActiveTab('all')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${activeTab === 'all' ? 'bg-slate-600 text-white shadow-md scale-105' : 'bg-white/60 text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}>All <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{orders.length}</span></button>
          <button onClick={() => setActiveTab('pending')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${activeTab === 'pending' ? 'bg-amber-600 text-white shadow-md scale-105' : 'bg-white/60 text-gray-600 hover:bg-amber-50 hover:text-amber-700'}`}>Pending <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{orders.filter(o => o.status === 1).length}</span></button>
          <button onClick={() => setActiveTab('processing')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${activeTab === 'processing' ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-white/60 text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}>Processing <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{orders.filter(o => o.status === 2).length}</span></button>
          <button onClick={() => setActiveTab('shipped')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${activeTab === 'shipped' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-white/60 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>Shipped <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{orders.filter(o => o.status === 3).length}</span></button>
          <button onClick={() => setActiveTab('delivered')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${activeTab === 'delivered' ? 'bg-emerald-600 text-white shadow-md scale-105' : 'bg-white/60 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>Delivered <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{orders.filter(o => o.status === 4).length}</span></button>
          <button onClick={() => setActiveTab('cancelled')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${activeTab === 'cancelled' ? 'bg-rose-600 text-white shadow-md scale-105' : 'bg-white/60 text-gray-600 hover:bg-rose-50 hover:text-rose-700'}`}>Cancelled <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{orders.filter(o => o.status === 5).length}</span></button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-16 text-center border border-dashed border-gray-300 shadow-sm">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4"><Package className="w-10 h-10 text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500">Adjust filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {filteredOrders.map((order, idx) => {
              const uniqueKey = order.order_id ? `${order.order_id}-${idx}` : `order-${idx}`;
              return (
                <div key={uniqueKey} className="group bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
                  <div className="relative p-5 pb-3 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/30">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner"><Package className="w-5 h-5" /></div>
                        <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order ID</p><p className="font-mono font-bold text-gray-800 text-sm">#{order.order_id?.slice(-8).toUpperCase() || 'N/A'}</p></div>
                      </div>
                      <span className={getStatusBadge(order.status)}><span className={`w-1.5 h-1.5 rounded-full ${order.status === 1 ? 'bg-amber-500' : order.status === 2 ? 'bg-blue-500' : order.status === 3 ? 'bg-indigo-500' : order.status === 4 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>{getStatusLabel(order.status)}</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-xl"><User className="w-4 h-4 text-gray-500" /></div>
                      <div className="flex-1"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Customer</p><p className="font-semibold text-gray-800">{order.first_name || 'Guest'} {order.last_name || ''}</p><p className="text-xs text-gray-500 break-all">{order.email || 'No email'}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl"><DollarSign className="w-4 h-4 text-emerald-600" /><div><p className="text-[10px] text-gray-400">Total</p><p className="font-black text-gray-800">LKR {parseFloat(order.total_amount).toLocaleString()}</p></div></div>
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl"><Calendar className="w-4 h-4 text-indigo-500" /><div><p className="text-[10px] text-gray-400">Date</p><p className="text-xs font-semibold text-gray-700">{new Date(order.created_at).toLocaleDateString('en-GB')}</p></div></div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {order.status === 2 && <button onClick={() => updateStatus(order.order_id, 3)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"><Truck size={16} /> Ship</button>}
                      {order.status === 3 && <button onClick={() => updateStatus(order.order_id, 4)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"><ShoppingBag size={16} /> Deliver</button>}
                      {order.status === 1 && <button onClick={() => updateStatus(order.order_id, 2)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"><Package size={16} /> Process</button>}
                      {order.status !== 5 && order.status !== 4 && <button onClick={() => cancelOrder(order.order_id)} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm">Cancel</button>}
                      <button onClick={() => openModal(order)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl transition flex items-center justify-center w-11"><Eye size={18} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                <p className="text-xs text-gray-400 font-mono">#{selectedOrder.order_id?.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-xl"><User className="w-4 h-4 text-emerald-600" /></div><div><p className="text-[10px] text-gray-400 uppercase">Customer</p><p className="font-semibold">{selectedOrder.first_name || 'Guest'} {selectedOrder.last_name || ''}</p><p className="text-sm text-gray-500">{selectedOrder.email || 'No email'}</p></div></div>
                  <div className="flex items-center gap-3"><div className="p-2 bg-indigo-100 rounded-xl"><MapPin className="w-4 h-4 text-indigo-600" /></div><div><p className="text-[10px] text-gray-400 uppercase">Shipping Address</p><p className="text-sm text-gray-700">{selectedOrder.recipient_name}<br />{selectedOrder.address_line_1}<br />{selectedOrder.city}, {selectedOrder.district}<br />{selectedOrder.postal_code}, {selectedOrder.country}</p></div></div>
                  {selectedOrder.phone_number && (<div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-xl"><Phone className="w-4 h-4 text-blue-600" /></div><div><p className="text-[10px] text-gray-400 uppercase">Phone</p><p className="text-sm font-medium">{selectedOrder.phone_number}</p></div></div>)}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"><span className="text-sm text-gray-500">Total Amount</span><span className="text-xl font-black text-emerald-700">LKR {parseFloat(selectedOrder.total_amount).toLocaleString()}</span></div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"><span className="text-sm text-gray-500">Status</span><span className={getStatusBadge(selectedOrder.status)}>{getStatusLabel(selectedOrder.status)}</span></div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"><span className="text-sm text-gray-500">Order Date</span><span className="text-sm font-semibold">{new Date(selectedOrder.created_at).toLocaleString()}</span></div>
                  <div className="bg-gray-50 p-3 rounded-xl">
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-500">Tracking Number</span>
    {!editingTracking ? (
      <button
        onClick={() => {
          setTrackingInput(selectedOrder.tracking_no || '');
          setEditingTracking(true);
        }}
        className="text-emerald-600 hover:text-emerald-700 p-1 rounded-full transition"
      >
        <Edit3 size={16} />
      </button>
    ) : (
      <button
        onClick={() => {
          console.log('Save clicked with trackingInput:', trackingInput);
          updateTrackingNumber(selectedOrder.order_id, trackingInput);
        }}
        className="text-blue-600 hover:text-blue-700 p-1 rounded-full transition"
      >
        <Save size={16} />
      </button>
    )}
  </div>

  {editingTracking ? (
    <input
      type="text"
      value={trackingInput}
      onChange={(e) => {
        console.log('Input changed to:', e.target.value);
        setTrackingInput(e.target.value);
      }}
      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
      placeholder="Enter tracking number"
      autoFocus
    />
  ) : (
    <p className="mt-1 font-mono text-sm font-semibold text-gray-700 break-all">
      {selectedOrder.tracking_no || 'Not assigned'}
    </p>
  )}
</div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3"><Hash className="w-4 h-4 text-gray-400" /><p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order Items</p></div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => {
                      const productName = item.product_name || item.name || item.product_code || `Product ID: ${item.product_id}`;
                      const itemKey = item.order_item_id || item.id || `item-${idx}`;
                      return (
                        <div key={itemKey} className="flex justify-between items-center bg-gray-50/80 p-3 rounded-xl hover:bg-gray-100 transition">
                          <div className="flex flex-col flex-1">
                            <span className="font-medium text-gray-800 text-sm">{productName}</span>
                            <div className="flex gap-4 text-[11px] text-gray-400 mt-0.5">
                              <span>Ordered: {item.qty || item.quantity}</span>
                              <span>Unit: LKR {parseFloat(item.price || item.price_at_order).toLocaleString()}</span>
                            </div>
                          </div>
                          <span className="font-bold text-gray-800">LKR {((item.price || item.price_at_order) * (item.qty || item.quantity)).toLocaleString()}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">No items found for this order</p>
                      <p className="text-xs text-gray-400 mt-1">Check if backend returns order.items</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                {selectedOrder.status === 2 && <button onClick={() => { updateStatus(selectedOrder.order_id, 3); closeModal(); }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"><Truck size={16} /> Mark Shipped</button>}
                {selectedOrder.status === 3 && <button onClick={() => { updateStatus(selectedOrder.order_id, 4); closeModal(); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"><ShoppingBag size={16} /> Mark Delivered</button>}
                {selectedOrder.status === 1 && <button onClick={() => { updateStatus(selectedOrder.order_id, 2); closeModal(); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"><Package size={16} /> Start Processing</button>}
                {selectedOrder.status !== 5 && selectedOrder.status !== 4 && <button onClick={() => { cancelOrder(selectedOrder.order_id); closeModal(); }} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">Cancel Order</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;