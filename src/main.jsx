import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TravelLoader from './components/TravelLoader.jsx'

function Root() {
  const [loaderActive, setLoaderActive] = useState(() => {
    if (typeof window !== "undefined") {
      const hasPlayed = sessionStorage.getItem("kbs_loader_played");
      return !hasPlayed;
    }
    return true;
  });

  const handleLoaderDone = () => {
    sessionStorage.setItem("kbs_loader_played", "true");
    setLoaderActive(false);
  };

  return (
    <StrictMode>
      {loaderActive && <TravelLoader onDone={handleLoaderDone} />}
      <div className={`app-container-wrapper ${!loaderActive ? 'content-fade-in' : ''}`}>
        <App />
      </div>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
