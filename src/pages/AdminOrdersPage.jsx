import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { toast } from 'react-toastify';
import { Package, Truck, CheckCircle, XCircle, Eye, User, Search } from 'lucide-react';
import SuperAdminNavbar from '../layout/SuperadminNav';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAllOrders();
      const ordersArray = res.data?.data || res.data?.orders || [];
      setOrders(ordersArray);
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
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 1: return 'Pending';
      case 2: return 'Processing';
      case 3: return 'Shipped';
      case 4: return 'Delivered';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      1: 'bg-amber-100 text-amber-700 border-amber-200',
      2: 'bg-blue-100 text-blue-700 border-blue-200',
      3: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      4: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      5: 'bg-rose-100 text-rose-700 border-rose-200'
    };
    return `px-3 py-1 rounded-full text-xs font-bold border ${classes[status] || classes[1]}`;
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 1;
    if (activeTab === 'processing') return order.status === 2;
    if (activeTab === 'shipped') return order.status === 3;
    if (activeTab === 'delivered') return order.status === 4;
    if (activeTab === 'cancelled') return order.status === 5;
    return true;
  }).filter(order => {
    if (!searchTerm) return true;
    const userName = order.first_name || '';
    const lastName = order.last_name || '';
    const userEmail = order.user?.email || order.user_email || '';
    const orderId = order.order_id || '';
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
           orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <SuperAdminNavbar />
      <main className="px-6 md:px-12 max-w-7xl mx-auto py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#2d4030] tracking-tight">Orders Management</h1>
            <p className="text-gray-400 text-sm font-medium">Manage all customer orders</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user name, email or order ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 w-64 md:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-1.5 rounded-2xl shadow-sm mb-8">
          <button onClick={() => setActiveTab('all')} className={`px-5 py-2 rounded-xl text-sm font-bold ${activeTab === 'all' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>All ({orders.length})</button>
          <button onClick={() => setActiveTab('pending')} className={`px-5 py-2 rounded-xl text-sm font-bold ${activeTab === 'pending' ? 'bg-amber-600 text-white' : 'text-gray-500'}`}>Pending ({orders.filter(o => o.status === 1).length})</button>
          <button onClick={() => setActiveTab('processing')} className={`px-5 py-2 rounded-xl text-sm font-bold ${activeTab === 'processing' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Processing ({orders.filter(o => o.status === 2).length})</button>
          <button onClick={() => setActiveTab('shipped')} className={`px-5 py-2 rounded-xl text-sm font-bold ${activeTab === 'shipped' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>Shipped ({orders.filter(o => o.status === 3).length})</button>
          <button onClick={() => setActiveTab('delivered')} className={`px-5 py-2 rounded-xl text-sm font-bold ${activeTab === 'delivered' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Delivered ({orders.filter(o => o.status === 4).length})</button>
          <button onClick={() => setActiveTab('cancelled')} className={`px-5 py-2 rounded-xl text-sm font-bold ${activeTab === 'cancelled' ? 'bg-rose-600 text-white' : 'text-gray-500'}`}>Cancelled ({orders.filter(o => o.status === 5).length})</button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-300">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500">Try changing the filter or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <div key={order.order_id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-50 p-2 rounded-xl">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className={getStatusBadge(order.status)}>{getStatusLabel(order.status)}</span>
                </div>
                
                <div className="mb-4">
                  <p className="text-xs text-gray-400 font-bold">Order ID</p>
                  <p className="font-mono font-bold text-gray-800">#{order.order_id.slice(-8).toUpperCase()}</p>
                </div>

                <div className="mb-4 flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Customer</p>
                    <p className="text-sm font-semibold text-gray-800">{order.first_name  || 'Guest'} {order.last_name || ''}</p>
                    <p className="text-xs text-gray-500">{order.email || 'No email'}</p>
                  </div>
                </div>

                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-xl font-black">LKR {parseFloat(order.total_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-sm font-bold">{new Date(order.created_at).toDateString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4 flex-wrap">
                  {order.status === 2 && (
                    <button onClick={() => updateStatus(order.order_id, 3)} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                      <Truck size={16} /> Mark Shipped
                    </button>
                  )}
                  {order.status === 3 && (
                    <button onClick={() => updateStatus(order.order_id, 4)} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                       Delivered
                    </button>
                  )}
                  {order.status === 1 && (
                    <button onClick={() => updateStatus(order.order_id, 2)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                      Start Processing
                    </button>
                  )}
                  {order.status !== 5 && order.status !== 4 && (
                    <button onClick={() => cancelOrder(order.order_id)} className="flex-1 bg-rose-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-rose-700 transition flex items-center justify-center gap-2">
                      Cancel Order
                    </button>
                  )}
                  <button className="bg-gray-100 text-gray-700 p-2 rounded-xl hover:bg-gray-200 transition">
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrdersPage;