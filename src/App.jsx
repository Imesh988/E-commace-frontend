import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import UserRegister from "./pages/UserRegister";

function App() {
    return (
        <Router> 
            <Routes>
                
                <Route path="/" element={<UserRegister />} />
          
            </Routes>
        </Router>
    );
}

export default App;