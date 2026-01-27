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


export const roleApi ={
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