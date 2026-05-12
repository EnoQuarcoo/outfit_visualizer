// App is the root component React renders into the #root div (see main.jsx).
// It's kept minimal on purpose — all real content lives in HomePage.
// If you ever add routing (multiple pages), the router would go here.
import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router";
//import login components
//import signup components
import Signup from "./pages/Signup"; 


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="signup" element={<Signup />} />
        {/* <Route path="login" element={<Login />} />  */}
        
      </Routes>
    </>
  );
}

export default App;
