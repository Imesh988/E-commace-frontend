import React, { useState, useEffect } from "react";
import DataTabale from "../components/DataTable";
import { roleApi } from "../services/api";
import { CiEdit, CiSearch, CiTrash } from "react-icons/ci";
import { HiUserGroup } from "react-icons/hi";
import RoleSave from "../pages/RoleSave";
import SuperAdminNavbar from "../layout/SuperadminNav";


const RoleForm = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    const [editingRole, setEditingRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [profile, setProfile] = useState(null);


    const fetchRoles = async () => {
        setLoading(true);
        const request = searchTerm.trim() === ""
            ? roleApi.getAllRole()
            : roleApi.getRoleByText(searchTerm);

        request
            .then(res => {
                const receivedData = res.data && res.data.data ? res.data.data : [];
                setRoles(receivedData);
            })
            .catch(err => {
                console.log("Search error:", err);
                setRoles([]);
            })
            .finally(() => setLoading(false));
    }

    const roleDelete = async (id) => {
        try {
            if (window.confirm('Are you sure you want to delete this role?')) {
                await roleApi.deleteRole(id)
                    .then(() => {
                        fetchRoles();
                    })
                    .catch(err => console.log(err));
            }
        } catch (error) {
            console.log(error);
            alert("Role Delete Failed !!!");

        }
    }

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };


    const roleColumns = [

        {
            header: "Role Name",
            key: "role"
        },
        {
            header: "D  escription",
            key: "description"
        },


        {
            header: "Actions",
            render: (row) => (
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setEditingRole(row)}
                        className="p-2 text-yellow-400 hover:bg-yellow-100 rounded-full transition"
                        title="Edit"
                    >
                        <CiEdit size={24} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => roleDelete(row.role_id)}
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
        fetchRoles();

    }, [searchTerm]);

    return (
        <>
      <SuperAdminNavbar onLogout={handleLogout} profile={profile} />
            <div className="relative min-h-screen bg-white overflow-x-hidden p-6 mt-6">
                <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-12 items-center">

                    <RoleSave
                        onRoleAdded={fetchRoles}
                        editingRole={editingRole}
                        setEditingRole={setEditingRole}
                    />

                    <div className="w-full ">

                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-6">

                            <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                                <HiUserGroup />
                                <span>Role Management</span>
                            </h2>

                            <div className="relative w-full md:w-96 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <HiUserGroup className="h-6 w-6 text-emerald-500 font-bold" />
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
                            <DataTabale columns={roleColumns} data={roles} />
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default RoleForm;