import { useState, useEffect, useRef, React } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../SupabaseClient";
import "./WardrobeView.css";
import { config } from "../config";
import Navbar from "../components/Navbar";
import ImageExpandModal from "../components/ImageExpandModal";
import PaywallModal from "../components/PaywallModal";
import { pricingConfig } from "../pricingConfig";
import { purchasePlan } from "../RevenueCatClient";

const WardrobeView = () => {
  const navigate = useNavigate();
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
  const [isBuildLookMode, setIsBuildLookMode] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [generatedImageURL, setGeneratedImageURL] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [expandedImageUrl, setExpandedImageUrl] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [paywallPlan, setPaywallPlan] = useState(null); // null hides the paywall; otherwise the user's current plan from the 402 response
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const DEFAULT_MODEL_URL =
    "https://fzkmlmdghyzqozndcxxp.supabase.co/storage/v1/object/public/Avatars/Abrima-default-models/genderless_model%202.jpg";

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
      .eq("user_id", user_id)
      .is("deleted_at", null); // add this line
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
  const handleAvatarChange = async (event) => {
    const avatarFile = event.target.files[0];

    const formData = new FormData();
    formData.append("img", avatarFile);

    const response = await fetch(
      `${config.apiBaseUrl}/upload_image?userId=${userId}&image_type=avatar`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();
    const publicUrl = data.database_upload_response.data[0].model_photo_url;
    // const avatarPath = `${userId}/avatar-${Date.now()}.png`;
    // const avatarFile = event.target.files[0];

    // // Upload the selected image to Supabase storage
    // const { data, uploadError } = await supabase.storage
    //   .from("Avatars")
    //   .upload(avatarPath, avatarFile);

    // // Get the public URL of the uploaded image
    // const {
    //   data: { publicUrl },
    // } = supabase.storage.from("Avatars").getPublicUrl(avatarPath);

    // // Persist the public URL to the users table
    // const { data: updateData, updateError } = await supabase
    //   .from("users")
    //   .update({ model_photo_url: publicUrl })
    //   .eq("id", userId)
    //   .select();

    // Update local state so the image renders immediately
    setModelPhotoUrl(publicUrl);
  };

  // ─── ClOTHING UPLOAD ──────────────────────────────────────────────────────
  const handleClothingSubmission = async () => {
    const formData = new FormData();
    formData.append("img", clothingFile);

    const response = await fetch(
      `${config.apiBaseUrl}/upload_image?userId=${userId}&image_type=garment&name=${clothingPieceName}&category=${clothingPieceCategory}`,
      {
        method: "POST",
        body: formData,
      },
    );

    await response.json();
    // const clothingPath = `${userId}/clothingPiece-${Date.now()}.png`;
    // // Upload the selected image to Supabase storage
    // const { data, error } = await supabase.storage
    //   .from("Clothing Pieces")
    //   .upload(clothingPath, clothingFile, {
    //     cacheControl: "3600",
    //     upsert: false,
    //   });
    // //console.log("error submitting to storage: ", error);

    // // Resolve the public URL of the uploaded image
    // const {
    //   data: { publicUrl },
    // } = supabase.storage.from("Clothing Pieces").getPublicUrl(clothingPath);

    // // Persist the public URL to the users table
    // const { data: updateData, updateError } = await supabase
    //   .from("clothing_items")
    //   .insert({
    //     user_id: userId,
    //     name: clothingPieceName,
    //     category: clothingPieceCategory,
    //     image_url: publicUrl,
    //   });
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
    let currentModelUrl = modelPhotoUrl || DEFAULT_MODEL_URL;

    const selectedWardrobe = wardrobe.filter((item) =>
      selectedItems.has(item.id),
    );

    const defaultName = selectedWardrobe.map((i) => i.name).join(" + ");
    setOutfitName(defaultName);

    
    const { data: {session}, error } = await supabase.auth.getSession()
    for (const item of selectedWardrobe) {
      const response = await fetch(`${config.apiBaseUrl}/tryon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          model_image_url: currentModelUrl,
          garment_image_url: item.image_url,
          category: item.category,
        }),
      });

      if (response.status === 402) {
        const { detail } = await response.json();
        setPaywallPlan(detail?.plan || "free");
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      currentModelUrl = data.image_url; // output becomes next input
    }

    setGeneratedImageURL(currentModelUrl);
    setIsGenerating(false); // re-enable the button and clear the spinner
    setIsResultVisible(true);
  };

  // ─── PAYWALL PURCHASE ─────────────────────────────────────────────────────
  const handleSubscribe = async (planId) => {
    setIsPurchasing(true);
    setPurchaseError("");

    const result = await purchasePlan(planId);
    setIsPurchasing(false);

    if (result.success) {
      // Entitlement is active, but credits themselves aren't granted until
      // the backend RevenueCat webhook exists (not built yet) — so a retry
      // of Generate right after this may still 402 until that's in place.
      setPaywallPlan(null);
    } else if (!result.cancelled) {
      setPurchaseError(result.message || "Something went wrong. Please try again.");
    }
    // cancelled: leave the modal open, no error, so they can just try again
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

  // ─── SAVE GENERATED OUTFIT ──────────────────────────────────────────────────
  // Fetch generatedImageURL → convert to blob
  // Upload blob to Generated Outfits bucket with path ${userId}/outfit-${Date.now()}.png
  // Get public URL back
  // Insert into outfits: user_id, name (from outfitName), image_url (the Supabase public URL)
  const handleSaveGeneratedOutfit = async () => {
    //make image url from fal.ai into a raw binary file (blob) for supabase
    const response = await fetch(generatedImageURL);
    const supabaseBlob = await response.blob();

    //send blob to supbase
    const outfitPath = `${userId}/outfit-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from("Generated Outfits")
      .upload(outfitPath, supabaseBlob, {
        //not sure if i should keep these two lines.
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.log("error submitting to storage: ", error);
    }

    // Resolve the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("Generated Outfits").getPublicUrl(outfitPath);

    // Persist the public URL to the outfit table
    const { data: updateData, error: updateError } = await supabase
      .from("outfits")
      .insert({
        user_id: userId,
        name: outfitName,
        image_url: publicUrl,
      });

    if (error || updateError) {
      console.log("Error Occured from saving"); //TODO: Display on page post MVP
    } else {
      //setGeneratedImageURL("")
      setSelectedItems(new Set());
      setOutfitName("");
      setIsResultVisible(false);
    }
  };

  // ─── DELETE CLOTHING PIECE ────────────────────────────────────────────────
  const handleClothingItemDelete = async (expandedItem) => {
    // console.log("item_id is", expandedItem.id);
    // console.log("deleting item:", expandedItem.id, expandedItem.user_id);
    const { error } = await supabase
      .from("clothing_items")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", expandedItem.id)
      .eq("user_id", expandedItem.user_id);
    if (error) {
      console.log("An error occured while deleting", error);
    } else {
      setExpandedImageUrl("");
      setExpandedItem(null);
      fetchWardrobe();
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="wardrobe-page">
      <Navbar />

      {/* Circular nav button — jumps to the saved Look Book */}
      <button
        className="page-nav-toggle"
        onClick={() => navigate("/lookbook")}
        aria-label="Go to Look Book"
        title="Look Book"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* splayed pages */}
          <path
            d="M12 5.5C10 4.5 7 4.3 4 5.2V18.2C7 17.3 10 17.5 12 18.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 5.5C14 4.5 17 4.3 20 5.2V18.2C17 17.3 14 17.5 12 18.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* spine */}
          <line
            x1="12"
            y1="5.5"
            x2="12"
            y2="18.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          {/* text lines on each page */}
          <line
            x1="6.3"
            y1="9"
            x2="9.6"
            y2="8.6"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="6.3"
            y1="12"
            x2="9.6"
            y2="11.7"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="14.4"
            y1="8.6"
            x2="17.7"
            y2="9"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="14.4"
            y1="11.7"
            x2="17.7"
            y2="12"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </button>

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
          handleGenerate has finished and stored a URL in generatedImageURL. */}

      {/* Add Pieces — upload prompt */}
      {!isBuildLookMode &&
        (modelPhotoUrl ? (
          <img
            className="wardrobe-model-photo"
            src={modelPhotoUrl}
            alt="Your model photo"
            onClick={() => fileInputRef.current.click()}
          />
        ) : (
          <button
            className="wardrobe-model-placeholder"
            onClick={() => fileInputRef.current.click()}
          >
            <span className="wardrobe-model-placeholder-title">
              + Add full body photo of yourself
            </span>
            <div className="wardrobe-model-placeholder-tips">
              <span className="wardrobe-model-placeholder-tips-label">
                For best results:
              </span>
              <ul>
                <li>Face forward, plain background, good lighting</li>
                <li>Wear form-fitting clothes so your body shape is visible</li>
                <li>
                  Keep arms, legs, and face visible — no group photos or heavy
                  shadows
                </li>
                <li>Check Build Looks for reference</li>
              </ul>
            </div>
          </button>
        ))}

      {/* Build Looks — model/generated image */}
      {isBuildLookMode && (
        <div
          className={`wardrobe-photo-block${isBuildLookMode && generatedImageURL ? " wardrobe-photo-block--result" : ""}`}
        >
          <img
            className="wardrobe-model-photo"
            src={generatedImageURL || modelPhotoUrl || DEFAULT_MODEL_URL}
            alt="Your model photo"
            onClick={
              isBuildLookMode && generatedImageURL
                ? () => setExpandedImageUrl(generatedImageURL)
                : undefined
            }
          />
          {isBuildLookMode && isResultVisible && (
            <div className="result-actions">
              <div className="result-actions-row">
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="Name this look"
                />
                <button onClick={() => setOutfitName("")}>✕</button>
              </div>
              <div className="result-actions-buttons">
                <button onClick={() => handleSaveGeneratedOutfit()}>
                  Save
                </button>
                <button
                  onClick={() => {
                    setGeneratedImageURL("");
                    setSelectedItems(new Set());
                    setOutfitName("");
                    setIsResultVisible(false);
                  }}
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty wardrobe state — shown when no clothing items exist */}
      {wardrobe.length === 0 && (
        <p className="wardrobe-empty-hint">
          Add clothing items to get started.
        </p>
      )}

      {/* Clothing grid — grouped by category */}
      {(!isBuildLookMode || !isResultVisible) &&
        Object.keys(grouped).map((category) => (
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
                <img
                  src={item.image_url}
                  alt={item.name}
                  onClick={
                    !isBuildLookMode
                      ? () => {
                          setExpandedImageUrl(item.image_url);
                          setExpandedItem(item);
                        }
                      : undefined
                  }
                />
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
        {/* {isBuildLookMode && selectedItems.size > 0 && (
          <button
            className="wardrobe-btn-generate"
            onClick={() => handleGenerate()}
            // Disable the button while a generation is in flight so the user
            // can't fire a second request before the first one finishes.
            disabled={isGenerating}
          >
            // Swap label and show a spinner while the API call is running 
            {isGenerating && <span className="generate-spinner" />}
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        )} */}

        {isBuildLookMode &&
          (selectedItems.size > 0 || isGenerating) &&
          !isResultVisible && (
            <button
              className="wardrobe-btn-generate"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
            >
              {isGenerating && <span className="generate-spinner" />}
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          )}
        <div className="wardrobe-segment">
          <button
            className={`wardrobe-segment-btn${isBuildLookMode ? " wardrobe-segment-btn--active" : ""}`}
            onClick={() => {
              setIsBuildLookMode(true);
              setSelectedItems(new Set());
            }}
          >
            Build Looks
          </button>
          <button
            className={`wardrobe-segment-btn${!isBuildLookMode ? " wardrobe-segment-btn--active" : ""}`}
            onClick={() => {
              setIsBuildLookMode(false);
              setSelectedItems(new Set());
            }}
          >
            Add Pieces
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
              disabled={!clothingFile}
            >
              Add Piece
            </button>
          </div>
        </div>
      )}

      <ImageExpandModal
        imageUrl={expandedImageUrl}
        onClose={() => setExpandedImageUrl("")}
        onDelete={() => {
          handleClothingItemDelete(expandedItem);
        }}
      />

      {paywallPlan === "free" && (
        <PaywallModal
          variant="upgrade"
          title="See the fit before you wear it"
          message={purchaseError || "Plan and visualize your outfits for work, dates, and more."}
          features={[
            "Generate ~40 outfits a month (≈80 individual try-ons)",
            "Mix and match pieces from your wardrobe",
            "Save your favorite looks",
          ]}
          plans={pricingConfig.plans}
          defaultPlanId={pricingConfig.defaultPlanId}
          ctaLabel={isPurchasing ? "Processing..." : "Get started"}
          disabled={isPurchasing}
          onSubscribe={handleSubscribe}
          onClose={() => setPaywallPlan(null)}
        />
      )}

      {paywallPlan && paywallPlan !== "free" && (
        <PaywallModal
          variant="limitReached"
          title="You've used this month's credits"
          message="Your monthly credits will refresh next billing cycle. Check back soon!"
          ctaLabel="Got it"
          onClose={() => setPaywallPlan(null)}
        />
      )}
    </div>
  );
};

export default WardrobeView;
