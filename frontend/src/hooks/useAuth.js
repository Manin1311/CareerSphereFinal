"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * useAuth — reads "careersphere_user" from localStorage.
 *
 * If not found → redirect to /login.
 * Returns { user, logout } where logout clears localStorage and redirects.
 *
 * Usage:
 *   const { user, logout } = useAuth();
 */
export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("careersphere_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } else {
        navigate("/login");
      }
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("careersphere_user");
    localStorage.removeItem("cs_jwt");
    localStorage.removeItem("cs_company");
    localStorage.removeItem("cs_api_key");
    navigate("/login");
  };

  return { user, loading, logout };
}
