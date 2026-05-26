import axios from "axios";

const httpRequest = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
httpRequest.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('🔍 [httpRequest] Token from localStorage:', token ? 'Present' : 'Not found');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ [httpRequest] Token attached to request');
        } else {
            console.log('❌ [httpRequest] No token found!');
        }

        console.log('🔍 [httpRequest] Request URL:', config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ Response interceptor - මේක වැදගත්ම කොටස
// ✅ නිවැරදි response interceptor - data වෙනස් නොකරන්න
httpRequest.interceptors.response.use(
    (response) => {
        console.log('✅ [httpRequest] Response received:', response.status);

        // 💡 Just log the structure, don't modify it
        if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
            console.log('ℹ️ Wrapped data detected in response.data.data, length:', response.data.data.length);
            // ⚠️ DON'T modify response.data - let the component handle it
        }

        // Return the original response unchanged
        return response;
    },
    (error) => {
        console.log('❌ [httpRequest] Response error:', error.response?.status, error.response?.data);

        // Handle 404 error for shipping addresses
        if (error.response?.status === 404 &&
            error.response?.data?.msg === "No Shipping Addresses Found for this user!") {
            console.log('ℹ️ No shipping addresses found - returning empty array');
            return Promise.resolve({
                data: [],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: error.config,
                request: error.request
            });
        }

        if (error.response?.status === 401) {
            console.log('🔍 [httpRequest] Unauthorized - clearing token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        return Promise.reject(error);
    }
);


export const userApi = {
    createUser: (user) => httpRequest.post("/user/create", user),
    getAllUser: () => httpRequest.get("/user/all"),
    getUserById: (userId) => httpRequest.get(`/user/id/${userId}`),
    getUserByText: (text) => httpRequest.get(`/user/search/${text}`),
    updateUser: (user, userId) => httpRequest.put(`/user/update/${userId}`, user),
    deleteUser: (userId) => httpRequest.delete(`/user/delete/${userId}`),
    getUserProfile: () => httpRequest.get("/user/profile"),
    updateUserProfile: (userId, userData) => httpRequest.put(`/user/profile/${userId}`, userData),

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
    getAllProduct: (params = {}) => httpRequest.get("/product/all", { params }),
    getProductById: (productId) => httpRequest.get(`/product/id/${productId}`),
    getProductByText: (text) => httpRequest.get(`/product/search/${text}`),
    updateProduct: (productId, product) => httpRequest.put(`/product/update/${productId}`, product),
    deleteProduct: (productId) => httpRequest.delete(`/product/delete/${productId}`),
    getAllProductText: (params = {}) => httpRequest.get("/product/allText", { params })
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
    getProducts: (params) => httpRequest.get("/product-image/all", { params: params }),
};




// Assuming httpRequest is defined elsewhere, e.g., in axiosConfig or similar
// import httpRequest from './httpRequest'; // You might need to adjust this path

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

    getProductImageById: (productImageId) => httpRequest.get(`/product-image/find/${productImageId}`),
    getProductImageByText: (text) => httpRequest.get(`/product-image/search/${text}`),
    getProductImageByCategory: (categoryName) => httpRequest.get(`/product-image/category/${categoryName}`),
    deleteProductImage: (productImageId) => httpRequest.delete(`/product-image/delete/${productImageId}`),
    getAllProductImage: () => httpRequest.get("/product-image/all"),
    getProductImagesByProductId: (productId) => httpRequest.get(`/product-image/product/${productId}`),
};
export const ProductDiscountApi = {
    createProductDiscount: (productDiscount) => httpRequest.post("/product-discount/create", productDiscount),
    getAllProductDiscount: () => httpRequest.get("/product-discount/all"),
    getProductDiscountById: (productDiscountId) => httpRequest.get(`/product-discount/id/${productDiscountId}`),
    getProductDiscountByText: (text) => httpRequest.get(`/product-discount/search/${text}`),
    updateProductDiscount: (productDiscountId, productDiscount) => httpRequest.put(`/product-discount/update/${productDiscountId}`, productDiscount),
    deleteProductDiscount: (productDiscountId) => httpRequest.delete(`/product-discount/delete/${productDiscountId}`)
};

export const CartApi = {
    getCartItems: () => httpRequest.get("/cart/all"),
    getCartCount: () => httpRequest.get("/cart/count"),
    addToCart: (productId, qty, totalAmount) => {
        const data = {
            productId: productId,
            qty: qty,
            totalAmount: totalAmount  // Now totalAmount is defined
        };
        console.log('📦 CartApi.addToCart:', data);
        return httpRequest.post('/cart/add', data);
    },

    updateCartItem: (cartId, cartItem) => httpRequest.put(`/cart/update/${cartId}`, cartItem),
    removeCartItem: (cartId) => httpRequest.delete(`/cart/remove/${cartId}`),
    clearCart: () => httpRequest.delete("/cart/clear"),
};

export const shippingAddressApi = {
    createShippingAddress: (address) => httpRequest.post("/shipping-addresses", address),
    getAllShippingAddresses: () => httpRequest.get("/shipping-addresses/all"),
    getShippingAddressesByUserId: (userId) => httpRequest.get(`/shipping-addresses/user/${userId}`), // 👈 මේක
    getShippingAddressById: (shippingId) => httpRequest.get(`/shipping-addresses/${shippingId}`),
    updateShippingAddress: (shippingId, addressData) => httpRequest.put(`/shipping-addresses/${shippingId}`, addressData),
    deleteShippingAddress: (shippingId) => httpRequest.delete(`/shipping-addresses/${shippingId}`),
    setDefaultShippingAddress: (userId, shippingId) => httpRequest.put(`/shipping-addresses/set-default/${userId}/${shippingId}`),
};

export const orderApi = {
    // Backend routes: /api/orders/...
    placeOrder: (orderDetails) => httpRequest.post("/orders", orderDetails),
        getAllOrders: () => httpRequest.get("/orders"),
    getOrdersByUserId: (userId) => httpRequest.get(`/orders/user/${userId}`),
    getOrderDetails: (orderId) => httpRequest.get(`/orders/${orderId}`), // order, order_items, payments ලබාගැනීමට
    updateOrderStatus: (orderId, newStatus) => httpRequest.put(`/orders/status/${orderId}`, { new_status: newStatus }),
    verifyPayment: async (sessionId, orderId) => {
        const response = await axiosInstance.post('/payments/stripe/verify-payment', {
            session_id: sessionId,
            order_id: orderId
        });
        return response;
    },

    cancelOrder: (orderId) => httpRequest.put(`/orders/cancel/${orderId}`),
    getDeliveryByOrderId: (orderId) => httpRequest.get(`/admin/delivery/${orderId}`),


};

export const orderItemApi = {

    getOrderItemByOrderId: (orderId) => httpRequest.get(`/order-items/order/${orderId}`), // මෙය orderApi.getOrderDetails එකේ කොටසක් ලෙස ලැබේ.
    // deleteOrderItem: (orderItemId) => httpRequest.delete(`/order-items/${orderItemId}`), // අවශ්‍ය නම්
};

export const paymentApi = {
    // Backend routes: /api/payments/...
    processPayment: (paymentDetails) => httpRequest.post("/payments", paymentDetails),
    getPaymentByOrderId: (orderId) => httpRequest.get(`/payments/order/${orderId}`),
    getPaymentById: (paymentId) => httpRequest.get(`/payments/${paymentId}`),
    updatePaymentStatus: (paymentId, newStatus) => httpRequest.put(`/payments/status/${paymentId}`, { new_status: newStatus }),


    //     createStripeCheckout: (orderId, customerEmail) => 
    //     httpRequest.post("/payments/stripe/create-checkout", { 
    //         order_id: orderId, 
    //         customer_email: customerEmail 
    //     }),

    // verifyStripePayment: (sessionId, orderId) => 
    //     httpRequest.post("/payments/stripe/verify-payment", { 
    //         session_id: sessionId, 
    //         order_id: orderId 
    //     })


    createStripeCheckout: async (orderId) => {
        try {
            const response = await httpRequest.post('/payments/stripe/create-checkout', {
                order_id: orderId
            });
            return response;
        } catch (error) {
            console.error('Create checkout error:', error);
            throw error;
        }
    },

    verifyStripePayment: async (sessionId, orderId) => {
        try {
            const response = await httpRequest.post('/payments/stripe/verify-payment', {
                session_id: sessionId,
                order_id: orderId
            });
            return response;
        } catch (error) {
            console.error('Verify payment error:', error);
            throw error;
        }
    },

    getPaymentByOrderId: async (orderId) => {
        try {
            const response = await httpRequest({
                method: 'GET',
                url: `/payments/order/${orderId}`
            });
            return response;
        } catch (error) {
            console.error('Get payment error:', error);
            throw error;
        }
    }
};

export const returnApi = {
    createReturn: (returnDetails) => httpRequest.post('/returns/create', returnDetails),
    getMyReturns: () => httpRequest.get('/returns/my-returns')
};


export const adminRemark = {
    getAllReturns: () => httpRequest.get('/admin/returns'),
    updateReturnStatus: (returnId, status, adminRemark) =>
        httpRequest.put(`/admin/update/${returnId}`, {
            status,
            admin_remark: adminRemark
            // refund_amount යවන්න එපා
        }),
    processRefund: (refundDetails) => httpRequest.post('/admin/refunds', refundDetails),
    updateTrackingNumber: (orderId, trackingNo) => httpRequest.put(`/admin/tracking/${orderId}`, { tracking_no: trackingNo }),
};