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






function App() {
    return (
        <Router>
            <Routes>

                <Route path="/" element={<UserRegister />} />
                <Route path="/user" element={<UserForm />} />
                <Route path="/role" element={<RoleSave />} />
                <Route path="/roleForm" element={<RoleForm />} />
                <Route path="/superAdmin" element={<SuperAdminRegister />} />
                <Route path="/superAdminForm" element={<SuperAdminForm />} />
                <Route path="/navbar" element={<Navbar />} />
                <Route path="/seller" element={<SellerSave />} />
                <Route path="/sellerForm" element={<SellerForm />} />
                <Route path="/supplier" element={<SupplierSave />} />
                <Route path="/supplierForm" element={<SupplierForm />} />
                <Route path="/sellerHasRole" element={<SellerhasRoleSave />} />
                <Route path="/sellerHasRoleForm" element={<SellerhasRoleForm />} />
                <Route path="/stock" element={<StockSave />} />
                <Route path="/stockForm" element={<StockForm />} />
                <Route path="/grnPage" element={<GRNSave />} />
                <Route path="/grnForm" element={<GrnForm />} />

            </Routes>
        </Router>
    );
}

export default App;