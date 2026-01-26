import axios from "axios";


const httpRequest = axios.create({
    baseURL: "http://localhost:5000/api/v1"

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

export const categoryAPI = {
    createCategory: (category) => httpRequest.post("/category/create", category),
    getAllCategory: () => httpRequest.get("/category/all"),
    getCategoryById: (categoryID) => httpRequest.get(`/category/id/${categoryID}`),
    getCategoryByText: (text) => httpRequest.get(`/category/${text}`),
    updateCategory: (categoryID, categoryData) => httpRequest.put(`/category/update/${categoryID}`, categoryData),
    deleteCategory: (categoryID) => httpRequest.put(`/category/delete/${categoryID}`),

};
export const productAPI = {
    createProduct: (product) => httpRequest.post("/product/create", product),
    getAllProduct: () => httpRequest.get("/product/all"),
    getProductById: (productId) => httpRequest.get(`/product/id/${productId}`),
    getProductByText: (text) => httpRequest.get(`/product/search/${text}`),
    updateProduct: (productId, productData) => httpRequest.put(`/product/update/${productId}`, productData),
    deleteProduct: (productId) => httpRequest.put(`/product/delete/${productId}`),
};