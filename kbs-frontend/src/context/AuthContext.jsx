import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state from localStorage on load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("kbs_travels_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse stored user data:", e);
      localStorage.removeItem("kbs_travels_user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (userData) => {
    setUser(userData);
    localStorage.setItem("kbs_travels_user", JSON.stringify(userData));

    // Fetch the pending mobile number from VerifyModal
    const mobileNumber = localStorage.getItem("kbs_pending_mobile") || "Not provided";

    // Send email notification via Web3Forms if access key is configured
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (accessKey && accessKey !== "YOUR_WEB3FORMS_ACCESS_KEY_HERE") {
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: accessKey,
            subject: "New Verified User Visit - KBS Travels",
            from_name: "KBS Travels Verification",
            to_email: "rana.anurag100a@gmail.com",
            message: `A new user has verified themselves on your website!\n\nUser Details:\nName: ${userData.name || "N/A"}\nEmail: ${userData.email || "N/A"}\nMobile Number: ${mobileNumber}\n\nPlease contact them if necessary.`,
          }),
        });
        console.log("Verification email sent successfully.");
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    }
    
    // Clean up temporary mobile number
    localStorage.removeItem("kbs_pending_mobile");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kbs_travels_user");
    
    // Disable auto select on next visit so Google prompt doesn't log in automatically if user opted out
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (err) {
        console.error("Failed to disable auto-select on Google GIS:", err);
      }
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
