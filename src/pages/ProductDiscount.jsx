
import { useEffect, useState } from "react";
import { CiDiscount1 } from "react-icons/ci";
import { ProductDiscountForm } from "../forms/ProductDiscountForm";
import { discountAPI } from "../services/api";
import toast from "react-hot-toast";
import { BsPencil, BsTrash } from "react-icons/bs";
import { productAPI } from "../services/api";

export const ProductDiscount = () => {

    const [search, setSearch] = useState("");
    const [discounts, setDiscounts] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [editDiscount ,setEditDiscount] = useState(null);
    const [products, setProducts] = useState([]);


    useEffect(() => {
        fetchDiscounts();
        loadProducts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const res = await discountAPI.getAllProductDiscount();
            setDiscounts(res.data.data);
            setFilteredData(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Discount Load Failed")
        }
    };

    
    const loadProducts = async () => {
        try {
            const res = await productAPI.getAllProduct();
            setProducts(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    
    
    

    useEffect(() => {
        const keyword = search.toLowerCase();
    
        const filtered = discounts.filter((item) => {
            const productName =
                products.find(p => p.product_id === item.product_id)?.product_name
                    ?.toLowerCase() || "";
    
            return (
                productName.includes(keyword) ||
                item.discount_type.toLowerCase().includes(keyword)
            );
        });
    
        setFilteredData(filtered);
    }, [search, discounts, products]);
    

    const deleteDiscount = async (id) => {
        console.log("Deleting ID:", id);
        
        if (!window.confirm("Are you sure you want to delete this discount?")) return;

        try {
            await discountAPI.deleteProductDiscount(id);
           const updatedList = discounts.filter(d => d.id !== id);


            setDiscounts(updatedList)
            setFilteredData(updatedList);

            toast.success("Product Deleted");
        } catch (error) {
            console.error(error);
            toast.error("Delete Failed");
        }
    }


    return (
        <div className="p-6 w-full">
            <ProductDiscountForm
                 refresh={fetchDiscounts}
                editingDiscount={editDiscount}
                onCancel={() => setEditDiscount(null)}
            />

            <div className=" w-full min-h-screen bg-white rounded-xl shadow-md mt-6 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-4xl font-semibold text-green-600 flex items-center gap-2">
                        <CiDiscount1 size={26} />
                        Discount Management
                    </h1>

                    <input
                            type="text"
                            placeholder="Search by ProductId & Discount Type..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border rounded-full w-72 focus:outline-none
                                    focus:ring-2 focus:ring-green-400"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Discount Type</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                               
                        </thead>

                        <tbody>
                            {
                                filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-gray-400"> No Data Found. </td>
                                    </tr>
                                ): (
                                    filteredData.map((discount) => (
                                        <tr 
                                            key={discount.id}
                                            onClick={() => setSelectedRow(discount.id)}
                                            className="border-b odd:bg-emerald-100 even:bg-white hover:bg-emerald-300"
                                        >
                                            <td className="px-4 py-3">
                                                {
                                                    products.find(p => p.product_id === discount.product_id)?.product_name 
                                                    || discount.product_id
                                                }
                                            </td>


                                            <td className="px-4 py-3">{discount.discount_type}</td>
                                            <td className="px-4 py-3">{discount.discount_amount}</td>
                                    
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditDiscount(discount);
                                                    }}
                                                    className="p-2 rounded border border-amber-400 hover:bg-amber-400 hover:text-white"
                                                >
                                                    <BsPencil />
                                                </button>

                                    
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteDiscount(discount.id);
                                                        }}
                                                        className="p-2 rounded border border-red-500 hover:bg-red-500 hover:text-white"
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