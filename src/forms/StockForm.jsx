import React, { useState, useEffect } from "react";
import DataTabale from "../components/DataTable";
import { stockApi } from "../services/api";
import { CiEdit, CiSearch, CiTrash } from "react-icons/ci";
import Navbar from "../layout/Navbar";
import StockSave from "../pages/StockSave";
import { TbUser } from "react-icons/tb";

const StockForm = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [editingStock, setEditingStock] = useState(null);
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
            console.log("Search error:", err);
            setStocks([]);
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

    const stockDelete = async (id) => {


        if (window.confirm('Are you sure you want to delete this seller?')) {
            try {
                setLoading(true);
                const response = await stockApi.deleteStock(id);

                console.log("Delete Response:", response);
                alert("   deleted successfully!");
                fetchStocks();

            } catch (error) {
                console.error("Delete Error details:", error);
                const msg = error.response?.data?.message || "Super Admin Delete Failed !!!";
                alert(msg);
            } finally {
                setLoading(false);
            }
        }
    }


    const stockColumns = [

        // {
        //     header: "Seller id",
        //     key: "seller_id"
        // },
        {
            header: "Seller Id ",
            key: "seller_name"
        },
        {
            header: "GRN",
            key: "grn_id"
        },
        {
            header: "Quentity",
            key: "qty"
        },

        {
            header: "Actions",
            render: (row) => (
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setEditingStock(row)}
                        className="p-2 text-yellow-400 hover:bg-yellow-100 rounded-full transition"
                        title="Edit"
                    >
                        <CiEdit size={24} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => stockDelete(row.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                        title="Delete"
                    >
                        <CiTrash size={24} />
                    </button>
                </div>
            )
        }

    ]

    useEffect(() => {
        fetchStocks();
    }, [searchTerm]);

    return (
          <>
       <Navbar />
        <div className="relative min-h-screen bg-white overflow-x-hidden p-6 mt-5">
          
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-12 items-center">

                <StockSave
                    onStockAdded={fetchStocks}
                    editingStock={editingStock}
                    setEditingStock={setEditingStock}
                />

                <div className="w-full ">

                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-6">

                        <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                            <TbUser />
                            <span>Stock Management</span>
                        </h2>

                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <TbUser className="h-6 w-6 text-emerald-500 font-bold" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, email or ID..."
                                className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md transition-all text-gray-700 shadow-sm placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                    <div className="backdrop-blur-xl p-8 overflow-hidden">
                        <DataTabale
                         columns={stockColumns} 
                         data={stocks} />
                    </div>

                </div>
            </div>
        </div>

       </>
    )
}

export default StockForm;