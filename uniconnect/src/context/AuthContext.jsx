import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [college, setCollege] = useState(() => {
    const savedCollege = localStorage.getItem("college");
    return savedCollege ? JSON.parse(savedCollege) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    if (college) localStorage.setItem("college", JSON.stringify(college));
    else localStorage.removeItem("college");
  }, [college]);

  return (
    <AuthContext.Provider value={{ user, setUser, college, setCollege }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);