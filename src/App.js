import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

// Pages
import Dashboard from "./pages/Dashboard.jsx";
import DataHistory from "./pages/DataHistory.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import CreateAdmin from "./pages/CreateAdmin.jsx";
import ForgotPassword from "./pages/forgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import MasterAdmin from "./pages/MasterAdmin.jsx";
import ManualScan from "./pages/ManualScan.jsx";
import UpdatePassword from "./pages/UpdatePassword.jsx";

// Contexts
import { AutoScanProvider } from "./context/AutoScanContext.js";  // ✅ NEW

export const AdminContext = createContext();

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Load admin status from localStorage
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminStatus);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      <AutoScanProvider> {/* ✅ Wrap everything so Auto Scan is global */}
        <Router>
          <Routes>
            {/* Visitor dashboard */}
            <Route path="/visitor" element={<Dashboard isAdminProp={false} />} />

            {/* Admin routes */}
            <Route 
              path="/dashboard" 
              element={isAdmin ? <Dashboard isAdminProp={true} /> : <Navigate to="/admin" replace />} 
            />
            <Route 
              path="/admin" 
              element={!isAdmin ? <AdminLogin /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/create-admin" 
              element={!isAdmin ? <CreateAdmin /> : <Navigate to="/dashboard" replace />} 
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route 
              path="/datahistory" 
              element={isAdmin ? <DataHistory /> : <Navigate to="/admin" replace />} 
            />
            <Route 
              path="/master-admin" 
              element={isAdmin ? <MasterAdmin /> : <Navigate to="/admin" replace />} 
            />
            <Route 
              path="/manual-scan" 
              element={isAdmin ? <ManualScan /> : <Navigate to="/admin" replace />} 
            />
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* Default route */}
            <Route path="/" element={<Navigate to="/visitor" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AutoScanProvider>
    </AdminContext.Provider>
  );
}

export default App;
