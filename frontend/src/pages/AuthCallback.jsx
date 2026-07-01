import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../SupabaseClient";

const upload_default_clothes = async (user_id) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/add_default_pieces_on_signup`,
    {
      method: "POST",
      body: JSON.stringify({
        user_id: user_id,
      }),
      headers: { "Content-Type": "application/json" },
    },
  );
  return await response.json();
};

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      navigate("/wardrobe", { replace: true });

      if (!user) return;

      const { data: userRow } = await supabase
        .from("users")
        .select("default_pieces_seeded")
        .eq("id", user.id)
        .single();

      if (userRow?.default_pieces_seeded) return;

      await upload_default_clothes(user.id);

      await supabase
        .from("users")
        .update({ default_pieces_seeded: true })
        .eq("id", user.id);
    };

    run();
  }, []);

  return null;
};

export default AuthCallback;
