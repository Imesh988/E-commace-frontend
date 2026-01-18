import React, { useState, useEffect } from "react";
import DataTabale from "../components/DataTable";
import { userApi } from "../services/api";
import { CiEdit, CiSearch, CiTrash } from "react-icons/ci";
import { FaUser } from "react-icons/fa";
import UserRegister from "../pages/UserRegister";


const UserForm = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const userDelete = async (id) => {
        try {
            if (window.confirm("Are you sure you want to delete this user?")) {
                await userApi.deleteUser(id)
                    .then(() => {
                        fetchUsers();
                    })
                    .catch(err => console.log(err));
            }
        } catch (error) {
            console.log(error);
        }
    }

    const fetchUsers = () => {
        setLoading(true);
        const request = searchTerm.trim() === ""
            ? userApi.getAllUser()
            : userApi.getUserByText(searchTerm);

        request
        .then(res => {
            const receivedData = res.data && res.data.data ? res.data.data : [];
            setUsers(receivedData);
        })
        .catch(err => {
            console.log("Search error:", err);
            setUsers([]);
        })
        .finally(() => setLoading(false));
};

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchUsers();
        }, 500); 

        return () => clearTimeout(delay);
    }, [searchTerm]);

    const userColumns = [
        {
            header: "First Name",
            render: (result) => <span className="font-bold text-gray-800">{result.first_name}{result.last_name}</span>
        },
        {
            header: "Country",
            key: "country"
        },
        {
            header: "District",
            key: "disctric"
        },
        {
            header: "City",
            key: "city"
        },
        {
            header: "Address Line 1",
            key: "addree_line1"
        },
        {
            header: "Address Line 2",
            key: "address_line2"
        },
        {
            header: "Postal Code",
            key: "postal_code"
        },
        {
            header: "Mobile No 1",
            key: "mobile_no_1"
        },
        {
            header: "Mobile No 2",
            key: "mobile_no_2"
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
                        onClick={() => setEditingUser(row)}
                        className="p-2 text-yellow-400 hover:bg-yellow-100 rounded-full transition"
                        title="Edit"
                    >
                        <CiEdit size={24} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => userDelete(row.user_id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                        title="Delete"
                    >
                        <CiTrash size={24} />
                    </button>
                </div>
            )
        }


    ];

    useEffect(() => {
        fetchUsers();

    }, []);

    return (
       <div className="relative min-h-screen bg-white overflow-x-hidden p-6">
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-12 items-center">
            
            <UserRegister
                onUserAdded={fetchUsers}
                editingUser={editingUser}
                setEditingUser={setEditingUser} 
            />

            <div className="w-full ">
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-6">
                    
                    <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                        <FaUser />
                        <span>User Management</span>
                    </h2>
                    
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <CiSearch className="h-6 w-6 text-emerald-500 font-bold" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, city..."
                            className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md transition-all text-gray-700 shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="backdrop-blur-xl p-8 overflow-hidden">
                    <DataTabale columns={userColumns} data={users} />
                </div>
            </div>
        </div>
    </div>
    )
}

export default UserForm;