import React, { useState, useEffect, useMemo } from "react";
import DataTabale from "../components/DataTable";
import { shippingAddressApi, userApi } from "../services/api";
import { CiSearch } from "react-icons/ci";
import { FaSyncAlt } from "react-icons/fa";
import SuperAdminNavbar from "../layout/SuperadminNav";

const UserForm = () => {
    // ============ State ============
    const [users, setUsers] = useState([]);
    const [addresses, setAddresses] = useState([]);

    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    const [userError, setUserError] = useState("");
    const [addressError, setAddressError] = useState("");

    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [addressSearch, setAddressSearch] = useState("");

    // ============ Fetch Users ============
    const fetchUsers = async () => {
        setLoadingUsers(true);
        setUserError("");
        try {
            const req = searchTerm.trim() === ""
                ? userApi.getAllUser()
                : userApi.getUserByText(searchTerm);

            const res = await req;
            console.log("🔍 USERS RES:", res.data.email);

            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.data)
                    ? res.data.data
                    : [];

            setUsers(data);
        } catch (err) {
            console.error("❌ Users fetch:", err.response?.data || err.message);
            setUserError(
                err.response?.data?.mes ||
                err.response?.data?.msg ||
                "Users load කරන්න බැරි වුණා"
            );
            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    // ============ Fetch Shipping Addresses ============
    const fetchAddresses = async () => {
        setLoadingAddresses(true);
        setAddressError("");
        try {
            const res = await shippingAddressApi.getAllShippingAddresses();
            console.log("🔍 ADDRESS RES:", res.data);

            let data = [];
            if (Array.isArray(res.data)) data = res.data;
            else if (Array.isArray(res.data?.data)) data = res.data.data;
            else if (Array.isArray(res.data?.addresses)) data = res.data.addresses;
            else if (Array.isArray(res.data?.shippingAddresses)) data = res.data.shippingAddresses;

            console.log("📍 Addresses count:", data.length);
            if (data.length > 0) console.log("📍 First address:", data[0]);

            setAddresses(data);
        } catch (err) {
            console.error("❌ Addresses fetch:", err.response?.data || err.message);
            setAddressError(
                err.response?.data?.mes ||
                err.response?.data?.msg ||
                "Shipping addresses load කරන්න බැරි වුණා"
            );
            setAddresses([]);
        } finally {
            setLoadingAddresses(false);
        }
    };

    // ============ Effects ============
    useEffect(() => {
        const delay = setTimeout(fetchUsers, 500);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers();
        fetchAddresses();
    }, []);

    // ============ User name lookup (address table එකට) ============
    const userMap = useMemo(() => {
        const m = {};
        users.forEach(u => { m[u.user_id] = u; });
        return m;
    }, [users]);

    // ============ Helper: User ගේ full name එක safely ගන්න ============
    const getUserFullName = (u) => {
        if (!u) return "";
        const first = u.first_name || "";
        const last = u.last_name || "";
        const full = `${first} ${last}`.trim();
        return full || "";
    };

    // ============ USER columns ============
    const userColumns = [
        {
            header: "#",
            render: (r) => {
                const idx = users.findIndex(u => u.user_id === r.user_id);
                return idx + 1;
            }
        },
        {
            header: "Name",
            render: (r) => {
                // Priority: first_name + last_name → recipient_name → "-"
                const fullName = getUserFullName(r);
                if (fullName) {
                    return <span className="font-bold text-gray-800">{fullName}</span>;
                }
                if (r.recipient_name) {
                    return <span className="font-bold text-gray-800">{r.recipient_name}</span>;
                }
                return <span className="text-gray-400 italic">No name</span>;
            }
        },
        {
            header: "Email",
            render: (r) => r.email
                ? <span className="text-gray-700">{r.email}</span>
                : <span className="text-gray-400 italic">-</span>
        },
        {
            header: "Status",
            render: (r) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {r.status === 1 ? "Active" : "Inactive"}
                </span>
            )
        },
    ];

    // ============ ADDRESS columns ============
    const addressColumns = [
        {
            header: "#",
            render: (r) => {
                const idx = addresses.findIndex(a => a.shipping_id === r.shipping_id);
                return idx + 1;
            }
        },
        {
            header: "User",
            render: (r) => {
                const u = userMap[r.user_id];
                const fullName = getUserFullName(u) || r.recipient_name;
                return fullName
                    ? <span className="font-semibold text-gray-800">{fullName}</span>
                    : <span className="text-gray-400">User #{r.user_id}</span>;
            }
        },
        { header: "Recipient", render: (r) => r.recipient_name || "-" },
        { header: "Country", render: (r) => r.country || "-" },
        { header: "District", render: (r) => r.district || r.disctric || "-" },
        { header: "City", render: (r) => r.city || "-" },
        { header: "Address 1", render: (r) => r.address_line_1 || r.addree_line1 || "-" },
        { header: "Address 2", render: (r) => r.address_line_2 || r.address_line2 || "-" },
        { header: "Postal", render: (r) => r.postal_code || "-" },
        { header: "Phone 1", render: (r) => r.phone_number || r.mobile_no_1 || "-" },
{ header: "Phone 2", render: (r) => r.phone_number_2 || r.mobile_no_2 || "-" },  
        {
            header: "Default",

            render: (r) => (r.is_default === 1 || r.is_default === true || r.is_default === "1")
                ? <span className="text-green-600 font-bold">✅</span>
                : <span className="text-gray-300">-</span>
        },
    ];

    // ============ Filtered addresses by search ============
    const filteredAddresses = useMemo(() => {
        if (!addressSearch.trim()) return addresses;
        const q = addressSearch.toLowerCase();
        return addresses.filter(a => {
            const u = userMap[a.user_id];
            const userName = getUserFullName(u).toLowerCase();
            return (
                String(a.user_id).includes(q) ||
                userName.includes(q) ||
                (a.recipient_name || "").toLowerCase().includes(q) ||
                (a.city || "").toLowerCase().includes(q) ||
                (a.district || "").toLowerCase().includes(q) ||
                (a.country || "").toLowerCase().includes(q) ||
                (a.phone_number || "").includes(q)
            );
        });
    }, [addresses, addressSearch, userMap]);

    // ============ Render ============
    return (
        <>
            <SuperAdminNavbar />
            <div className="relative min-h-screen bg-white overflow-x-hidden p-12 mt-12">
                <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-12">

                    {/* ============ USERS TABLE ============ */}
                    <div className="w-full">
                        <div className="flex mb-6 flex-col md:flex-row justify-between items-center gap-4 px-2">
                            <h2 className="text-2xl font-bold text-green-600">
                                👥 Users ({users.length})
                            </h2>

                            <div className="flex gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80 group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CiSearch className="h-6 w-6 text-emerald-500 font-bold" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search users..."
                                        className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <button
                                    onClick={fetchUsers}
                                    className="px-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition"
                                    title="Refresh"
                                >
                                    <FaSyncAlt size={20} />
                                </button>
                            </div>
                        </div>

                        {userError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                ⚠️ {userError}
                            </div>
                        )}

                        <div className="backdrop-blur-xl p-8 overflow-hidden">
                            {loadingUsers ? (
                                <div className="text-center py-10 text-gray-500">Loading users...</div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">No users found</div>
                            ) : (
                                <DataTabale columns={userColumns} data={users} />
                            )}
                        </div>
                    </div>

                    {/* ============ ADDRESSES TABLE ============ */}
                    <div className="w-full">
                        <div className="flex mb-6 flex-col md:flex-row justify-between items-center gap-4 px-2">
                            <h2 className="text-2xl font-bold text-blue-600">
                                📍 Shipping Addresses ({addresses.length})
                            </h2>

                            <div className="flex gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80 group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CiSearch className="h-6 w-6 text-blue-500 font-bold" />
                                    </div>
                                    <input
                                        type="text"
                                        value={addressSearch}
                                        onChange={(e) => setAddressSearch(e.target.value)}
                                        placeholder="Search by user, city, phone..."
                                        className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={fetchAddresses}
                                    className="px-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition"
                                    title="Refresh"
                                >
                                    <FaSyncAlt size={20} />
                                </button>
                            </div>
                        </div>

                        {addressError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                ⚠️ {addressError}
                            </div>
                        )}

                        <div className="backdrop-blur-xl p-8 overflow-hidden">
                            {loadingAddresses ? (
                                <div className="text-center py-10 text-gray-500">Loading addresses...</div>
                            ) : filteredAddresses.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    No shipping addresses found
                                </div>
                            ) : (
                                <DataTabale columns={addressColumns} data={filteredAddresses} />
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default UserForm;