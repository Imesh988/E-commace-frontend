import { useEffect, useState } from "react"
import { BsPencil, BsTrash } from "react-icons/bs";
import { FaShoppingBag } from "react-icons/fa"
import { productAPI } from "../services/api";
import { ProductForm } from "../forms/ProductForm";




export const Product = () => {
   
    const [search, setSearch] = useState("");
    const [product, setProduct] = useState([]);
    const [editProduct ,setEditProduct] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);



    useEffect(() => {
        fetchProduct();
    }, [] );

    const fetchProduct = async () => {
        try {
            const res = await productAPI.getAllProduct();
            setProduct(res.data.data);
            setFilteredData(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Product Load Failed")
        }
    }

    useEffect(() => {
        const filtered = product.filter((p) =>
            p.product_id.toString().includes(search) || 
            p.product_code.toLowerCase().includes(search.toLowerCase()) ||
            p.product_name.toLowerCase().includes(search.toLowerCase())
        );
            setFilteredData(filtered);
    }, [search, product])

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
    
        try {
            await productAPI.deleteProduct(id);

            const updatedList = product.filter(p => p.product_id !== id);

            setProduct(updatedList);
            setFilteredData(updatedList);

            toast.success("Product Deleted");

        } catch (error) {
            console.error(error);
            toast.error("Delete Failed");
        }
    };
    
    
    return (
        <div className="p-6 w-full">
            <ProductForm
                editingProduct={editProduct}
                refreshProducts={fetchProduct}
                cancelEdit={() => setEditProduct(null)}
            />

            
            <div className=" w-full min-h-screen bg-white rounded-xl shadow-md mt-6 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-4xl font-semibold text-green-600 flex items-center gap-2">
                        <FaShoppingBag size={22}/>
                        Product Management
                    </h1>

                    <input
                            type="text"
                            placeholder="Search by ProductId, Product Code and Product Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border rounded-full w-72 focus:outline-none
                                    focus:ring-2 focus:ring-green-400"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b text-gray-500 uppercase">
                                <th className="px-4 py-3 text-left">Product Id</th>
                                <th className="px-4 py-3 text-left">Product Code</th>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-left">Price</th>
                                <th className="px-4 py-3 text-left">Product colors</th>
                                <th className="px-4 py-3 text-left">Action</th>
                        </thead>
                        <tbody>
                            {
                                filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-gray-400"> No Data Found. </td>
                                    </tr>
                                ): (
                                    filteredData.map((product) => (
                                        <tr 
                                            key={product.product_id}
                                            onClick={() => setSelectedRow(product.product_id)}
                                            className="border-b odd:bg-emerald-100 even:bg-white hover:bg-emerald-300 ">

                                            
                                            <td className="px-4 py-3">{product.product_id}</td>
                                            <td className="px-4 py-3">{product.product_code}</td>
                                            <td className="px-4 py-3">{product.product_name}</td>
                                            <td className="px-4 py-3">{product.category_id}</td>
                                            <td className="px-4 py-3">{product.price}</td>
                                            <td className="px-4 py-3">{product.product_colors}</td>

                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <button 
                                                        onClick={() => {
                                                            setEditProduct(product);
                                                            setSelectedRow(product.product_id);
                                                        }}
                                                        className="p-2 rounded border border-amber-400
                                                               hover:bg-amber-400 hover:text-white">
                                                        
                                                        <BsPencil/>
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            deleteProduct(product.product_id)
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
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}