import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check login status on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await authAPI.getProfile();
        if (res.success && res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        // Not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authAPI.login(email, password);
      if (res.success && res.data.user) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.message || "Đăng nhập thất bại" };
    } catch (err) {
      const errMsg = err.response?.data?.message || "Email hoặc mật khẩu không chính xác.";
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await authAPI.register(name, email, password);
      if (res.success && res.data.user) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.message || "Đăng ký thất bại" };
    } catch (err) {
      const errMsg = err.response?.data?.message || "Đăng ký thất bại. Email có thể đã tồn tại.";
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
