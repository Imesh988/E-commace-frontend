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
import SellerDashboard from "./pages/SellerDashboard";
import StockManagement from "./pages/StockManagement";
import ProductManagement from "./pages/ProductManagement";
import SellerApprovalList from "./pages/SellerApprovalList";
import Pending from "./pages/Pending";
import SellerBusinessDetailCreate from "./pages/SellerBusinessDetailCreate";



















function App() {
    return (
        <Router>
            <Routes>
                <Route path="/pending" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <Pending />
                    </ProtectedRoute>
                } />
                <Route path="/userRegister" element={<UserRegister />} />
                {/* <Route path="/user" element={<UserForm />} /> */}
                <Route path="/role" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <RoleSave />
                    </ProtectedRoute>
                } />

                
{/* 


                <Route path="/super-admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SuperAdminForm />
                    </ProtectedRoute>
                } /> */}
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
                <Route path="/navbar" element={<Navbar />} />
                <Route path="/seller" element={
                    <ProtectedRoute allowedRoles={['user', 'seller']}>
                        <SellerSave />
                    </ProtectedRoute>
                } />
                <Route path="/sellerForm" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SellerForm />
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
                <Route path="/sellerHasRole" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SellerhasRoleSave />
                    </ProtectedRoute>
                } />
                <Route path="/sellerHasRoleForm" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SellerhasRoleForm />
                    </ProtectedRoute>
                } />
                <Route path="/stock" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <StockSave />
                    </ProtectedRoute>
                } />
                <Route path="/stockForm" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <StockForm />
                    </ProtectedRoute>
                } />
                <Route path="/grnPage" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <GRNSave />
                    </ProtectedRoute>
                } />
                <Route path="/grnForm" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <GrnForm />
                    </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/category" element={<Category />} />
                <Route path="/product" element={<Product />} />
                <Route path="/productForm" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <ProductForm />
                    </ProtectedRoute>
                } />
                <Route path="/categoryForm" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <CategoryForm />
                    </ProtectedRoute>
                } />
                <Route path="/productImage" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <ProductImage />
                    </ProtectedRoute>
                } />
                <Route path="/productImageForm" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <ProductImageForm />
                    </ProtectedRoute>
                } />
                <Route path="/productDiscount" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <ProductDiscount />
                    </ProtectedRoute>
                } />
                <Route path="/productDiscountForm" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <ProductDiscountForm />
                    </ProtectedRoute>
                } />
                <Route path="/cart" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <Cart />
                    </ProtectedRoute>
                } />
                <Route path="/shipping-addresses" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <ShippingAddressPage />
                    </ProtectedRoute>
                } />
                {/* <Route path="/profile" element={<UserProfilePage />} /> */}
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/order-cancel" element={<OrderCancel />} />
                <Route path="/orders" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <OrdersPage />
                    </ProtectedRoute>
                } />
                <Route path="/orders/:orderId" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <OrderDetailsPage />
                    </ProtectedRoute>
                } />
                <Route path="/returnorders" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <ReturnedOrders />
                    </ProtectedRoute>
                } />
                {/* <Route path="/sellerApproved"  element={<SellerApprovalList/>}/> */}
                <Route path="/customer/returns" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <CustomerReturns />
                    </ProtectedRoute>
                } />
                {/* <Route path="/admin/returns" element={<AdminReturns />} /> */}
                <Route path="/sellerDashboard" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <SellerDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/stockManagement" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <StockManagement />
                    </ProtectedRoute>
                } />
                <Route path="/productManagement" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <ProductManagement />
                    </ProtectedRoute>
                } />
                <Route path="/sellerBusinessDetailCreate" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <SellerBusinessDetailCreate />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <UserProfilePage />
                    </ProtectedRoute>
                } />

                {/* <Route path="/super-admin/orders" element={<AdminOrdersPage />} /> */}
                <Route path="/" element={

                    <UserDashboard />

                } />

                <Route path="/checkout" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <CheckoutPage />
                    </ProtectedRoute>
                } />


                {/* user */}
                <Route path="/user" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <UserForm />
                    </ProtectedRoute>
                } />
                {/* seller approval  */}
                <Route path="/sellerApproved" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SellerApprovalList />
                    </ProtectedRoute>
                } />

                {/* admin return management */}
                <Route path="/admin/returns" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <AdminReturns />
                    </ProtectedRoute>
                } />


                <Route path="/adminorders" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <AdminOrdersPage />
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