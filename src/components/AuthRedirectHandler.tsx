import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Redirect to home as soon as we're signed in (covers email confirm + magic links)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        navigate("/", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Handle redirect params after email verification
  useEffect(() => {
    const handleRedirectSession = async () => {
      const url = new URL(window.location.href);

      // Newer flow: code param (PKCE/OTP)
      const code = url.searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        // Clean URL and go home; onAuthStateChange will also fire
        navigate(url.pathname, { replace: true });
        return;
      }

      // Legacy flow: tokens in hash
      const hash = window.location.hash;
      if (hash.includes("access_token") && hash.includes("refresh_token")) {
        const fragment = new URLSearchParams(hash.substring(1));
        const access_token = fragment.get("access_token") || undefined;
        const refresh_token = fragment.get("refresh_token") || undefined;
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
        navigate(url.pathname, { replace: true });
      }
    };

    handleRedirectSession();
  }, [navigate, location.key]);

  // If already logged in and on /auth, send to home
  useEffect(() => {
    if (user && location.pathname === "/auth") {
      navigate("/", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return null;
};

export default AuthRedirectHandler;
