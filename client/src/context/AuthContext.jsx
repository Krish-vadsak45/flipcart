import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        if (token === "hardcoded-token") {
          // Skip server validation for hardcoded token
          setLoading(false);
          return;
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          // Fetch real user details
          const res = await axios.get("/api/auth/me");
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            // Token invalid
            logout();
          }
        } catch (error) {
          console.error("Auth check failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      return res.data; // Expecting { success: 1, message: '...' }
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      if (res.data.success) {
        const newToken = res.data.token;
        setToken(newToken);
        setUser(res.data.data);
        localStorage.setItem("token", newToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        return true;
      }
      return false;
    } catch (error) {
      throw error.response?.data?.message || "OTP verification failed";
    }
  };

  const loginDirect = (userData) => {
    const dummyToken = "hardcoded-token";
    setToken(dummyToken);
    setUser(userData);
    localStorage.setItem("token", dummyToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    token,
    login,
    verifyOtp,
    loginDirect,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
