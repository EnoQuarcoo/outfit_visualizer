import { useState, useEffect, useRef, React } from "react";
import { supabase } from "../SupabaseClient";
import "./WardrobeView.css";

const WardrobeView = () => {
  // ─── STATE ───────────────────────────────────────────────────────────────
  const [wardrobe, setWardrobe] = useState([]);
  // const [wardrobe, setWardrobe] = useState([
  //   {
  //     id: 1,
  //     name: "Hard Coded White Tee",
  //     category: "tops",
  //     image_url:
  //       "https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=713",
  //   },
  //   {
  //     id: 2,
  //     name: "Blue Jeans",
  //     category: "bottoms",
  //     image_url:
  //       "https://img.abercrombie.com/is/image/anf/KIC_155-4247-0173-278_prod1?policy=product-large",
  //   },
  // ]);
  const [modelPhotoUrl, setModelPhotoUrl] = useState(""); // the user's model/avatar photo
  const [userId, setUserId] = useState(""); // logged-in user's UUID
  const fileInputRef = useRef(null); // ref to hidden file input for avatar upload
  const [isModalOpen, setIsModalOpen] = useState(false); // Renders modal to store clothing piece information
  const [clothingFile, setClothingFile] = useState(""); //Stores the file object the user uploads to be sent to the backend
  const [clothingPreviewUrl, setClothingPreviewUrl] = useState(""); //Stores the file object as a temporary local URL for display by the browser
  const [clothingPieceName, setClothingPieceName] = useState("");
  const [clothingPieceCategory, setClothingPieceCategory] = useState("");

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

  // ─── AVATAR UPLOAD ────────────────────────────────────────────────────────
  // Triggered when user selects a file from the hidden input
  const handleAvatarChange = async () => {
    const avatarPath = `${userId}/avatar-${Date.now()}.png`;
    const avatarFile = event.target.files[0];

    // Upload the selected image to Supabase storage
    const { data, uploadError } = await supabase.storage
      .from("Avatars")
      .upload(avatarPath, avatarFile);

    // Get the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("Avatars").getPublicUrl(avatarPath);

    // Persist the public URL to the users table
    const { data: updateData, updateError } = await supabase
      .from("users")
      .update({ model_photo_url: publicUrl })
      .eq("id", userId)
      .select();

    // Update local state so the image renders immediately
    setModelPhotoUrl(publicUrl);
  };

  // ─── ClOTHING UPLOAD ──────────────────────────────────────────────────────
  const handleClothingSubmission = async () => {
    const clothingPath = `${userId}/clothingPiece-${Date.now()}.png`;
    // Upload the selected image to Supabase storage
    const { data, error } = await supabase.storage
      .from("Clothing Pieces")
      .upload(clothingPath, clothingFile, {
        cacheControl: "3600",
        upsert: false,
      });
    //console.log("error submitting to storage: ", error);

    // Resolve the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("Clothing Pieces").getPublicUrl(clothingPath);

    // Persist the public URL to the users table
    const { data: updateData, updateError } = await supabase
      .from("clothing_items")
      .insert({
        user_id: userId,
        name: clothingPieceName,
        category: clothingPieceCategory,
        image_url: publicUrl,
      });
    //console.log("update data:", updateData);
    //console.log("update error:", updateError);

    //Close the modal and reset all form states to empty
    setIsModalOpen(false);
    setClothingFile("");
    setClothingPreviewUrl("");
    setClothingPieceName("");
    setClothingPieceCategory("");
    fetchWardrobe();
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="wardrobe-page">
      {/* Hidden file input — triggered programmatically by the avatar button */}
      <input
        ref={fileInputRef}
        type="file"
        id="avatar"
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: "none" }}
      />

      {/* Model photo section — shows photo if exists, placeholder if not */}
      {modelPhotoUrl ? (
        <img
          className="wardrobe-model-photo"
          src={modelPhotoUrl}
          alt="Your model photo"
        />
      ) : (
        <button
          className="wardrobe-model-placeholder"
          onClick={() => fileInputRef.current.click()}
        >
          {" "}
          + Add Photo of yourself
        </button>
      )}

      {/* Empty wardrobe state — shown when no clothing items exist */}
      {wardrobe.length === 0 && (
        <button className="wardrobe-empty-btn"> Add Clothing Items </button>
      )}

      {/* Clothing grid — grouped by category */}
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

      {/* FAB — opens clothing item upload modal */}
      <button className="wardrobe-fab" onClick={() => setIsModalOpen(true)}>
        {" "}
        +{" "}
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            {/* Allow user to pick clothing item */}
            <div className="modal-upload-area">
              <span className="modal-upload-hint">+ Tap to upload a photo</span>
              <input
                className="modal-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setClothingFile(e.target.files[0]);
                  setClothingPreviewUrl(URL.createObjectURL(e.target.files[0]));
                }}
              ></input>
            </div>
            {/* image preview */}
            {clothingPreviewUrl && (
              <div className="modal-preview">
                <img src={clothingPreviewUrl} alt="User's Clothing Piece" />
              </div>
            )}

            {/* name field */}
            <label className="modal-label" htmlFor="name">
              Name
            </label>
            <input
              className="modal-input"
              type="text"
              id="name"
              value={clothingPieceName}
              onChange={(e) => setClothingPieceName(e.target.value)}
            />

            <label className="modal-label" htmlFor="category_selecot">
              {" "}
              What type of clothing article is this?
            </label>
            <select
              className="modal-select"
              id="category_selector"
              required
              onChange={(e) => setClothingPieceCategory(e.target.value)}
            >
              <option value="" disabled defaultValue={""}>
                Select a category
              </option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="one-piece">One Piece</option>
              <option value="other">Other</option>
            </select>

            <button
              className="modal-submit"
              onClick={() => handleClothingSubmission()}
            >
              Add Piece
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardrobeView;
