import React, { useEffect, useState } from "react";
import { sellerApi } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clsx from "clsx";
import {
    IoSearchOutline,
    IoRefreshOutline,
    IoChevronBack,
    IoChevronForward,
    IoBusinessOutline,
    IoPersonOutline,
    IoMailOutline,
    IoCallOutline,
    IoCheckmarkCircle,
    IoSettingsOutline,
    IoTimeOutline,
    IoCloseCircleOutline,
    IoTrashOutline,
    IoCheckmarkDoneCircle,
    IoListOutline,
} from "react-icons/io5";
import { TbUser } from "react-icons/tb";
import SuperAdminNavbar from "../layout/SuperadminNav";
import axiosInstance from "../api/axiosConfig";

const SellerApprovalList = () => {
    const [sellers, setSellers] = useState([]);
    const [filteredSellers, setFilteredSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [updatingId, setUpdatingId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [activeTab, setActiveTab] = useState("all"); // all, pending, approved, rejected

    const userRole = localStorage.getItem("role");
    const isSuperAdmin = userRole === "super_admin";

    // Profile fetch
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/auth/verify-profile');
                setProfile(res.data);
            } catch (err) {
                console.error("Profile fetch error:", err);
            }
        };
        fetchProfile();
    }, []);

    // Sellers load කිරීම
    const fetchSellers = async () => {
        setLoading(true);
        try {
            const res = await sellerApi.getAllSellersWithStatus();
            const data = res.data?.data || [];
            setSellers(data);
            // Filtering will be done in useEffect
        } catch (error) {
            toast.error("Failed to load sellers");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    // Search & Tab Filter
    useEffect(() => {
        let filtered = sellers.filter((seller) => {
            const search = searchTerm.toLowerCase();
            const matchesSearch =
                seller.business_name?.toLowerCase().includes(search) ||
                seller.owner_name?.toLowerCase().includes(search) ||
                seller.email?.toLowerCase().includes(search) ||
                seller.seller_id?.toLowerCase().includes(search);
            if (!matchesSearch) return false;

            // Tab filter
            if (activeTab === "all") return true;
            if (activeTab === "pending") return seller.status === 2;
            if (activeTab === "approved") return seller.status === 1;
            if (activeTab === "rejected") return seller.status === 3;
            return true;
        });
        setFilteredSellers(filtered);
        setCurrentPage(1);
    }, [searchTerm, sellers, activeTab]);

    // Status Update Handler with Confirmation Modal
    const handleStatusChange = async (sellerId, newStatus) => {
        if (!isSuperAdmin) {
            toast.warning("Only Super Admin can change status!");
            return;
        }

        const statusNames = {
            0: "Deleted",
            1: "Approved",
            2: "Pending",
            3: "Rejected",
        };

        const statusColors = {
            0: "text-gray-600",
            1: "text-emerald-600",
            2: "text-yellow-600",
            3: "text-rose-600",
        };

        setConfirmAction({
            sellerId,
            newStatus,
            statusName: statusNames[newStatus],
            statusColor: statusColors[newStatus],
        });
        setShowConfirmModal(true);
    };

    const confirmStatusChange = async () => {
        if (!confirmAction) return;

        const { sellerId, newStatus, statusName } = confirmAction;
        setShowConfirmModal(false);
        setUpdatingId(sellerId);

        try {
            const response = await sellerApi.updateSellerStatus(sellerId, newStatus);
            toast.success(response.data?.msg || `Status updated to "${statusName}"!`);

            setSellers((prev) =>
                prev.map((seller) =>
                    seller.seller_id === sellerId
                        ? { ...seller, status: newStatus }
                        : seller
                )
            );
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data?.msg || `Failed to update status: ${error.response.status}`);
            } else if (error.request) {
                toast.error('Server not responding. Please check your connection.');
            } else {
                toast.error('Failed to send request. Please try again.');
            }
        } finally {
            setUpdatingId(null);
            setConfirmAction(null);
        }
    };

    const cancelConfirm = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    // Status Color & Label
    const getStatusInfo = (status) => {
        const statusMap = {
            0: { label: "Deleted", color: "bg-gray-100 text-gray-600", icon: IoTrashOutline },
            1: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: IoCheckmarkDoneCircle },
            2: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: IoTimeOutline },
            3: { label: "Rejected", color: "bg-rose-100 text-rose-700", icon: IoCloseCircleOutline },
        };
        return statusMap[status] || statusMap[0];
    };

    // Counts for tabs
    const getCounts = () => {
        const total = sellers.length;
        const pending = sellers.filter(s => s.status === 2).length;
        const approved = sellers.filter(s => s.status === 1).length;
        const rejected = sellers.filter(s => s.status === 3).length;
        return { total, pending, approved, rejected };
    };

    const counts = getCounts();

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSellers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // Loading State
    if (loading) {
        return (
            <>
                <SuperAdminNavbar onLogout={handleLogout} profile={profile} />
                <div className="relative min-h-screen bg-white overflow-x-hidden p-6 mt-5">
                    <div className="flex flex-col justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading sellers...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <SuperAdminNavbar onLogout={handleLogout} profile={profile} />

            <div className="relative min-h-screen bg-white overflow-x-hidden p-6 mt-5">
                {/* Background Circles */}
                <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-12 items-center">
                    <div className="w-full">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6 px-6">
                            <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                                {/* You can add icon/title here if needed */}
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

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 px-6 mb-6">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={clsx(
                                    "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2",
                                    activeTab === "all"
                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                <IoListOutline size={16} />
                                All
                                <span className={clsx(
                                    "ml-1 px-2 py-0.5 rounded-full text-xs",
                                    activeTab === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                                )}>
                                    {counts.total}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("pending")}
                                className={clsx(
                                    "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2",
                                    activeTab === "pending"
                                        ? "bg-yellow-500 text-white shadow-md shadow-yellow-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                <IoTimeOutline size={16} />
                                Pending
                                <span className={clsx(
                                    "ml-1 px-2 py-0.5 rounded-full text-xs",
                                    activeTab === "pending" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                                )}>
                                    {counts.pending}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("approved")}
                                className={clsx(
                                    "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2",
                                    activeTab === "approved"
                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                <IoCheckmarkDoneCircle size={16} />
                                Approved
                                <span className={clsx(
                                    "ml-1 px-2 py-0.5 rounded-full text-xs",
                                    activeTab === "approved" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                                )}>
                                    {counts.approved}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("rejected")}
                                className={clsx(
                                    "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2",
                                    activeTab === "rejected"
                                        ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                <IoCloseCircleOutline size={16} />
                                Rejected
                                <span className={clsx(
                                    "ml-1 px-2 py-0.5 rounded-full text-xs",
                                    activeTab === "rejected" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                                )}>
                                    {counts.rejected}
                                </span>
                            </button>
                        </div>

                        {/* Table Wrapper */}
                        <div className="backdrop-blur-xl p-8 overflow-hidden rounded-[40px]">
                            {filteredSellers.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📭</div>
                                    <h3 className="text-2xl font-bold text-gray-700">No Sellers Found</h3>
                                    <p className="text-gray-500 mt-2">
                                        {searchTerm ? "Try adjusting your search" : "No sellers in this category"}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            {/* Professional Header with Icons */}
                                            <thead className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b-2 border-emerald-200 rounded-t-xl">
                                                <tr>
                                                    <th className="px-6 py-4 text-left rounded-tl-xl">
                                                        <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                                                            <IoBusinessOutline size={16} className="text-emerald-600" />
                                                            Business
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-left">
                                                        <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                                                            <IoPersonOutline size={16} className="text-emerald-600" />
                                                            Owner
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-left hidden md:table-cell">
                                                        <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                                                            <IoMailOutline size={16} className="text-emerald-600" />
                                                            Contact
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-left">
                                                        <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                                                            <IoCheckmarkCircle size={16} className="text-emerald-600" />
                                                            Status
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-center rounded-tr-xl">
                                                        <div className="flex items-center justify-center gap-2.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                                                            <IoSettingsOutline size={16} className="text-emerald-600" />
                                                            Actions
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {currentItems.map((seller) => {
                                                    const statusInfo = getStatusInfo(seller.status);
                                                    const StatusIcon = statusInfo.icon;
                                                    return (
                                                        <tr key={seller.seller_id} className="hover:bg-emerald-50/50 transition duration-150 group">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="font-medium text-gray-900">
                                                                    {seller.business_name}
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    {seller.seller_id}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-700">
                                                                    {seller.owner_name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                                                    <IoMailOutline size={14} className="text-gray-400" />
                                                                    {seller.email}
                                                                </div>
                                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <IoCallOutline size={14} className="text-gray-400" />
                                                                    {seller.mobile_no}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={clsx(
                                                                    "px-3 py-1.5 text-xs font-semibold rounded-full inline-flex items-center gap-1.5",
                                                                    statusInfo.color
                                                                )}>
                                                                    <StatusIcon size={14} />
                                                                    {statusInfo.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                {isSuperAdmin ? (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        {updatingId === seller.seller_id ? (
                                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                                                                        ) : (
                                                                            <>
                                                                                {/* Approve Button */}
                                                                                <button
                                                                                    onClick={() => handleStatusChange(seller.seller_id, 1)}
                                                                                    disabled={seller.status === 1}
                                                                                    className={clsx(
                                                                                        "p-2 rounded-lg transition-all duration-200",
                                                                                        seller.status === 1
                                                                                            ? "bg-emerald-100 text-emerald-400 cursor-not-allowed"
                                                                                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-110 hover:shadow-md"
                                                                                    )}
                                                                                    title="Approve"
                                                                                >
                                                                                    <IoCheckmarkDoneCircle size={18} />
                                                                                </button>

                                                                                {/* Pending Button */}
                                                                                <button
                                                                                    onClick={() => handleStatusChange(seller.seller_id, 2)}
                                                                                    disabled={seller.status === 2}
                                                                                    className={clsx(
                                                                                        "p-2 rounded-lg transition-all duration-200",
                                                                                        seller.status === 2
                                                                                            ? "bg-yellow-100 text-yellow-400 cursor-not-allowed"
                                                                                            : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:scale-110 hover:shadow-md"
                                                                                    )}
                                                                                    title="Set Pending"
                                                                                >
                                                                                    <IoTimeOutline size={18} />
                                                                                </button>

                                                                                {/* Reject Button */}
                                                                                <button
                                                                                    onClick={() => handleStatusChange(seller.seller_id, 3)}
                                                                                    disabled={seller.status === 3}
                                                                                    className={clsx(
                                                                                        "p-2 rounded-lg transition-all duration-200",
                                                                                        seller.status === 3
                                                                                            ? "bg-rose-100 text-rose-400 cursor-not-allowed"
                                                                                            : "bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-110 hover:shadow-md"
                                                                                    )}
                                                                                    title="Reject"
                                                                                >
                                                                                    <IoCloseCircleOutline size={18} />
                                                                                </button>

                                                                                {/* Delete Button */}
                                                                                <button
                                                                                    onClick={() => handleStatusChange(seller.seller_id, 0)}
                                                                                    disabled={seller.status === 0}
                                                                                    className={clsx(
                                                                                        "p-2 rounded-lg transition-all duration-200",
                                                                                        seller.status === 0
                                                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-110 hover:shadow-md"
                                                                                    )}
                                                                                    title="Delete"
                                                                                >
                                                                                    <IoTrashOutline size={18} />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                                                        Read Only
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4 mt-4 rounded-b-2xl">
                                            <div className="text-sm text-gray-500">
                                                Showing {indexOfFirstItem + 1} -{" "}
                                                {Math.min(indexOfLastItem, filteredSellers.length)} of{" "}
                                                {filteredSellers.length}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => paginate(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className={clsx(
                                                        "p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition",
                                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                                    )}
                                                >
                                                    <IoChevronBack size={16} />
                                                </button>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => paginate(page)}
                                                        className={clsx(
                                                            "px-3 py-1 rounded-lg text-sm font-medium transition",
                                                            currentPage === page
                                                                ? "bg-emerald-600 text-white"
                                                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                                        )}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => paginate(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className={clsx(
                                                        "p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition",
                                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                                    )}
                                                >
                                                    <IoChevronForward size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {showConfirmModal && confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all scale-100">
                        <div className="text-center">
                            <div className={clsx(
                                "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4",
                                confirmAction.newStatus === 1 ? "bg-emerald-100" :
                                confirmAction.newStatus === 2 ? "bg-yellow-100" :
                                confirmAction.newStatus === 3 ? "bg-rose-100" :
                                "bg-gray-100"
                            )}>
                                {confirmAction.newStatus === 1 && <IoCheckmarkDoneCircle size={32} className="text-emerald-600" />}
                                {confirmAction.newStatus === 2 && <IoTimeOutline size={32} className="text-yellow-600" />}
                                {confirmAction.newStatus === 3 && <IoCloseCircleOutline size={32} className="text-rose-600" />}
                                {confirmAction.newStatus === 0 && <IoTrashOutline size={32} className="text-gray-600" />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Confirm Status Change
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to change this seller's status to{" "}
                                <span className={clsx(
                                    "font-bold",
                                    confirmAction.statusColor
                                )}>
                                    "{confirmAction.statusName}"
                                </span>
                                ?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={cancelConfirm}
                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmStatusChange}
                                    className={clsx(
                                        "px-6 py-2.5 rounded-xl font-medium text-white transition shadow-md hover:shadow-lg",
                                        confirmAction.newStatus === 1 ? "bg-emerald-600 hover:bg-emerald-700" :
                                        confirmAction.newStatus === 2 ? "bg-yellow-600 hover:bg-yellow-700" :
                                        confirmAction.newStatus === 3 ? "bg-rose-600 hover:bg-rose-700" :
                                        "bg-gray-600 hover:bg-gray-700"
                                    )}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default SellerApprovalList;