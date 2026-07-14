import React, { useState, useEffect } from "react";
import DataTabale from "../components/DataTable";
import { CiEdit, CiTrash } from "react-icons/ci";
import { productApi, orderApi, stockApi } from "../services/api";
import Product from "../pages/Product";
import { FaBoxOpen, FaChartLine, FaArrowTrendUp } from "react-icons/fa6";
import { TbTruckReturn, TbLayoutDashboard, TbUsers } from "react-icons/tb";
import { toast } from "react-toastify";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SellerNavbar from "../layout/SellerNavbar";
import useSellerAuth from '../hooks/useSellerAuth';

const SellerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);          // sellerගේ stocks
    const [orders, setOrders] = useState([]);
    const [returnedOrders, setReturnedOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("products");


    useSellerAuth();

    const getCurrentUserId = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { return JSON.parse(userStr).user_id; } catch (e) { return localStorage.getItem('user_id'); }
        }
        return localStorage.getItem('user_id');
    };

    // 👇 sellerගේ නිෂ්පාදන පමණක් ගන්න (API එකෙන් හැම product එකක්ම ගෙන filter කරන්න)
    const fetchSellerProducts = async () => {
        try {
            const request = searchTerm.trim() === "" 
                ? await productApi.getAllProduct() 
                : await productApi.getProductByText(searchTerm);
            const allProducts = request.data?.data || request.data || [];
            const userId = getCurrentUserId();
            const filtered = allProducts.filter(p => String(p.user_id) === String(userId));
            setProducts(filtered);
        } catch (err) {
            setProducts([]);
        }
    };

    // 👇 sellerගේ තොග පමණක් ගන්න (stockApi එකෙන් හැම stock එකක්ම ගෙන filter කරන්න)
    const fetchSellerStocks = async () => {
        try {
            const response = await stockApi.getAllStock();
            const allStocks = response.data?.data || response.data || [];
            const userId = getCurrentUserId();
            // stock object එකේ seller_id හෝ user_id කියලා field එකක් තියෙනවා උපකල්පනය කරමු
            const filtered = allStocks.filter(s => String(s.seller_id) === String(userId) || String(s.user_id) === String(userId));
            setStocks(filtered);
        } catch (err) {
            setStocks([]);
        }
    };

    const fetchOrdersData = async () => {
        try {
            const response = await orderApi.getAllOrders();
            const ordersArray = response.data?.data || response.data?.orders || response.data || [];
            const uniqueOrdersMap = new Map();
            ordersArray.forEach(order => { if (order.order_id && !uniqueOrdersMap.has(order.order_id)) uniqueOrdersMap.set(order.order_id, order); });
            const userOrders = Array.from(uniqueOrdersMap.values()).filter(order => String(order.user_id) === String(getCurrentUserId()));
            setOrders(userOrders);
            setReturnedOrders(userOrders.filter(order => order.return_status));
        } catch (error) {
            toast.error('Failed to fetch orders');
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([fetchSellerProducts(), fetchSellerStocks(), fetchOrdersData()]);
        setLoading(false);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadAllData();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // 👇 නිෂ්පාදන හා තොග දත්ත මාසිකව එකතු කර chart එක සඳහා data array එකක් හදන්න
    const getMonthlyChartData = () => {
        // පසුගිය මාස 6 සඳහා පෙන්වන්න
        const months = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${d.getFullYear()}-${d.getMonth()+1}`;
            const monthLabel = d.toLocaleString('default', { month: 'short' }) + " '" + d.getFullYear().toString().slice(-2);
            months.push({ key: monthKey, label: monthLabel, productsCount: 0, stockQty: 0 });
        }

        // products එකතු කිරීම (product.created_at තියෙනවා උපකල්පනය කරමු)
        products.forEach(prod => {
            if (!prod.created_at) return;
            const date = new Date(prod.created_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth()+1}`;
            const monthObj = months.find(m => m.key === monthKey);
            if (monthObj) monthObj.productsCount += 1;
        });

        // stocks එකතු කිරීම (stock.grn_date සහ qty භාවිතා කරමු)
        stocks.forEach(stock => {
            if (!stock.grn_date) return;
            const date = new Date(stock.grn_date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()+1}`;
            const monthObj = months.find(m => m.key === monthKey);
            if (monthObj && stock.qty) monthObj.stockQty += Number(stock.qty);
        });

        // Rechart format එකට හරවන්න
        return months.map(m => ({
            name: m.label,
            products: m.productsCount,
            stockQty: m.stockQty,
        }));
    };

    // 👇 සම්පූර්ණ තොග ප්‍රමාණය (Qty එකතුව)
    const totalStockQty = stocks.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);

    const StatCard = ({ title, value, icon: Icon, gradient, borderColor, indicatorColor }) => (
        <div className="group relative bg-white/80 backdrop-blur-sm p-7 rounded-[38px] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
             style={{ borderColor: borderColor || 'rgba(226, 232, 240, 0.5)' }}>
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                 style={{ background: gradient, borderRadius: 'inherit' }}></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-2xl transition-all duration-700 group-hover:scale-150"
                 style={{ background: indicatorColor, opacity: 0.15 }}></div>
            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div className="p-4 rounded-[22px] bg-white shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
                         style={{ boxShadow: `0 8px 20px ${indicatorColor}20` }}>
                        <Icon size={26} style={{ color: indicatorColor }} />
                    </div>
                    <div className="p-2 rounded-full bg-slate-100/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                </div>
                <div>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[2px] mb-1.5">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </h3>
                        <div className="h-1.5 w-1.5 rounded-full animate-pulse"
                             style={{ backgroundColor: indicatorColor }}></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F7FE]">
            <SellerNavbar />
            <div className="max-w-[1700px] mx-auto p-6 lg:p-10 flex flex-col gap-8">

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

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Products & Stock Growth</h2>
                            <p className="text-gray-400 text-sm">Monthly product adds vs stock quantity received</p>
                        </div>
                        <div className="flex gap-4 text-[12px] font-bold">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Products Added ({products.length})</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Stock Qty ({totalStockQty})</div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getMonthlyChartData()}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F4F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 10, fontWeight: '600' }} dy={20} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                                <Line type="monotone" dataKey="products" stroke="#10b981" strokeWidth={5} dot={false} name="Products Added" />
                                <Line type="monotone" dataKey="stockQty" stroke="#3b82f6" strokeWidth={5} dot={false} name="Stock Quantity" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 mt-10 pt-8 border-t border-gray-50">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Products</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">{products.length}</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">▲ Live</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Stock on Hand</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">{totalStockQty}</span>
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">● Units</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Store Rating</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">4.8</span>
                                <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">★ Top</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {editingProduct && (
                <div className="fixed inset-0 z-[100] bg-gray-900/20 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                        <Product editData={editingProduct} onSuccess={() => { setEditingProduct(null); fetchSellerProducts(); }} onClose={() => setEditingProduct(null)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;