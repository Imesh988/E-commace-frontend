import { useCallback, useEffect, useState } from "react";
import CategoryForm from "../forms/CategoryForm";
import toast from "react-hot-toast";
import { TbCategoryPlus } from "react-icons/tb";
import { BsPencil, BsTrash } from "react-icons/bs";
import { categoryAPI } from "../services/api";

export const Category = () => {

    const [categoryData, setCategoryData] = useState([]);
    const [editCategory, setEditCategory] = useState(null);
    const [search, setSearch] = useState("");

    const fetchCategory = useCallback(async () => {
        try {
            const response = await categoryAPI.getAllCategory();
            setCategoryData(response.data.data);
        } catch (error) {
            console.error("Category Loading Failed.", error);
        }
    }, []);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    const filteredData = categoryData.filter(cat =>
        cat.category.toLowerCase().includes(search.toLowerCase())
    );

    const deleteCategory = (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            const deletePromise = categoryAPI.deleteCategory(id);

            toast.promise(deletePromise, {
                loading: "Deleting category...",
                success: "Category deleted successfully",
                error: "Delete failed",
            }).then(fetchCategory);
        }
    };

    return (
        <div className="p-6">

            {/* FORM */}
            <CategoryForm
                onCategoryAdded={fetchCategory}
                editingCategory={editCategory}
                cancleEdit={() => setEditCategory(null)}
            />

            {/* LIST CARD */}
            <div className="bg-white rounded-xl shadow-md mt-6 p-6">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-green-600 flex items-center gap-2">
                        <TbCategoryPlus size={22} />
                        Category Management
                    </h1>

                    <input
                        type="text"
                        placeholder="Search by category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border rounded-full w-72 focus:outline-none
                                   focus:ring-2 focus:ring-green-400"
                    />
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-left">Description</th>
                                <th className="px-4 py-3 text-left">Image</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-10 text-gray-400"
                                    >
                                        No data found.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((category) => (
                                    <tr
                                        key={category.category_id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            {category.category}
                                        </td>

                                        <td className="px-4 py-3">
                                            {category.description}
                                        </td>

                                        <td className="px-4 py-3">
                                            {category.category_img_1 || "-"}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-3">

                                                <button
                                                    onClick={() => setEditCategory(category)}
                                                    className="p-2 rounded border border-amber-400
                                                               hover:bg-amber-400 hover:text-white"
                                                >
                                                    <BsPencil />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteCategory(category.category_id)
                                                    }
                                                    className="p-2 rounded border border-red-500
                                                               hover:bg-red-500 hover:text-white"
                                                >
                                                    <BsTrash />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
