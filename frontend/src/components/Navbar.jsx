import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "../SupabaseClient";
import { config } from "../config";
import DeleteAccountModal from "./DeleteAccountModal";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(`${config.apiBaseUrl}/account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      console.error("Account deletion failed:", await response.text());
      setIsDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Brand wordmark — left side */}
      <span className="navbar-wordmark">Abrima</span>

      {/* Menu — right side. Replaces the standalone Log out button so
          Delete account has somewhere to live without crowding the navbar. */}
      <div className="navbar-menu">
        <button
          className="navbar-menu-trigger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          ⋯
        </button>

        {isMenuOpen && (
          <>
            {/* Portaled straight into <body> — .navbar's backdrop-filter
                creates a containing block for position:fixed children in
                WebKit, which was trapping this backdrop inside the navbar's
                own ~56px strip instead of covering the full screen. */}
            {createPortal(
              <div
                className="navbar-menu-backdrop"
                onClick={() => setIsMenuOpen(false)}
              />,
              document.body,
            )}
            <div className="navbar-menu-dropdown">
              <button
                className="navbar-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                Log out
              </button>
              <button
                className="navbar-menu-item navbar-menu-item--danger"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDeleteModalOpen(true);
                }}
              >
                Delete account
              </button>
            </div>
          </>
        )}
      </div>

      {isDeleteModalOpen &&
        createPortal(
          <DeleteAccountModal
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteAccount}
            isDeleting={isDeleting}
          />,
          document.body,
        )}
    </nav>
  );
};

export default Navbar;
