import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TravelLoader from './components/TravelLoader.jsx'

function Root() {
  const [loaderActive, setLoaderActive] = useState(false);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("kbs_loader_played");
    if (!hasPlayed) {
      setLoaderActive(true);
    }
  }, []);

  const handleLoaderDone = () => {
    sessionStorage.setItem("kbs_loader_played", "true");
    setLoaderActive(false);
  };

  return (
    <StrictMode>
      {loaderActive ? (
        <TravelLoader onDone={handleLoaderDone} />
      ) : (
        <App />
      )}
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
