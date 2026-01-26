import { useEffect, useState } from "react"
import { FaBox, FaShoppingBag } from "react-icons/fa"
import { IoIosSave } from "react-icons/io";
import { MdCancel, MdUpdate } from "react-icons/md";
import { productAPI } from "../services/api";
import toast from "react-hot-toast";
import { categoryAPI } from "../services/api";



export const ProductForm = ({
    editingProduct,
    refreshProducts,
    cancelEdit
}) => {
    const [category, setCategory] = useState([]);
    useEffect(() => {
        const fetchCategory = async () => {
            try{
                const res = await categoryAPI.getAllCategory();
                setCategory(res.data.data);
            } catch (error) {
                console.error("Category Load Failed", error)
            }
        };
        fetchCategory();
    }, [] );

    useEffect(() => {
        if (editingProduct) {
            setProductData(editingProduct);
        }
    }, [editingProduct]);
    

    const [productData, setProductData] = useState({
        product_id: "",
        product_code: "",
        product_name: "",
        category_id: "",
        price: "",
        product_colors: "",
        status: 1,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev => ({
            ...prev,
            [name] : value,
        })));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            if (editingProduct) {
                const { product_id, ...payload } = productData;
                await productAPI.updateProduct(product_id, payload);
            } else {
                await productAPI.createProduct(productData);
                toast.success("Product Added");
            }
    
            refreshProducts();
            cancelEdit();
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Save Failed");
        }
    };
    
    const resetForm = () => {
        setProductData({
            product_id: "",
            product_code: "",
            product_name: "",
            category_id: "",
            price: "",
            product_colors: "",
            status: 1,
        });
    };
    
    return(
        <>
        <div className=" bg-gradient-to-br from-emerald-50 to-white flex justify-center items-start p-6">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-8">

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-emerald-500 text-white p-3 rounded-xl shadow">
                        <FaShoppingBag size={22}/>
                    </div>
                    <h1 className="text-4xl font-semibold text-emerald-600">
                        {editingProduct ? "Update Product" : "Add New Product"}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} >
                    <div className=" grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">
                        <div className="">
                            <label htmlFor="" className="text-xl text-gray-500">Product Id</label>
                            <input 
                                type="text"
                                name="product_id" 
                                value={productData.product_id}
                                onChange={handleChange}
                                required
                                placeholder="Ex : 1001"
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2" />
                        </div>

                        <div>
                            <label htmlFor="" className="text-xl text-gray-500">Product Code</label>
                            <input 
                                type="text"
                                name="product_code" 
                                value={productData.product_code}
                                onChange={handleChange}
                                required
                                placeholder=" Ex : LAP10"
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2" />
                        </div>

                        <div>
                            <label htmlFor="" className="text-xl text-gray-500">Product</label>
                            <input 
                                type="text"
                                name="product_name" 
                                value={productData.product_name}
                                onChange={handleChange}
                                required
                                placeholder=" Ex : 8th Gen Laptop  "
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2" />
                        </div>

                        <div>
                            <label htmlFor="" className="text-xl text-gray-500">Category</label>
                            <select 
                                name="category_id" 
                                value={productData.category_id}
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2"
                                onChange={handleChange}>
                                <option value=""> --Select a category--</option>
                                {
                                    category.map((cat) => (
                                       <option key={cat.category_id} value={cat.category_id}>
                                            {cat.category}
                                       </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div>
                            <label htmlFor="" className="text-xl text-gray-500">Price</label>
                            <input 
                                type="text"
                                name="price" 
                                value={productData.price}
                                onChange={handleChange}
                                required
                                placeholder="EX: Rs 150 000 / $5000"
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2" />
                        </div>

                        <div>
                            <label htmlFor="" className="text-xl text-gray-500">Product Colors</label>
                            <input 
                                type="text"
                                name="product_colors" 
                                value={productData.product_colors}
                                onChange={handleChange}
                                required
                                placeholder=" Ex: Silver, Black, Red"
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2" />
                        </div>

                        <div>
                            <label htmlFor="" className="text-xl text-gray-500">Status</label>
                            <select 
                                name="status" 
                                value={productData.status}
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2"
                                onChange={handleChange} >
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                            </select>
                        </div>

                        
                    </div>

                    <div className="flex justify-end gap-4 mt-10">
                    <button
                        type="button"
                        onClick={() => {
                            cancelEdit();
                            resetForm();
                        }}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                        <MdCancel size={18} />
                        Cancel
                    </button>


                        <button 
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 text-white shadow hover:bg-emerald-600 transition">
                                 {editingProduct ? <MdUpdate size={18} /> : <IoIosSave size={18} />}
                                {editingProduct ? "Update" : "Save"}
                            </button>
                    </div>
                </form>

            </div>
        </div>

        </>

       
  
    )
}