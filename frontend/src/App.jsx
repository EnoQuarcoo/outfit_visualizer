// App is the root component React renders into the #root div (see main.jsx).
// It's kept minimal on purpose — all real content lives in HomePage.
// If you ever add routing (multiple pages), the router would go here.
import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router";
import Signup from "./pages/Signup"; 
import Login from "./pages/Login";
import WardrobeView from "./pages/WardrobeView";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} /> 
        <Route path="/wardrobe" element={<WardrobeView/>} />
      </Routes>
    </>
  );
}

export default App;
