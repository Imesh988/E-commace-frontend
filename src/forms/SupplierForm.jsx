import React, { useState, useEffect } from "react";
import DataTabale from "../components/DataTable";
import { CiEdit, CiSearch, CiTrash } from "react-icons/ci";
import { supplierApi } from "../services/api";
import SupplierSave from "../pages/SupplierSave";
import { SlUser } from "react-icons/sl";
import SuperAdminNavbar from "../layout/SuperadminNav";


const SupplierForm = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [editingSupplier, setEditingSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
            const [profile, setProfile] = useState(null);
    


    const fetchSupplier = async () => {
        setLoading(true);
        try {
            const request = searchTerm.trim() === ""
                ? await supplierApi.getAllSupplier()
                : await supplierApi.getSupplierByText(searchTerm);

            const receivedData = request.data?.data || request.data || [];
            setSuppliers(receivedData);
        } catch (err) {
            console.log("Search error:", err);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

      const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchSupplier();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const supplierDelete = async (id) => {

        // if(!id){
        //     console.error("ID is undefined!");
        // return;
        // }
        
        if (window.confirm('Are you sure you want to delete this seller?')) {
            try {
                setLoading(true);
                console.log(id);
                
                alert('1');
                const response = await supplierApi.deleteSupplier(id);
                // alert('2');
                console.log("Delete Response:", response);
                alert("   deleted successfully!");
                fetchSupplier();

            } catch (error) {
                console.error("Delete Error details:", error);
                const msg = error.response?.data?.message || "Supplier Delete Failed !!!";
                alert(msg);
            } finally {
                setLoading(false);
            }
        }
    }


    const supplierColumns = [

        // {
        //     header: 'supplier_id',
        //     key: 'supplier_id'
        // },

        {
            header: "Seller Id ",
            key: "seller_id"
        },
        {
            header: "Supplier name",
            key: "supplier_name"
        },
        {
            header: "Address",
            key: "address"
        },
        {
            header: "Telephone No",
            key: "tel_no"
        },

        {
            header: "Actions",
            render: (row) => (
                
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => {
                            
                            console.log("Row Data:", row); 
                            setEditingSupplier(row)}}
                        className="p-2 text-yellow-400 hover:bg-yellow-100 rounded-full transition"
                        title="Edit"
                    >
                        <CiEdit size={24} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => supplierDelete(row.supplier_id)}
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
        fetchSupplier();
    }, [searchTerm]);

    return (

                   <>
      <SuperAdminNavbar onLogout={handleLogout} profile={profile} />
        <div className="relative min-h-screen bg-white overflow-x-hidden p-6 mt-5">
          
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-12 items-center">

                <SupplierSave
                    onSupplierAdded={fetchSupplier}
                    editingSupplier={editingSupplier}
                    setEditingSupplier={setEditingSupplier}
                />

                <div className="w-full ">

                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-6">

                        <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                            <SlUser />
                            <span>Supplier Management</span>
                        </h2>

                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SlUser className="h-6 w-6 text-emerald-500 font-bold" />
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
                         columns={supplierColumns} 
                         data={suppliers} />
                    </div>
                    

                </div>
            </div>
        </div>

       </>
    )


}


export default SupplierForm;