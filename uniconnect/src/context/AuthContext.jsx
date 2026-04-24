import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../api";

const AuthContext = createContext();

// ✅ Safe JSON parser (prevents crashes)
const safeParse = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? safeParse(savedUser) : null;
  });

  const [college, setCollege] = useState(() => {
    const savedCollege = localStorage.getItem("college");
    return savedCollege ? safeParse(savedCollege) : null;
  });

  const [loading, setLoading] = useState(true);

  // ✅ Persist user
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // ✅ Persist college
  useEffect(() => {
    if (college) localStorage.setItem("college", JSON.stringify(college));
    else localStorage.removeItem("college");
  }, [college]);

  // ✅ Auth check on load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, []);

  // 🔥 Helper: logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCollege(null);
  };

  // 🔥 Helper: update user
  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        college,
        setCollege,
        loading,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);