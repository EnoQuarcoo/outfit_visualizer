import { useState, useEffect, useRef,  React } from "react";
import { supabase } from "../SupabaseClient";
import "./WardrobeView.css";

const WardrobeView = () => {
  //const [wardrobe, setWardrobe] = useState([])
  const [wardrobe, setWardrobe] = useState([
    {
      id: 1,
      name: "White Tee",
      category: "tops",
      image_url:
        "https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=713",
    },
    {
      id: 2,
      name: "Blue Jeans",
      category: "bottoms",
      image_url:
        "https://img.abercrombie.com/is/image/anf/KIC_155-4247-0173-278_prod1?policy=product-large",
    },
  ]);
  const grouped = {};
  const [modelPhotoUrl, setModelPhotoUrl] = useState("");
  const [userId, setUserId] = useState("");
  const fileInputRef = useRef(null);

  wardrobe.forEach((item) => {
    if (!grouped[item.category]) {
      // create an empty array for this category
      grouped[item.category] = [];
    }
    // then push the item in
    grouped[item.category].push(item);
  });

  //fetch the users data from supabase on load
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
  }, []);

  const handleChange = async () => {
    const avatarPath = `${userId}/avatar-${Date.now()}.png`;
    const avatarFile = event.target.files[0];

    // Upload the selected image to Supabase storage
    const { data, uploadError } = await supabase.storage
      .from("Avatars")
      .upload(avatarPath, avatarFile);

    // Resolve the public URL of the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from("Avatars")
      .getPublicUrl(avatarPath);

    // Persist the public URL to the users table
    const { data: updateData, updateError } = await supabase
      .from("users")
      .update({ model_photo_url: publicUrl })
      .eq("id", userId)
      .select();

    setModelPhotoUrl(publicUrl);
  };

  return (
    <div className="wardrobe-page">
      <input ref={fileInputRef} type="file" id="avatar" accept="image/*" onChange={handleChange} style={{display: "none"}} />
      {/* if modelPhotoURl is not empty, show their photo  */}
      {modelPhotoUrl ? (
        <img className="wardrobe-model-photo" src={modelPhotoUrl} alt="Your model photo" />
      ) : (
        <button className="wardrobe-model-placeholder" onClick={() => fileInputRef.current.click()}> + Add Photo of yourself</button>
      )}
      {wardrobe.length === 0 && (
        <button className="wardrobe-empty-btn" > Add Clothing Items </button>
      )}

      {Object.keys(grouped).map((category) => (
        <div key={category} className="wardrobe-category">
          <h2>{category}</h2>
          {grouped[category].map((item) => (
            <div key={item.id} className="wardrobe-item">
              <img src={item.image_url} alt={item.name} />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      ))}

      <button className="wardrobe-fab"> + </button>
    </div>
  );
};

export default WardrobeView;
