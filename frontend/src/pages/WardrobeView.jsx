import { useState, useEffect, useRef, React } from "react";
import { supabase } from "../SupabaseClient";
import "./WardrobeView.css";
import { config } from "../config";
import Navbar from "../components/Navbar";

const WardrobeView = () => {
  // ─── STATE ───────────────────────────────────────────────────────────────
  const [wardrobe, setWardrobe] = useState([]);
  const [modelPhotoUrl, setModelPhotoUrl] = useState(""); // the user's model/avatar photo
  const [userId, setUserId] = useState(""); // logged-in user's UUID
  const fileInputRef = useRef(null); // ref to hidden file input for avatar upload
  const [isModalOpen, setIsModalOpen] = useState(false); // Renders modal to store clothing piece information
  const [clothingFile, setClothingFile] = useState(""); //Stores the file object the user uploads to be sent to the backend
  const [clothingPreviewUrl, setClothingPreviewUrl] = useState(""); //Stores the file object as a temporary local URL for display by the browser
  const [clothingPieceName, setClothingPieceName] = useState("");
  const [clothingPieceCategory, setClothingPieceCategory] = useState("tops");
  const [isBuildLookMode, setIsBuildLookMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [generatedImage, setGeneratedImageURL] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
    setTimeout(() => {
      fetchWardrobe();
    }, 2000);
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

  // ─── GENERATE OUTFIT (TRY-ON CHAIN) ──────────────────────────────────────
  // : loop through selectedItems, resolve each item's image_url from
  // wardrobe state, then chain POST /tryon calls to the FastAPI backend —
  // passing modelPhotoUrl as the base and swapping it out with each response
  // until all selected pieces have been applied, then display the final result.
  const handleGenerate = async () => {
    setIsGenerating(true);
    let currentModelUrl = modelPhotoUrl;

    const selectedWardrobe = wardrobe.filter((item) =>
      selectedItems.has(item.id),
    );

    for (const item of selectedWardrobe) {
      const response = await fetch(`${config.apiBaseUrl}/tryon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_image_url: currentModelUrl,
          garment_image_url: item.image_url,
          category: item.category,
        }),
      });
      const data = await response.json();
      currentModelUrl = data.image_url; // output becomes next input
    }

    setGeneratedImageURL(currentModelUrl);
    setIsGenerating(false); // re-enable the button and clear the spinner
  };

  // ─── BUILD LOOK SELECTION CONSTRAINTS ───────────────────────────────────
  // Look at every item the user has ticked and collect their categories into a
  // Set so we know what "type" of look is being built (top+bottom vs one-piece).
  const selectedCategories = new Set(
    wardrobe
      .filter((item) => selectedItems.has(item.id))
      .map((item) => item.category),
  );
  // These two flags drive the greying-out rules below.
  const hasTopOrBottomSelected =
    selectedCategories.has("top") || selectedCategories.has("bottom");
  const hasOnePieceSelected = selectedCategories.has("one-piece");

  // Returns true when an item should be greyed out and blocked from selection.
  const isItemDisabled = (item) => {
    // Outside Build Looks mode nothing is ever disabled.
    if (!isBuildLookMode) return false;
    // "Other" items are never try-on compatible, always block them.
    if (item.category === "other") return true;
    // If the user already picked a top or bottom, one-pieces can't be mixed in.
    if (hasTopOrBottomSelected && item.category === "one-piece") return true;
    // If the user already picked a one-piece, tops and bottoms can't be mixed in.
    if (
      hasOnePieceSelected &&
      (item.category === "top" || item.category === "bottom")
    )
      return true;
    return false;
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="wardrobe-page">
      <Navbar />
      {/* Hidden file input — triggered programmatically by the avatar button */}
      <input
        ref={fileInputRef}
        type="file"
        id="avatar"
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: "none" }}
      />

      {/* Model photo section — shows photo if exists, placeholder if not.
          In Build Looks mode, swaps to the generated try-on result once
          handleGenerate has finished and stored a URL in generatedImage. */}
      {modelPhotoUrl ? (
        <img
          className="wardrobe-model-photo"
          // Show the generated outfit preview while in Build Looks mode if one
          // exists; fall back to the plain model photo in all other cases.
          src={
            isBuildLookMode && generatedImage ? generatedImage : modelPhotoUrl
          }
          alt="Your model photo"
          onClick={
            !isBuildLookMode ? () => fileInputRef.current.click() : undefined
          }
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
        <p className="wardrobe-empty-hint">
          Add clothing items to get started.
        </p>
      )}

      {/* Clothing grid — grouped by category */}
      {Object.keys(grouped).map((category) => (
        <div key={category} className="wardrobe-category">
          <h2>{category}</h2>
          {grouped[category].map((item) => (
            <div
              key={item.id}
              // Build the class string piece by piece:
              // --selectable  adds a pointer cursor in Build Looks mode
              // --selected    highlights the card when the user has ticked it
              // --disabled    greys it out when it conflicts with current picks
              className={`wardrobe-item${isBuildLookMode ? " wardrobe-item--selectable" : ""}${selectedItems.has(item.id) ? " wardrobe-item--selected" : ""}${isItemDisabled(item) ? " wardrobe-item--disabled" : ""}`}
              onClick={
                // Only wire up a click handler in Build Looks mode and when
                // the item isn't disabled. Clicking toggles it in/out of the
                // selectedItems Set (we copy the Set so React sees a new value).
                isBuildLookMode && !isItemDisabled(item)
                  ? () =>
                      setSelectedItems((prev) => {
                        const next = new Set(prev);
                        next.has(item.id)
                          ? next.delete(item.id)
                          : next.add(item.id);
                        return next;
                      })
                  : undefined
              }
            >
              {/* Only show the checkbox circle on items that can actually be selected */}
              {isBuildLookMode && !isItemDisabled(item) && (
                <div
                  // --checked fills the circle and shows a tick when selected
                  className={`wardrobe-item-check${selectedItems.has(item.id) ? " wardrobe-item-check--checked" : ""}`}
                />
              )}
              <img src={item.image_url} alt={item.name} />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      ))}

      {/* Bottom bar — contextual action above a segmented pill control */}
      <div className="wardrobe-bottom-bar">
        {!isBuildLookMode && (
          <button className="wardrobe-fab" onClick={() => setIsModalOpen(true)}>
            +
          </button>
        )}
        {isBuildLookMode && selectedItems.size > 0 && (
          <button
            className="wardrobe-btn-generate"
            onClick={() => handleGenerate()}
            // Disable the button while a generation is in flight so the user
            // can't fire a second request before the first one finishes.
            disabled={isGenerating}
          >
            {/* Swap label and show a spinner while the API call is running */}
            {isGenerating && <span className="generate-spinner" />}
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        )}
        <div className="wardrobe-segment">
          <button
            className={`wardrobe-segment-btn${!isBuildLookMode ? " wardrobe-segment-btn--active" : ""}`}
            onClick={() => {
              setIsBuildLookMode(false);
              setSelectedItems(new Set());
            }}
          >
            Add Pieces
          </button>
          <button
            className={`wardrobe-segment-btn${isBuildLookMode ? " wardrobe-segment-btn--active" : ""}`}
            onClick={() => {
              setIsBuildLookMode(true);
              setSelectedItems(new Set());
            }}
          >
            Build Looks
          </button>
        </div>
      </div>

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
              defaultValue="tops"
              onChange={(e) => setClothingPieceCategory(e.target.value)}
            >
              <option value="tops">Top</option>
              <option value="bottoms">Bottom</option>
              <option value="one-pieces">One Piece</option>
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
