import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import UserRegister from "./pages/UserRegister";
import UserForm from "./forms/UserForm";

function App() {
    return (
        <Router> 
            <Routes>
                
                <Route path="/" element={<UserRegister />} />
                <Route path="/user" element={<UserForm />} />
            </Routes>
        </Router>
    );
}

export default App;