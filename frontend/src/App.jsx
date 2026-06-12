// App is the root component React renders into the #root div (see main.jsx).
// It's kept minimal on purpose — all real content lives in HomePage.
// If you ever add routing (multiple pages), the router would go here.
import HomePage from './HomePage';
import SharePage from './SharePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/share" element={<SharePage/>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App;
