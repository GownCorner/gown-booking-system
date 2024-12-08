import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Use environment variables or fallback to localhost for development
export const url = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { exp } = JSON.parse(atob(token.split(".")[1])); // Decode JWT token
          if (Date.now() >= exp * 1000) {
            localStorage.removeItem("token");
            setUser(null);
            return;
          }

          const response = await axios.get(`${url}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user:", error.message);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${url}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token); // Save token
      setUser(response.data.user); // Update user state immediately
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error; // Re-throw to handle errors in the calling component
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
