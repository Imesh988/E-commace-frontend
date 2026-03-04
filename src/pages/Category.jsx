import React, { useEffect, useState } from "react";
import { TbCategoryPlus } from "react-icons/tb";
import toast from 'react-hot-toast';
import { categoryAPI } from "../services/api";
import Button from "../components/Button";
import TextField from "../components/TextField";

const Category = ({ onCategoryAdded, editingCategory, cancelEdit }) => {
  const IMAGE_BASE_URL = "http://localhost:5000/public/category/images/";

  const [categoryData, setCategoryData] = useState({
    category: "",
    description: "",
    category_img_1: null,
    category_img_2: null,
  });

  const [loading, setLoading] = useState(false);
  const isEditing = !!editingCategory?.category_id;

  const [previewImage1, setPreviewImage1] = useState(null);
  const [previewImage2, setPreviewImage2] = useState(null);

  useEffect(() => {
    if (isEditing && editingCategory) { 
      setCategoryData({
        category: editingCategory.category || "",
        description: editingCategory.description || "",
        category_img_1: null, 
        category_img_2: null,
      });

      setPreviewImage1(editingCategory.category_img_1 ? `${IMAGE_BASE_URL}${editingCategory.category_img_1}` : null);
      setPreviewImage2(editingCategory.category_img_2 ? `${IMAGE_BASE_URL}${editingCategory.category_img_2}` : null);

    } else {
      resetForm();
    }
  }, [isEditing, editingCategory]); 

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) { 
      const file = files[0];
      setCategoryData((prev) => ({
        ...prev,
        [name]: file,
      }));
      if (name === "category_img_1") {
        setPreviewImage1(file ? URL.createObjectURL(file) : null);
      } else if (name === "category_img_2") {
        setPreviewImage2(file ? URL.createObjectURL(file) : null);
      }
    } else { 
      setCategoryData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("category", categoryData.category);
    formData.append("description", categoryData.description);

    if (categoryData.category_img_1) {
      formData.append("category_img_1", categoryData.category_img_1);
    } else if (isEditing && editingCategory.category_img_1) {
      formData.append("keep_category_img_1", "true");
    }

    if (categoryData.category_img_2) {
      formData.append("category_img_2", categoryData.category_img_2);
    } else if (isEditing && editingCategory.category_img_2) {
      formData.append("keep_category_img_2", "true");
    }


    try {
      if (!isEditing && !categoryData.category_img_1) {
        toast.error("Category Image 1 is required!");
        setLoading(false);
        return;
      }

      const promise = isEditing
        ? categoryAPI.updateCategory(editingCategory.category_id, formData)
        : categoryAPI.createCategory(formData);

      await toast.promise(promise, {
        loading: isEditing ? 'Updating Category...' : 'Saving Category...',
        success: <b>{isEditing ? 'Updated Successfully!' : 'Saved Successfully!'}</b>,
        error: (err) => {
          console.error("API error:", err);
          return <b>{err.response?.data?.message || 'Could not save.'}</b>;
        },
      });

      onCategoryAdded();
      resetForm();
      if (cancelEdit) cancelEdit();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCategoryData({
      category: "",
      description: "",
      category_img_1: null,
      category_img_2: null,
    });
    setPreviewImage1(null); 
    setPreviewImage2(null); 
  };

  const handleCancel = () => {
    resetForm();
    if (cancelEdit) { 
        cancelEdit(); 
    }
  };

  return (
    <div className="relative z-10 w-full max-w-5xl bg-white/80 backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 text-white">
          <TbCategoryPlus size={24} />
        </div>
        <h2 className="text-2xl font-bold text-emerald-700">
          {isEditing ? "Update Category" : "Add New Category"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-12">

          <TextField
            label="Category Name"
            type="text"
            name="category"
            value={categoryData.category}
            onChange={handleChange}
            required
            disabled={isEditing}
            placeholder="Ex: Electronics"
          />

          <TextField
            label="Description"
            type="text"
            name="description"
            value={categoryData.description}
            onChange={handleChange}
            placeholder="Brief description about the category..."
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400">Category Image 1 (Required)</label>
                <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  {previewImage1 && ( 
                <img
                  src={previewImage1}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
                  alt="Category 1 Preview"
                />
              )}
              <input
                type="file"
                name="category_img_1"
                onChange={handleChange}
                required={!isEditing && !editingCategory?.category_img_1} 
                className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
              />
               {!previewImage1 && !categoryData.category_img_1 && (
                    <span className="text-gray-500 text-sm">No file selected</span>
                )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400">Category Image 2 (Optional)</label>
            <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              {previewImage2 && ( 
                <img
                  src={previewImage2}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
                  alt="Category 2 Preview"
                />
              )}
              <input
                type="file"
                name="category_img_2"
                onChange={handleChange}
                className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
              />
              {!previewImage2 && !categoryData.category_img_2 && (
                    <span className="text-gray-500 text-sm">No file selected</span>
                )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">

            <Button
              title="Cancel"
              variant="outline"
              icon="✕"
              onClick={handleCancel}
              type="button"
            />

          <Button
            title={loading ? "Processing..." : (isEditing ? "Update Category" : "Save Category")}
            variant={isEditing ? "warning" : "primary"}
            icon={isEditing ? "✏️" : "💾"}
            type="submit"
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default Category;