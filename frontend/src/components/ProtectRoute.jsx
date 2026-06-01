import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import { Navigate } from "react-router-dom";

const ProtectRoute = ({ children }) => {
  // ─── STATE ───────────────────────────────────────────────────────────────
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      setIsLoading(false);
    };
    checkSession();
  }, []);

  if (isLoading) return null;
  if (!session) return <Navigate to="/login" />;
  return children;
};

export default ProtectRoute;
