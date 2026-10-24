import React, { useState, useEffect, useCallback } from "react";
import { productApi, orderApi, stockApi, sellerApi } from "../services/api";
import Product from "../pages/Product";
import { FaBoxOpen, FaChartLine } from "react-icons/fa6";
import { toast } from "react-toastify";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import SellerNavbar from "../layout/SellerNavbar";
import useSellerAuth from '../hooks/useSellerAuth';

const SellerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [returnedOrders, setReturnedOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useSellerAuth();

    // ─────────────────────────────────────────────────────────────
    // Helper: current user_id
    // ─────────────────────────────────────────────────────────────
    const getCurrentUserId = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { return JSON.parse(userStr).user_id; }
            catch (e) { return localStorage.getItem('user_id'); }
        }
        return localStorage.getItem('user_id');
    };

    // ─────────────────────────────────────────────────────────────
    // 1) Products — server-side filter (getMyProducts)
    // ─────────────────────────────────────────────────────────────
    const fetchSellerProducts = useCallback(async () => {
        try {
            const request = searchTerm.trim() === ""
                ? await productApi.getMyProducts()
                : await productApi.getProductByText(searchTerm);

            const myProducts = request.data?.data || request.data || [];
            console.log('✅ [Products] My products:', myProducts.length);
            if (myProducts[0]) console.log('🔍 [Products] Sample:', myProducts[0]);

            setProducts(Array.isArray(myProducts) ? myProducts : []);
        } catch (err) {
            console.error('❌ [Products] fetch failed:', err);
            setProducts([]);
        }
    }, [searchTerm]);

    // ─────────────────────────────────────────────────────────────
    // 2) Stocks — user_id → real seller_id → filter
    // ─────────────────────────────────────────────────────────────
    const fetchSellerStocks = useCallback(async () => {
        try {
            const userId = getCurrentUserId();

            // Step 1: user_id → seller_id
            let realSellerId = null;
            try {
                const sellerRes = await sellerApi.getSellerByUserId(userId);
                realSellerId = sellerRes.data?.data?.seller_id;
                console.log('🔍 [Stocks] Real seller_id:', realSellerId, '(from user_id:', userId, ')');
            } catch (e) {
                console.warn('⚠️ [Stocks] Could not fetch seller_id:', e?.message);
            }

            // Step 2: stocks + my products parallel
            const [stockRes, productRes] = await Promise.all([
                stockApi.getAllStock(),
                productApi.getMyProducts(),
            ]);

            const allStocks = stockRes.data?.data || stockRes.data || [];
            const myProducts = productRes.data?.data || productRes.data || [];
            const myProductIds = new Set(myProducts.map(p => String(p.product_id)));

            console.log('🔍 [Stocks] Total stocks in DB:', allStocks.length);
            console.log('🔍 [Stocks] My product IDs:', Array.from(myProductIds));
            if (allStocks[0]) console.log('🔍 [Stocks] Sample stock object:', allStocks[0]);

            // Step 3: match by seller_id OR product_id
            const filtered = allStocks.filter(s => {
                const stockSellerId = String(s.seller_id ?? '');
                const stockProductId = String(s.product_id ?? '');

                if (realSellerId && stockSellerId === String(realSellerId)) return true;
                if (myProductIds.size > 0 && myProductIds.has(stockProductId)) return true;
                return false;
            });

            console.log('✅ [Stocks] Filtered for this seller:', filtered.length);
            setStocks(filtered);
        } catch (err) {
            console.error('❌ [Stocks] fetch failed:', err);
            setStocks([]);
        }
    }, []);

    // ─────────────────────────────────────────────────────────────
    // 3) Orders
    // ─────────────────────────────────────────────────────────────
    const fetchOrdersData = useCallback(async () => {
        try {
            const response = await orderApi.getAllOrders();
            const ordersArray = response.data?.data || response.data?.orders || response.data || [];
            const uniqueOrdersMap = new Map();
            ordersArray.forEach(order => {
                if (order.order_id && !uniqueOrdersMap.has(order.order_id)) {
                    uniqueOrdersMap.set(order.order_id, order);
                }
            });
            const userOrders = Array.from(uniqueOrdersMap.values())
                .filter(order => String(order.user_id) === String(getCurrentUserId()));
            setOrders(userOrders);
            setReturnedOrders(userOrders.filter(order => order.return_status));
        } catch (error) {
            console.error('❌ [Orders] fetch failed:', error);
            toast.error('Failed to fetch orders');
        }
    }, []);

    // ─────────────────────────────────────────────────────────────
    // Load all
    // ─────────────────────────────────────────────────────────────
    const loadAllData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchSellerProducts(), fetchSellerStocks(), fetchOrdersData()]);
        setLoading(false);
    }, [fetchSellerProducts, fetchSellerStocks, fetchOrdersData]);

    // Refetch on search / refresh / initial
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => { loadAllData(); }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, loadAllData, refreshKey]);

    // Refetch when window gets focus / tab visible
    useEffect(() => {
        const handleFocus = () => { loadAllData(); };
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') loadAllData();
        };
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [loadAllData]);

    // ─────────────────────────────────────────────────────────────
    // Monthly chart data
    // ─────────────────────────────────────────────────────────────
    const getMonthlyChartData = () => {
        const months = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const monthLabel = d.toLocaleString('default', { month: 'short' }) + " '" +
                d.getFullYear().toString().slice(-2);
            months.push({ key: monthKey, label: monthLabel, productsCount: 0, stockQty: 0 });
        }

        // Products
        products.forEach(prod => {
            const raw = prod.created_at || prod.createdAt;
            let date = raw ? new Date(raw) : new Date();
            if (isNaN(date.getTime())) date = new Date();
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const monthObj = months.find(m => m.key === monthKey);
            if (monthObj) monthObj.productsCount += 1;
        });

        // Stocks
        stocks.forEach(stock => {
            const raw = stock.grn_date || stock.grnDate ||
                stock.created_at || stock.createdAt;
            if (!raw) return;

            let date;
            if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
                const [y, m, d] = raw.split(/[-T]/).map(Number);
                date = new Date(y, m - 1, d);
            } else {
                date = new Date(raw);
            }
            if (isNaN(date.getTime())) return;

            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const monthObj = months.find(m => m.key === monthKey);
            const qty = Number(stock.qty) || 0;
            if (monthObj) monthObj.stockQty += qty;
        });

        const result = months.map(m => ({
            name: m.label,
            products: m.productsCount,
            stockQty: m.stockQty,
        }));
        console.log('📊 [Chart] Final data:', result);
        return result;
    };

    const totalStockQty = stocks.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);

    // ─────────────────────────────────────────────────────────────
    // StatCard UI
    // ─────────────────────────────────────────────────────────────
    const StatCard = ({ title, value, icon: Icon, gradient, borderColor, indicatorColor }) => (
        <div
            className="group relative bg-white/80 backdrop-blur-sm p-7 rounded-[38px] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
            style={{ borderColor: borderColor || 'rgba(226, 232, 240, 0.5)' }}
        >
            <div
                className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: gradient, borderRadius: 'inherit' }}
            ></div>
            <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-2xl transition-all duration-700 group-hover:scale-150"
                style={{ background: indicatorColor, opacity: 0.15 }}
            ></div>
            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div
                        className="p-4 rounded-[22px] bg-white shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
                        style={{ boxShadow: `0 8px 20px ${indicatorColor}20` }}
                    >
                        <Icon size={26} style={{ color: indicatorColor }} />
                    </div>
                </div>
                <div>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[2px] mb-1.5">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </h3>
                        <div
                            className="h-1.5 w-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: indicatorColor }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F4F7FE]">
            <SellerNavbar />
            <div className="max-w-[1700px] mx-auto p-6 lg:p-10 flex flex-col gap-8">

                {/* Refresh button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setRefreshKey(k => k + 1)}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-white shadow text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        {loading ? "Refreshing..." : "🔄 Refresh"}
                    </button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <StatCard
                        title="Total Products"
                        value={products.length}
                        icon={FaBoxOpen}
                        gradient="linear-gradient(135deg, #4318FF08, #4318FF15)"
                        borderColor="#4318FF30"
                        indicatorColor="#4318FF"
                    />
                    <StatCard
                        title="Total Stock Qty"
                        value={totalStockQty}
                        icon={FaChartLine}
                        gradient="linear-gradient(135deg, #05CD9908, #05CD9915)"
                        borderColor="#05CD9930"
                        indicatorColor="#05CD99"
                    />
                </div>

                {/* Chart */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Products & Stock Growth
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Monthly product adds vs stock quantity received
                            </p>
                        </div>
                        <div className="flex gap-4 text-[12px] font-bold">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                                Products Added ({products.length})
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                Stock Qty ({totalStockQty})
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getMonthlyChartData()}>
                                <CartesianGrid
                                    strokeDasharray="0"
                                    vertical={false}
                                    stroke="#F1F4F9"
                                />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: '600' }}
                                    dy={20}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '20px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="products"
                                    stroke="#10b981"
                                    strokeWidth={5}
                                    dot={{ r: 4, fill: '#10b981' }}
                                    activeDot={{ r: 6 }}
                                    name="Products Added"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="stockQty"
                                    stroke="#3b82f6"
                                    strokeWidth={5}
                                    dot={{ r: 4, fill: '#3b82f6' }}
                                    activeDot={{ r: 6 }}
                                    name="Stock Quantity"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 mt-10 pt-8 border-t border-gray-50">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                Total Products
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">{products.length}</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                                    ▲ Live
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                Stock on Hand
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">{totalStockQty}</span>
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                    ● Units
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                Store Rating
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">4.8</span>
                                <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">
                                    ★ Top
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit product modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-[100] bg-gray-900/20 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                        <Product
                            editData={editingProduct}
                            onSuccess={() => {
                                setEditingProduct(null);
                                setRefreshKey(k => k + 1);
                            }}
                            onClose={() => setEditingProduct(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;