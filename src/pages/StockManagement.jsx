import React, { useState, useEffect } from "react";
import Navbar from "../layout/Navbar";
import { stockApi } from "../services/api";
import { AiOutlineStock } from "react-icons/ai";
import {
    TbBox, TbTruckDelivery, TbSearch, TbAlertTriangle,
    TbChecks, TbCalendarTime, TbTag, TbUserEdit,
    TbArrowUpRight, TbLayoutGrid, TbTrendingUp
} from "react-icons/tb";
import { toast } from "react-toastify";
import StockSave from "./StockSave";


const StockDisplay = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const request = searchTerm.trim() === ""
                ? await stockApi.getAllStock()
                : await stockApi.getStockByText(searchTerm);

            const receivedData = request.data?.data || request.data || [];
            setStocks(receivedData);
        } catch (err) {
            setStocks([]);
            toast.error("Failed to synchronize inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchStocks();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const totalQty = stocks.reduce((acc, curr) => acc + (parseInt(curr.qty) || 0), 0);
    const lowStockCount = stocks.filter(s => parseInt(s.qty) < 10).length;

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
            <Navbar />

            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[140px]"></div>
            </div>
            <StockSave />
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-md">Live</span>
                            <span className="text-slate-400 font-semibold text-xs uppercase tracking-widest">Inventory Intelligence</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-slate-950">
                            Stock <span className="text-emerald-500">Master</span>
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="relative group flex-1">
                            <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search inventory records..."
                                className="w-full lg:w-[400px] pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-sm font-medium"
                            />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden">
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                <AiOutlineStock size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gross Inventory</p>
                                <h3 className="text-3xl font-black text-slate-900">{totalQty.toLocaleString()} <span className="text-sm font-medium text-slate-400">PCS</span></h3>
                            </div>
                        </div>
                        <TbLayoutGrid className="absolute -right-4 -bottom-4 text-slate-50 opacity-10" size={120} />
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden">
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                                <TbAlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Replenishment Alerts</p>
                                <h3 className="text-3xl font-black text-slate-900">{lowStockCount} <span className="text-sm font-medium text-slate-400">SKUs</span></h3>
                            </div>
                        </div>
                        <TbTrendingUp className="absolute -right-4 -bottom-4 text-slate-50 opacity-10" size={120} />
                    </div>

                    <div className="bg-slate-950 p-8 rounded-[32px] shadow-2xl shadow-slate-200 relative group overflow-hidden">
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="w-12 h-12 bg-white/10 text-emerald-400 rounded-xl flex items-center justify-center border border-white/5">
                                <TbChecks size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Batch Entries</p>
                                <h3 className="text-3xl font-black text-white">{stocks.length}</h3>
                            </div>
                        </div>
                        <TbBox className="absolute -right-4 -bottom-4 text-white opacity-5" size={120} />
                    </div>
                </div>

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-[6px] border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] animate-pulse">Syncing Database</p>
                    </div>
                ) : stocks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {stocks.map((stock, index) => (
                            <div key={index} className="group bg-white border border-slate-100 rounded-[35px] p-2 transition-all hover:shadow-2xl hover:shadow-emerald-100/40 hover:-translate-y-2">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center font-bold text-sm">
                                                <TbTag size={18} />
                                            </div>
                                            <span className="font-bold text-slate-500 text-sm">ID: #{stock.product_id}</span>
                                        </div>
                                        <div className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${parseInt(stock.qty) > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {parseInt(stock.qty) > 10 ? 'Healthy' : 'Critical'}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 bg-emerald-50 rounded-lg text-emerald-600"><TbUserEdit size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Retailer / Seller</p>
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{stock.seller_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 bg-blue-50 rounded-lg text-blue-600"><TbTruckDelivery size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Primary Supplier</p>
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{stock.supplier_name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                <TbCalendarTime size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-tighter">Batch Date</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">{formatDate(stock.grn_date)}</p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-100"></div>
                                        <div className="flex-1 pl-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Reference</p>
                                            <p className="text-sm font-bold text-slate-700">GRN-{stock.grn_id}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-rose-50/30 transition-colors">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Unit Cost</p>
                                            <p className="text-md font-black text-slate-800">LKR {parseFloat(stock.cost_price).toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 group-hover:bg-emerald-500 transition-all duration-300">
                                            <p className="text-[10px] font-bold text-emerald-600 group-hover:text-emerald-100 uppercase mb-1">Selling</p>
                                            <p className="text-md font-black text-emerald-700 group-hover:text-white">LKR {parseFloat(stock.sell_price).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="relative overflow-hidden p-5 bg-slate-950 rounded-[28px] text-white flex items-center justify-between group-hover:scale-[1.02] transition-transform">
                                        <div className="relative z-10">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Available Units</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black tracking-tighter">{stock.qty}</span>
                                                <span className="text-xs font-bold text-emerald-500 uppercase">Items</span>
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                            <TbArrowUpRight size={28} className="text-emerald-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 bg-white rounded-[48px] border border-slate-100 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                            <TbBox size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4">No Inventory Data</h3>
                        <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                            Your inventory is currently empty or no records match your search criteria. Update your filters or add new stock.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockDisplay;