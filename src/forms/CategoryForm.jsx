import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TbCategoryPlus } from "react-icons/tb";
import { IoIosSave } from "react-icons/io";
import { MdCancel, MdUpdate } from "react-icons/md";
import { categoryAPI } from "../services/api";



 const CategoryForm = ({ onCategoryAdded, editingCategory, cancleEdit }) => {

  const [categoryData, setCategoryData] = useState({
    category: "",
    description: "",
    category_img_1: null,
    category_img_2: null,
  });

 
  const isEditing = !!editingCategory?.category_id;

  useEffect(() => {
    if (isEditing) {
      setCategoryData({
        category: editingCategory.category || "",
        description: editingCategory.description || "",
        category_img_1: null,
        category_img_2: null,
      });
    }
  }, [isEditing, editingCategory]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setCategoryData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && !categoryData.category_img_1) {
      toast.error("Category Image is required");
      return;
    }

    const formData = new FormData();
    formData.append("category", categoryData.category);
    formData.append("description", categoryData.description);

    if (categoryData.category_img_1)
      formData.append("category_img_1", categoryData.category_img_1);

    if (categoryData.category_img_2)
      formData.append("category_img_2", categoryData.category_img_2);

    try {
      if (isEditing) {
        await toast.promise(
          categoryAPI.updateCategory(editingCategory.category_id, formData),
          {
            loading: "Updating...",
            success: "Category Updated",
            error: "Update Failed",
          }
        );
      } else {
        await toast.promise(categoryAPI.createCategory(formData), {
          loading: "Saving...",
          success: "Category Saved",
          error: "Save Failed",
        });
      }

      onCategoryAdded();
      resetForm();
      cancleEdit(); 
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setCategoryData({
      category: "",
      description: "",
      category_img_1: null,
      category_img_2: null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex justify-center items-start p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-500 text-white p-3 rounded-xl shadow">
            <TbCategoryPlus size={22} />
          </div>
          <h2 className="text-2xl font-semibold text-emerald-600">
            {isEditing ? "Update Category" : "Add New Category"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Category */}
            <div>
              <label className="text-sm text-gray-500">Category</label>
              <input
                type="text"
                name="category"
                value={categoryData.category}
                onChange={handleChange}
                disabled={isEditing}
                required
                placeholder="Category"
                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-gray-500">Description</label>
              <input
                type="text"
                name="description"
                value={categoryData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2"
              />
            </div>

            {/* Image 1 */}
            <div>
              <label className="text-sm text-gray-500">Category Image 1</label>
              <input
                type="file"
                name="category_img_1"
                onChange={handleChange}
                required={!isEditing}
                className="w-full text-sm mt-2"
              />
            </div>

            {/* Image 2 */}
            <div>
              <label className="text-sm text-gray-500">Category Image 2</label>
              <input
                type="file"
                name="category_img_2"
                onChange={handleChange}
                className="w-full text-sm mt-2"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-10">

            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  cancleEdit();
                }}
                className="flex items-center gap-2 px-6 py-2 rounded-xl
                           border border-gray-300 text-gray-600
                           hover:bg-gray-100 transition"
              >
                <MdCancel size={18} />
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-xl
                         bg-emerald-500 text-white shadow
                         hover:bg-emerald-600 transition"
            >
              {isEditing ? <MdUpdate size={18} /> : <IoIosSave size={18} />}
              {isEditing ? "Update" : "Save"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
