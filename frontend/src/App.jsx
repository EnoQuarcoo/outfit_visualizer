// App is the root component React renders into the #root div (see main.jsx).
// It's kept minimal on purpose — all real content lives in HomePage.
// If you ever add routing (multiple pages), the router would go here.
import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import WardrobeView from "./pages/WardrobeView";
import LookBook from "./pages/LookBook";
import AuthCallback from "./pages/AuthCallback";
import ProtectRoute from "./components/ProtectRoute";
import FeedbackButton from "./components/FeedbackButton";
import { supabase } from "./SupabaseClient";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function App() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/wardrobe");
      }
    });
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/wardrobe"
          element={
            <ProtectRoute>
              <WardrobeView />
            </ProtectRoute>
          }
        />
        <Route 
          path="/lookbook"
          element={
            <ProtectRoute>
              <LookBook />
            </ProtectRoute>
          }
        />
      </Routes>
      <FeedbackButton />
    </>
  );
}

export default App;
