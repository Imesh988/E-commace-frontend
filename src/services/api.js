import axios from "axios";

const httpRequest = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

export const userApi = {
    createUser: (user) => httpRequest.post("/user/create", user),
    getAllUser: () => httpRequest.get("/user/all"),
    getUserById: (userId) => httpRequest.get(`/user/id/${userId}`),
    getUserByText: (text) => httpRequest.get(`/user/search/${text}`),
    updateUser: (user, userId) => httpRequest.put(`/user/update/${userId}`, user),
    deleteUser: (userId) => httpRequest.delete(`/user/delete/${userId}`),
}


export const roleApi = {
    createRole: (role) => httpRequest.post("/role/create", role),
    getAllRole: () => httpRequest.get("/role/all"),
    getRoleById: (roleId) => httpRequest.get(`/role/id/${roleId}`),
    getRoleByText: (text) => httpRequest.get(`/role/search/${text}`),
    updateRole: (role, roleId) => httpRequest.put(`/role/update/${roleId}`, role),
    deleteRole: (roleId) => httpRequest.delete(`/role/delete/${roleId}`),
}

export const superAdminApi = {
    createSuperAdmin: (superAdmin) => httpRequest.post("/superAdmin/create", superAdmin),
    getAllSuperAdmin: () => httpRequest.get("/superAdmin/all"),
    getSuperAdminById: (superAdminId) => httpRequest.get(`/superAdmin/id/${superAdminId}`),
    getSuperAdminByText: (text) => httpRequest.get(`/superAdmin/search/${text}`),
    updateSuperAdmin: (superAdmin, superAdminId) => httpRequest.put(`/superAdmin/update/${superAdminId}`, superAdmin),
    deleteSuperAdmin: (superAdminId) => httpRequest.delete(`/superAdmin/delete/${superAdminId}`),
    superAdminLogin: (superAdmin) => httpRequest.post("/super-admin/login", superAdmin),
}

export const sellerApi = {
    createSeller: (seller) => httpRequest.post("/seller/create", seller),
    getAllSeller: () => httpRequest.get("/seller/all"),
    getSellerById: (sellerId) => httpRequest.get(`/seller/id/${sellerId}`),
    getSellerByText: (text) => httpRequest.get(`/seller/text/${text}`),
    updateSeller: (seller, sellerId) => httpRequest.put(`/seller/update/${sellerId}`, seller),
    deleteSeller: (sellerId) => httpRequest.delete(`/seller/delete/${sellerId}`),
}

export const supplierApi = {
    createSupplier: (supplier) => httpRequest.post("/supplier/create", supplier),
    getAllSupplier: () => httpRequest.get("/supplier/all"),
    getSupplierById: (supplierId) => httpRequest.get(`/supplier/id/${supplierId}`),
    getSupplierByText: (text) => httpRequest.get(`/supplier/search/${text}`),
    updateSupplier: (supplier, supplierId) => httpRequest.put(`/supplier/update/${supplierId}`, supplier),
    deleteSupplier: (supplierId) => httpRequest.delete(`/supplier/delete/${supplierId}`),
}

export const sellerHasRoleApi = {
    createSellerHasRole: (sellerHasRole) => httpRequest.post("/sellerHasRole/create", sellerHasRole),
    getAllSellerhasRole: () => httpRequest.get("/sellerHasRole/all"),
    getSellerhasRoleById: (sellerHasRoleId) => httpRequest.get("/sellerHasRole/id", sellerHasRoleId),
    getSellerhasRoleByText: (text) => httpRequest.get(`/sellerHasRole/search/${text}`),
    updateSellerhasRole: (sellerHasRole, sellerHasRoleId) => httpRequest.put(`/sellerHasRole/update/${sellerHasRoleId}`, sellerHasRole),
    deleteSellerHasRole: (sellerHasRoleId) => httpRequest.delete(`/sellerHasRole/delete/${sellerHasRoleId}`)

}

export const stockApi = {
    createStock: (stock) => httpRequest.post("/stock/create", stock),
    getAllStock: () => httpRequest.get("/stock/all"),
    getStockById: (stockId) => httpRequest.get(`/stock/id/${stockId}`),
    getStockByText: (text) => httpRequest.get(`/stock/text/${text}`),
    updateStock: (stock, stockId) => httpRequest.put(`/stock/update/${stockId}`, stock),
    deleteStock: (stockId) => httpRequest.delete(`/stock/delete/${stockId}`)

}


export const grnApi = {
    createGrn: (grn) => httpRequest.post("/grn/create", grn),
    getAllGrn: () => httpRequest.get("/grn/all"),
    getGrnById: (grnId) => httpRequest.get(`/grn/id/${grnId}`),
    getGrnByText: (text) => httpRequest.get(`/grn/text/${text}`),
    updateGrn: (grn, grnId) => httpRequest.put(`/grn/update/${grnId}`, grn),
    deleteGrn: (grnId) => httpRequest.delete(`/grn/delete/${grnId}`)
}

export const productApi = {
    createProduct: (product) => httpRequest.post("/product/create", product),
    getAllProduct: () => httpRequest.get("/product/all"),
    getProductById: (productId) => httpRequest.get(`/product/id/${productId}`),
    getProductByText: (text) => httpRequest.get(`/product/search/${text}`),
    updateProduct: (productId, product) => httpRequest.put(`/product/update/${productId}`, product), 
    deleteProduct: (productId) => httpRequest.delete(`/product/delete/${productId}`)
}

export const categoryAPI = {
    createCategory: (formData) => {
        return httpRequest.post("/category/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    updateCategory: (id, formData) => {
        return httpRequest.put(`/category/update/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    getAllCategory: () => httpRequest.get("/category/all"),
    getCategoryById: (categoryID) => httpRequest.get(`/category/id/${categoryID}`),
    getCategoryByText: (text) => httpRequest.get(`/category/${text}`),
    deleteCategory: (categoryID) => httpRequest.put(`/category/delete/${categoryID}`),

};




export const productImageApi = {

    createProductImage: (formData) => {
        return httpRequest.post("/product-image/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    updateProductImage: (productImageId, formData) => {
        return httpRequest.put(`/product-image/update/${productImageId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    getProductImageById: (productImageId) => httpRequest.get(`/product-image/id/${productImageId}`),
    getProductImageByText: (text) => httpRequest.get(`/product-image/search/${text}`),
    // updateProductImage: (productImageId, productImage) => httpRequest.put(`/product-image/update/${productImageId}`, productImage), 
    deleteProductImage: (productImageId) => httpRequest.delete(`/product-image/delete/${productImageId}`),
    getAllProductImage: () => httpRequest.get("/product-image/all"),
}

export const ProductDiscountApi = {
     createProductDiscount: (productDiscount) => httpRequest.post("/product-discount/create", productDiscount),
    getAllProductDiscount: () => httpRequest.get("/product-discount/all"),
    getProductDiscountById: (productDiscountId) => httpRequest.get(`/product-discount/id/${productDiscountId}`),
    getProductDiscountByText: (text) => httpRequest.get(`/product-discount/search/${text}`),
    updateProductDiscount: (productDiscountId, productDiscount) => httpRequest.put(`/product-discount/update/${productDiscountId}`, productDiscount), 
    deleteProductDiscount: (productDiscountId) => httpRequest.delete(`/product-discount/delete/${productDiscountId}`)
}