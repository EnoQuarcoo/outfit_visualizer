import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../SupabaseClient";
import "./WardrobeView.css";
import "./LookBook.css";
import Navbar from "../components/Navbar";
import ImageExpandModal from "../components/ImageExpandModal";

const LookBook = () => {
  const navigate = useNavigate();
  // ─── STATE ───────────────────────────────────────────────────────────────
  const [userId, setUserId] = useState("");
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [expandedImageUrl, setExpandedImageUrl] = useState("");

  useEffect(() => {
    const fetchSavedOutfits = async () => {
      //fetch authenticated user id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const user_id = user.id;
      setUserId(user.id);
      //console.log("the user's id is", user_id);

      const { data, error } = await supabase
        .from("outfits")
        .select("*")
        .eq("user_id", user_id);
        //console.log("data is ", data);

      if (error) {
        console.log(error);
      } else {
        setSavedOutfits(data);
      }
    };

    fetchSavedOutfits();
  }, []);
  return (
    <div className="wardrobe-page lookbook-page">
      <Navbar />

      {/* Circular nav button — jumps back to the Wardrobe */}
      <button
        className="page-nav-toggle"
        onClick={() => navigate("/wardrobe")}
        aria-label="Go to Wardrobe"
        title="Wardrobe"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* cornice */}
          <rect x="3" y="2" width="18" height="2" rx="0.6" stroke="currentColor" strokeWidth="1.2" />
          {/* body with double doors */}
          <rect x="4" y="4.5" width="16" height="16.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <line x1="12" y1="4.5" x2="12" y2="21" stroke="currentColor" strokeWidth="1.2" />
          {/* handles */}
          <circle cx="10.3" cy="12.5" r="0.7" fill="currentColor" />
          <circle cx="13.7" cy="12.5" r="0.7" fill="currentColor" />
          {/* feet */}
          <line x1="6" y1="21" x2="6" y2="22.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="21" x2="18" y2="22.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <h2 className="lookbook-title">Look Book</h2>

      {savedOutfits.length === 0 && (
        <p className="wardrobe-empty-hint">No saved outfits yet.</p>
      )}

      <div className="lookbook-grid">
        {savedOutfits.map((x) => (
          <div key={x.id} className="wardrobe-item lookbook-card">
            <img
              src={x.image_url}
              alt={x.name}
              onClick={() => setExpandedImageUrl(x.image_url)}
            />
            <p>{x.name}</p>
          </div>
        ))}
      </div>

      <ImageExpandModal
        imageUrl={expandedImageUrl}
        onClose={() => setExpandedImageUrl("")}
      />
    </div>
  );
};

export default LookBook;
