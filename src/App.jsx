import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserRegister from "./pages/UserRegister";
import UserForm from "./forms/UserForm";
import RoleSave from "./pages/RoleSave";
import RoleForm from "./forms/RoleForm";
import SuperAdminRegister from "./pages/SuperAdminRegister";
import SuperAdminForm from "./forms/SuperAdminForm";
import Navbar from "./layout/Navbar";
import SellerSave from "./pages/SellerSave";
import SellerForm from "./forms/SellerForm";
import SupplierSave from "./pages/SupplierSave";
import SupplierForm from "./forms/SupplierForm";
import SellerhasRoleSave from "./pages/SellerHasRoleSave";
import SellerhasRoleForm from "./forms/SellerhasRoleForm";
import StockSave from "./pages/StockSave";
import StockForm from "./forms/StockForm";
import GRNSave from "./pages/GrnSave";
import GrnForm from "./forms/GrnForm";
import UserDashboard from "./pages/UserDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Login from "./components/login";
import ProtectedRoute from "./components/ProtectedRoute";
import Category from "./pages/Category";
import CategoryForm from "./forms/CategoryForm";
import Product from "./pages/Product";
import ProductForm from "./forms/ProductForm";
import ProductImage from "./pages/ProductImage";
import ProductImageForm from "./forms/ProductImageForm";
import ProductDiscount from "./pages/ProductDiscount";
import ProductDiscountForm from "./forms/ProductDiscountForm";
import Cart from "./pages/Cart";
import CheckoutPage from "./pages/CheckoutPage";
import ShippingAddressPage from "./pages/ShippingAddressPage";
import UserProfilePage from "./pages/UserProfilePage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import OrderSuccess from './pages/OrderSuccess';
import OrderCancel from './pages/OrderCancel';
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminReturns from "./pages/AdminReturns";
import CustomerReturns from "./pages/CustomerReturns";
import ReturnedOrders from "./pages/ReturnedOrders";














function App() {
    return (
        <Router>
            <Routes>

                <Route path="/userRegister" element={<UserRegister />} />
                <Route path="/user" element={<UserForm />} />
                {/* <Route path="/role" element={<RoleSave />} />
                <Route path="/roleForm" element={<RoleForm />} /> */}
                <Route path="/superAdmin" element={<SuperAdminRegister />} />
                <Route path="/superAdminForm" element={<SuperAdminForm />} />
                <Route path="/navbar" element={<Navbar />} />
                {/* <Route path="/seller" element={<SellerSave />} /> */}
                {/* <Route path="/sellerForm" element={<SellerForm />} /> */}
                {/* <Route path="/supplier" element={<SupplierSave />} />
                <Route path="/supplierForm" element={<SupplierForm />} /> */}
                <Route path="/sellerHasRole" element={<SellerhasRoleSave />} />
                <Route path="/sellerHasRoleForm" element={<SellerhasRoleForm />} />
                <Route path="/stock" element={<StockSave />} />
                <Route path="/stockForm" element={<StockForm />} />
                <Route path="/grnPage" element={<GRNSave />} />
                <Route path="/grnForm" element={<GrnForm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/category" element={<Category />} />
                <Route path="/product" element={<Product />} />
                <Route path="/productForm" element={<ProductForm />} />
                <Route path="/categoryForm" element={<CategoryForm />} />
                <Route path="/productImage" element={<ProductImage />} />
                <Route path="/productImageForm" element={<ProductImageForm />} />
                <Route path="/productDiscount" element={<ProductDiscount />} />
                <Route path="/productDiscountForm" element={<ProductDiscountForm />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/shipping-addresses" element={<ShippingAddressPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/order-cancel" element={<OrderCancel />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
                <Route path="/returnorders" element={<ReturnedOrders />} />

                <Route path="/customer/returns" element={<CustomerReturns />} />
                <Route path="/admin/returns" element={<AdminReturns />} />

                
                {/* <Route path="/super-admin/orders" element={<AdminOrdersPage />} /> */}
                <Route path="/" element={

                    <UserDashboard />

                } />

                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/seller" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SellerSave />
                    </ProtectedRoute>
                } />
                <Route path="/adminorders" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <AdminOrdersPage />
                    </ProtectedRoute>
                } />
                <Route path="/sellerForm" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SellerForm />
                    </ProtectedRoute>
                } />

                <Route path="/role" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <RoleSave />
                    </ProtectedRoute>
                } />
                <Route path="/roleForm" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <RoleForm />
                    </ProtectedRoute>
                } />

                <Route path="/superAdmin" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SuperAdminRegister />
                    </ProtectedRoute>
                } />
                <Route path="/superAdminForm" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SuperAdminForm />
                    </ProtectedRoute>
                } />

                <Route path="/supplier" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SupplierSave />
                    </ProtectedRoute>
                } />
                <Route path="/supplierForm" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SupplierForm />
                    </ProtectedRoute>
                } />

                <Route path="/super-admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SuperAdminDashboard />
                    </ProtectedRoute>
                } />


            </Routes>
        </Router>
    );
}

export default App;