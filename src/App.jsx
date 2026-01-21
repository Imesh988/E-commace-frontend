import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import UserRegister from "./pages/UserRegister";
import UserForm from "./forms/UserForm";
import RoleSave from "./pages/RoleSave";
import RoleForm from "./forms/RoleForm";
import SuperAdminRegister from "./pages/SuperAdminRegister";
import SuperAdminForm from "./forms/SuperAdminForm";
import Navbar from "./layout/Navbar";
import CategoryForm from "./forms/CategoryForm";
import  { Category }  from "./pages/Category";




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
                <Route path="/categoryForm" element={<CategoryForm />} />
                <Route path="/category" element={<Category />} />


            </Routes>
        </Router>
    );
}

export default App;