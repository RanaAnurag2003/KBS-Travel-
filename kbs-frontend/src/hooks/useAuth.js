import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook to consume the AuthContext.
 * 
 * @returns {object} - Auth context values { user, isAuthenticated, loading, login, logout }
 */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
