import React, { useState, useEffect, useRef } from "react";
import DataTabale from "../components/DataTable";
import { stockApi, sellerApi } from "../services/api";
import { CiEdit, CiTrash } from "react-icons/ci";
import StockSave from "../pages/StockSave";
import { AiOutlineStock } from "react-icons/ai";
import { toast } from "react-toastify";
import SellerNavbar from "../layout/SellerNavbar";
import clsx from 'clsx';

const StockForm = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentSellerId, setCurrentSellerId] = useState(null);
    
    // ✅ AbortController reference for canceling requests
    const abortControllerRef = useRef(null);

    // ✅ Fetch current seller ID
    const fetchCurrentSellerId = async () => {
        try {
            const userStr = localStorage.getItem('user');
            let userId = null;
            if (userStr) {
                const user = JSON.parse(userStr);
                userId = user.user_id || user.id;
            } else {
                userId = localStorage.getItem('user_id');
            }
            if (!userId) return null;

            const sellerRes = await sellerApi.getSellerByUserId(userId);
            const sellerData = sellerRes.data?.data;
            console.log('seller data ' , sellerData);
            
            if (sellerData) {
                setCurrentSellerId(sellerData.seller_id);
                return sellerData.seller_id;
            }
            return null;
        } catch (e) {
            console.error('Error fetching seller:', e);
            return null;
        }
    };

    const fetchStocks = async () => {
        // ✅ Cancel any ongoing request before starting a new one
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            // 1. වත්මන් seller ගේ seller_id ලබා ගන්න
            let sellerId = currentSellerId;
            if (!sellerId) {
                sellerId = await fetchCurrentSellerId();
            }

            if (!sellerId) {
                setStocks([]);
                toast.info('You are not a seller yet. Please register as a seller first.');
                setLoading(false);
                return;
            }

            // 2. සියලුම stocks ලබා ගන්න (with cancel signal if supported)
            // Note: If api.js doesn't support signal, we can't pass it. 
            // We'll just use the controller for cleanup.
            const request = searchTerm.trim() === ""
                ? await stockApi.getAllStock()
                : await stockApi.getStockByText(searchTerm);

            // ✅ Check if request was aborted (if controller aborted, the promise would reject)
            // But we're not passing signal, so we can't abort via axios. We'll just catch abort errors later.
            const allStocks = request.data?.data || request.data || [];

            // 3. වත්මන් seller ගේ stocks පමණක් filter කරන්න
            const filteredStocks = allStocks.filter(stock =>
                String(stock.seller_id) === String(sellerId)
            );

            setStocks(filteredStocks);
        } catch (err) {
            // ✅ Ignore abort errors
            if (err.name === 'AbortError' || err.message === 'Request aborted' || err.code === 'ERR_CANCELED') {
                console.log('Request aborted, ignoring');
                return;
            }
            console.error("Fetch error:", err);
            setStocks([]);
            toast.error("Failed to load stocks");
        } finally {
            setLoading(false);
            // Clean up controller if it's still the current one
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    };

    // ✅ Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        fetchCurrentSellerId();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchStocks();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const stockDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this stock record?')) {
            try {
                setLoading(true);
                await stockApi.deleteStock(id);
                toast.success("Stock deleted successfully!");
                fetchStocks();
            } catch (error) {
                const msg = error.response?.data?.message || "Delete Failed!";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        }
    };

    const stockColumns = [
        { header: "Seller", key: "seller_name" },
        { header: "Supplier", key: "supplier_name" },
        { header: "Product Name", key: "product_name" },
        {
            header: "GRN Date",
            render: (row) => row.grn_date ? new Date(row.grn_date).toLocaleDateString() : "N/A"
        },
        {
            header: "Cost Price",
            render: (row) => <span className={clsx('text-red-500', 'font-medium')}>LKR {parseFloat(row.cost_price).toLocaleString()}</span>
        },
        {
            header: "Sell Price",
            render: (row) => <span className={clsx('text-green-600', 'font-medium')}>LKR {parseFloat(row.sell_price).toLocaleString()}</span>
        },
        {
            header: "Qty",
            render: (row) => (
                <span className={`font-bold ${row.qty < 10 ? 'text-orange-500' : 'text-slate-700'}`}>
                    {row.qty}
                </span>
            )
        },
        {
            header: "Actions",
            render: (row) => (
                <div className={clsx('flex', 'justify-center', 'gap-3')}>
                    <button
                        onClick={() => {
                            setEditingStock(row);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={clsx('p-2', 'text-yellow-400', 'hover:bg-yellow-100', 'rounded-full', 'transition')}
                        title="Edit"
                    >
                        <CiEdit size={24} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => stockDelete(row.id)}
                        className={clsx('p-2', 'text-red-600', 'hover:bg-red-100', 'rounded-full', 'transition')}
                        title="Delete"
                    >
                        <CiTrash size={24} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <SellerNavbar />
            <div className={clsx('relative', 'min-h-screen', 'bg-white', 'overflow-x-hidden', 'p-6', 'mt-5')}>
                <div className={clsx('fixed', 'top-[-10%]', 'left-[-10%]', 'w-[50%]', 'h-[50%]', 'bg-emerald-100', 'rounded-full', 'blur-[120px]', 'opacity-60', 'pointer-events-none')}></div>
                <div className={clsx('fixed', 'bottom-[-10%]', 'right-[-10%]', 'w-[50%]', 'h-[50%]', 'bg-cyan-100', 'rounded-full', 'blur-[120px]', 'opacity-60', 'pointer-events-none')}></div>

                <div className={clsx('relative', 'z-10', 'flex', 'flex-col', 'gap-12', 'items-center')}>
                    <StockSave
                        onStockAdded={fetchStocks}
                        editingStock={editingStock}
                        setEditingStock={setEditingStock}
                    />

                    <div className="w-full">
                        <div className={clsx('flex', 'flex-col', 'md:flex-row', 'justify-between', 'items-center', 'mb-10', 'gap-6', 'px-6')}>
                            <h2 className={clsx('text-3xl', 'font-bold', 'text-green-600', 'flex', 'items-center', 'gap-3')}>
                                <AiOutlineStock />
                                <span>Stock Management</span>
                            </h2>

                            <div className={clsx('relative', 'w-full', 'md:w-96', 'group')}>
                                <div className={clsx('absolute', 'inset-y-0', 'left-0', 'pl-4', 'flex', 'items-center', 'pointer-events-none')}>
                                    <AiOutlineStock className={clsx('h-6', 'w-6', 'text-emerald-500', 'font-bold')} />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by seller, supplier or product..."
                                    className={clsx('block', 'w-full', 'pl-12', 'pr-4', 'py-3', 'bg-white/60', 'border', 'border-emerald-100', 'rounded-2xl', 'outline-none', 'focus:ring-2', 'focus:ring-emerald-500', 'backdrop-blur-md', 'transition-all', 'text-gray-700', 'shadow-sm', 'placeholder:text-gray-400')}
                                />
                            </div>
                        </div>

                        <div className={clsx('backdrop-blur-xl', 'p-4', 'bg-white/40', 'rounded-[30px]', 'overflow-hidden')}>
                            {loading && stocks.length === 0 ? (
                                <div className={clsx('flex', 'justify-center', 'p-20')}>
                                    <div className={clsx('animate-spin', 'rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-emerald-500')}></div>
                                </div>
                            ) : (
                                <DataTabale
                                    columns={stockColumns}
                                    data={stocks}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StockForm;