import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../SupabaseClient";
import Button from "./Button";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Brand wordmark — left side */}
      <span className="navbar-wordmark">Abrima</span>

      {/* Logout — right side. Button's width:100% is overridden in Navbar.css
          so it sits inline rather than stretching the full container. */}
      <div className="navbar-logout">
        <Button text="Log out" onClick={handleLogout} />
      </div>
    </nav>
  );
};

export default Navbar;
