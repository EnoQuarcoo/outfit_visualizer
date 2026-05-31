import { useState, useEffect, useRef, React } from "react";

const TryOn = () => {
  // ─── STATE ───────────────────────────────────────────────────────────────
  const [wardrobe, setWardrobe] = useState([]);

  // ─── GROUP WARDROBE ITEMS BY CATEGORY ────────────────────────────────────
  const grouped = {};
  const fetchWardrobe = async () => {
    //Fetch authenticated user's id
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const user_id = user.id;
    setUserId(user.id);

    //Fetch all clothing items which match the user's id
    const getWardrobe = await supabase
      .from("clothing_items")
      .select("*")
      .eq("user_id", user_id);
    //console.log(getWardrobe);
    setWardrobe(getWardrobe["data"]);
  };
  wardrobe.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    // then push the item in
    grouped[item.category].push(item);
  });

  // ─── ON MOUNT: fetch user identity and their saved model photo ────────────
  useEffect(() => {
    const getModelPhoto = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const user_id = user.id;
      setUserId(user.id);

      // Fetch the user's profile to get their saved model photo URL
      const user_data = await supabase
        .from("users")
        .select("*")
        .eq("id", user_id);

      setModelPhotoUrl(user_data["data"][0]["model_photo_url"]);
      if (!user) return;
    };

    getModelPhoto();
    fetchWardrobe();
  }, []);

  return <div>TryOn</div>;
};

export default TryOn;
