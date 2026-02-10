import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/admin/Login";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Payment from "./pages/Payment";
import Address from "./pages/Address";
import OrderSummary from "./pages/OrderSummary";
import ThankYou from "./pages/ThankYou";
import Maintenance from "./pages/Maintenance";

import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Settings from "./pages/admin/Settings";
import { localService } from "./services/localService";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    // 1. Maintenance Check
    const checkMaintenance = async () => {
      const res = await localService.getSettings();
      if (res.success && res.data.is_maintenance) {
        // Skip maintenance for admin panel
        if (!window.location.pathname.startsWith("/admin_panel")) {
          setIsMaintenance(true);
        }
      }
    };
    checkMaintenance();
  }, []);

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin_panel/login" element={<Login />} />
        <Route
          path="/admin_panel"
          element={<Navigate to="/admin_panel/dashboard" replace />}
        />
        <Route element={<AdminLayout />}>
          <Route path="/admin_panel/dashboard" element={<Dashboard />} />
          <Route path="/admin_panel/products" element={<Products />} />
          <Route path="/admin_panel/settings" element={<Settings />} />
        </Route>

        {/* User Storefront Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route path="/product-details/:id" element={<ProductDetails />} />
        <Route path="/address" element={<Address />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </Router>
  );
}

export default App;
