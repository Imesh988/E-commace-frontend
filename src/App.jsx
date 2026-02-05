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





function App() {
    return (
        <Router>
            <Routes>

                <Route path="/" element={<UserRegister />} />
                <Route path="/user" element={<UserForm />} />
                {/* <Route path="/role" element={<RoleSave />} />
                <Route path="/roleForm" element={<RoleForm />} /> */}
                {/* <Route path="/superAdmin" element={<SuperAdminRegister />} />
                <Route path="/superAdminForm" element={<SuperAdminForm />} /> */}
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
                <Route path="/seller" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <SellerSave />
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

                <Route path="/user/dashboard" element={
                    <ProtectedRoute allowedRoles={['user']}>
                        <UserDashboard />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;