import React, { useState, useEffect } from "react";
import { ImUserTie } from "react-icons/im";
import SuperAdminRegister from "../pages/SuperAdminRegister";
import { superAdminApi } from "../services/api";
import DataTabale from "../components/DataTable";
import { CiEdit, CiTrash } from "react-icons/ci";
import SuperAdminNavbar from "../layout/SuperadminNav";


const SuperAdminForm = () => {
    const [superAdmins, setSuperAdmins] = useState([]);
    const [loading, setLoading] = useState(false);

    const [editingSuperAdmin, setEditingSuperAdmin] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [profile, setProfile] = useState(null);

    const fetchSuperAdmins = async () => {
        setLoading(true);
        const request = searchTerm.trim() === ""
            ? superAdminApi.getAllSuperAdmin()
            : superAdminApi.getSuperAdminByText(searchTerm);

        request
            .then(res => {
                const receivedData = res.data && res.data.data ? res.data.data : [];
                setSuperAdmins(receivedData);
            })
            .catch(err => {
                console.log("Search error:", err);
                setSuperAdmins([]);
            })
            .finally(() => setLoading(false));
    }

    const superAdminDelete = async (id) => {
        

        if (window.confirm('Are you sure you want to delete this super admin?')) {
            try {
                setLoading(true);
                const response = await superAdminApi.deleteSuperAdmin(id);

                console.log("Delete Response:", response);
                alert("Super Admin deleted successfully!");
                fetchSuperAdmins();

            } catch (error) {
                console.error("Delete Error details:", error);
                const msg = error.response?.data?.message || "Super Admin Delete Failed !!!";
                alert(msg);
            } finally {
                setLoading(false);
            }
        }
    }

      const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

    const superAdminColumns = [

        {
            header: "Username",
            key: "user_name"
        },
        {
            header: "Super Admin Name",
            key: "super_admin_name"
        },
        {
            header: "Email",
            key: "email"
        },


        {
            header: "Actions",
            render: (row) => (
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setEditingSuperAdmin(row)}
                        className="p-2 text-yellow-400 hover:bg-yellow-100 rounded-full transition"
                        title="Edit"
                    >
                        <CiEdit size={24} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => superAdminDelete(row.super_admin_id)}
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
        fetchSuperAdmins();
    }, [searchTerm]);

    return (
        
       <>
      <SuperAdminNavbar onLogout={handleLogout} profile={profile} />
        <div className="relative min-h-screen bg-white overflow-x-hidden p-6 mt-5">
          
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-12 items-center">

                <SuperAdminRegister
                    onSuperAdminAdded={fetchSuperAdmins}
                    editingSuperAdmin={editingSuperAdmin}
                    setEditingSuperAdmin={setEditingSuperAdmin}
                />

                <div className="w-full ">

                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-6">

                        <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                            <ImUserTie />
                            <span>Super Admin  Management</span>
                        </h2>

                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <ImUserTie className="h-6 w-6 text-emerald-500 font-bold" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by role , description..."
                                className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md transition-all text-gray-700 shadow-sm placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                    <div className="backdrop-blur-xl p-8 overflow-hidden">
                        <DataTabale columns={superAdminColumns} data={superAdmins} />
                    </div>

                </div>
            </div>
        </div>

       </>
    )

}


export default SuperAdminForm;