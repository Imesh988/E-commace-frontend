import React, { useState, useEffect, useCallback } from "react";
import DataTabale from "../components/DataTable";
import { categoryAPI } from "../services/api";
import { CiEdit, CiSearch, CiTrash } from "react-icons/ci";
import { TbCategoryPlus } from "react-icons/tb";
import Category from "../pages/Category";
import Navbar from "../layout/Navbar";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:5000";
const IMAGE_PATH = "/public/category/images/";
const FULL_IMAGE_URL = `${BASE_URL}${IMAGE_PATH}`;

const CategoryForm = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await categoryAPI.getAllCategory();
            const receivedData = response.data && response.data.data ? response.data.data : [];
            setCategories(receivedData);
        } catch (error) {
            console.error("Fetch error:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);



const categoryDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
        try {
            await categoryAPI.deleteCategory(id);
            alert("Category deleted successfully!");
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Failed to delete category. Please try again.");
            console.error("Delete failed:", error);
        }
    }
};

    const categoryColumns = [
        {
            header: "Images",
            render: (row) => (
                <div className="flex gap-2">
                    {row.category_img_1 && (
                        <img
                            src={`${FULL_IMAGE_URL}${row.category_img_1}`}
                            alt="img1"
                            className="w-12 h-12 object-cover rounded-xl border-2 border-white shadow-sm"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
                        />
                    )}
                    {row.category_img_2 && (
                        <img
                            src={`${FULL_IMAGE_URL}${row.category_img_2}`}
                            alt="img2"
                            className="w-12 h-12 object-cover rounded-xl border-2 border-white shadow-sm"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
                        />
                    )}
                </div>
            )
        },
        {
            header: "Category Name",
            render: (row) => <span className="font-bold text-gray-800 text-lg">{row.category}</span>
        },
        {
            header: "Description",
            render: (row) => <span className="text-gray-600">{row.description || "-"}</span>
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setEditingCategory(row)}
                        className="p-2 text-yellow-400 hover:bg-yellow-100 rounded-full transition"
                        title="Edit"
                    >
                        <CiEdit size={24} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => categoryDelete(row.category_id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                        title="Delete"
                    >
                        <CiTrash size={24} />
                    </button>
                </div>
            )
        }
    ];

    const filteredCategories = categories.filter(cat =>
        cat.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <div className="relative min-h-screen bg-white overflow-x-hidden p-6 mt-6">
                <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-12 items-center">

                    <Category
                        onCategoryAdded={fetchCategories}
                        editingCategory={editingCategory}
                        cancelEdit={() => setEditingCategory(null)}
                    />

                    <div className="w-full ">

                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-6">

                            <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                                <TbCategoryPlus />
                                <span>Category Management</span>
                            </h2>

                            <div className="relative w-full md:w-96 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <CiSearch className="h-6 w-6 text-emerald-500 font-bold" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by category name..."
                                    className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md transition-all text-gray-700 shadow-sm placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="backdrop-blur-xl p-8 overflow-hidden">
                            <DataTabale columns={categoryColumns} data={filteredCategories} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CategoryForm;