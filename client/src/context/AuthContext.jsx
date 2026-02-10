import { createContext, useContext, useState, useEffect } from "react";
import { localService } from "../services/localService";

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
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await localService.login(email, password);
      if (res.success) {
        setToken("hardcoded-token");
        setUser(res.data);
        localStorage.setItem("token", "hardcoded-token");
        localStorage.setItem("user", JSON.stringify(res.data));
      }
      return res;
    } catch (error) {
      throw error.message || "Login failed";
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
