// App is the root component React renders into the #root div (see main.jsx).
// It's kept minimal on purpose — all real content lives in HomePage.
// If you ever add routing (multiple pages), the router would go here.
import HomePage from './HomePage';

function App() {
  return <HomePage />;
}

export default App;
