import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
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

function App() {
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    // 1. Timezone Logic (Legacy parity)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.cookie = `timezone=${tz}; path=/; max-age=315360000`; // 10 years

    // 2. Maintenance Check
    const checkMaintenance = async () => {
      try {
        // Check specific endpoint for status
        const res = await axios.get("/api/maintenance-check");
        if (res.data && res.data.maintenance) {
          setIsMaintenance(true);
        }
      } catch (error) {
        if (
          error.response &&
          (error.response.status === 503 || error.response.data?.maintenance)
        ) {
          setIsMaintenance(true);
        }
      }
    };

    checkMaintenance();

    // Global interceptor for runtime catching
    const interceptor = axios.interceptors.response.use(
      (response) => {
        if (
          response.data &&
          (response.data.maintenance === true ||
            response.data.error ===
              "The website is under maintenance. Please check back soon.")
        ) {
          setIsMaintenance(true);
        }
        return response;
      },
      (error) => {
        if (
          error.response &&
          (error.response.status === 503 || error.response.data?.maintenance)
        ) {
          setIsMaintenance(true);
        }
        return Promise.reject(error);
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <Router>
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
