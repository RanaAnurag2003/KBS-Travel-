import { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "../config/authConfig";
import { decodeJWT } from "../utils/jwt";
import useAuth from "../hooks/useAuth";

export default function GoogleOneTap() {
  const { login, isAuthenticated, user } = useAuth();
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // If user is already logged in, do not trigger One Tap prompt
    if (isAuthenticated) return;

    if (!GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not configured. Google One Tap will not load.");
      return;
    }

    const handleCredentialResponse = (response) => {
      try {
        const idToken = response.credential;
        const decoded = decodeJWT(idToken);
        if (decoded) {
          const userData = {
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
            id: decoded.sub,
          };
          login(userData);
          console.log("Successfully authenticated user via Google One Tap (FedCM)", userData);
        }
      } catch (err) {
        console.error("Error during One Tap credential callback:", err);
      }
    };

    const initializeOneTap = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            use_fedcm_for_prompt: true, // FedCM support enabled
            auto_select: false, // Optional: set to true if you want auto login for returning users
          });

          // Show One Tap prompt
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              console.log("One Tap prompt not displayed:", notification.getNotDisplayedReason());
            } else if (notification.isSkippedMoment()) {
              console.log("One Tap prompt skipped:", notification.getSkippedReason());
            } else if (notification.isDismissedMoment()) {
              console.log("One Tap prompt dismissed:", notification.getDismissedReason());
            }
          });
        } catch (err) {
          console.error("Google One Tap initialization error:", err);
        }
      }
    };

    // Load GIS script dynamically if not already loaded
    const scriptId = "google-gis-script";
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoadedRef.current = true;
        initializeOneTap();
      };
      script.onerror = () => {
        console.error("Failed to load Google Identity Services script.");
      };
      document.body.appendChild(script);
    } else {
      // Script already exists in DOM
      if (window.google?.accounts?.id) {
        initializeOneTap();
      } else {
        // Script is added but not fully loaded/executed yet
        script.addEventListener("load", initializeOneTap);
      }
    }

    return () => {
      // Clean up listener if script wasn't fully loaded
      const activeScript = document.getElementById(scriptId);
      if (activeScript) {
        activeScript.removeEventListener("load", initializeOneTap);
      }
    };
  }, [isAuthenticated, login]);

  return null; // Component does not render any UI of its own
}
