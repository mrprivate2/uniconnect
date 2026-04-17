import React, { createContext, useContext, useState, useEffect } from "react";

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

  // ✅ Simulate auth check (future: API verify)
  useEffect(() => {
    setLoading(false);
  }, []);

  // 🔥 Helper: logout
  const logout = () => {
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
export const useAuth = () => useContext(AuthContext);