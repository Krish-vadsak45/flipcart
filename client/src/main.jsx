import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import axios from "axios";

// // 2. Configure Global Settings
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "https://flipcart-backend-jfmj.onrender.com";
axios.defaults.withCredentials = true; // Required if you use cookies/sessions

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-right" />
    </AuthProvider>
  </React.StrictMode>,
);
