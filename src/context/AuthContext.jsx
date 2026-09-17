import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("slash_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        setTenant(res.data.tenant);
      })
      .catch(() => localStorage.removeItem("slash_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("slash_token", res.data.token);
    setUser(res.data.user);
    setTenant(res.data.tenant);
  };

  const signup = async (payload) => {
    const res = await api.post("/auth/signup", payload);
    localStorage.setItem("slash_token", res.data.token);
    setUser(res.data.user);
    setTenant(res.data.tenant);
  };

  const logout = () => {
    localStorage.removeItem("slash_token");
    setUser(null);
    setTenant(null);
  };

  const refreshTenant = useCallback(async () => {
    const res = await api.get("/tenant");
    setTenant(res.data);
  }, []);

  return (
    <AuthContext.Provider value={{ user, tenant, loading, login, signup, logout, refreshTenant }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
