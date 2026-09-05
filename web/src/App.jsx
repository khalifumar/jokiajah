import React from "react";
import { Route, Routes, BrowserRouter as Router, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";
import PolicyPage from "./pages/PolicyPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ManageServicesPage from "./pages/ManageServicesPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";

function RoleRoute({ roles, children }) {
  const { isAuthed, user } = useAuth();
  if (!isAuthed) return <Navigate to="/masuk" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster richColors position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/katalog" element={<CatalogPage />} />
            <Route path="/jasa/:id" element={<ServiceDetailPage />} />
            <Route path="/masuk" element={<LoginPage />} />
            <Route path="/daftar" element={<RegisterPage />} />
            <Route path="/tentang" element={<AboutPage />} />
            <Route path="/kebijakan" element={<PolicyPage />} />
            <Route path="/dashboard" element={<RoleRoute><DashboardPage /></RoleRoute>} />
            <Route path="/profil" element={<RoleRoute><ProfilePage /></RoleRoute>} />
            <Route path="/kelola-jasa" element={<RoleRoute roles={["provider", "admin"]}><ManageServicesPage /></RoleRoute>} />
            <Route path="/pesanan" element={<RoleRoute><OrdersPage /></RoleRoute>} />
            <Route path="/pesanan/:id" element={<RoleRoute><OrderDetailPage /></RoleRoute>} />
            <Route path="/chat" element={<RoleRoute><ChatPage /></RoleRoute>} />
            <Route path="/admin" element={<RoleRoute roles={["admin"]}><AdminPage /></RoleRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
