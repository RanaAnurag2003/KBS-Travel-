import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TravelLoader from './components/TravelLoader.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CMSProvider } from './context/CMSContext.jsx'

function Root() {
  const [loaderActive, setLoaderActive] = useState(false);

  const handleLoaderDone = () => {
    setLoaderActive(false);
  };

  return (
    <StrictMode>
      <AuthProvider>
        <CMSProvider>
          {loaderActive && <TravelLoader onDone={handleLoaderDone} />}
          <div className={`app-container-wrapper ${!loaderActive ? 'content-fade-in' : ''}`}>
            <App />
          </div>
        </CMSProvider>
      </AuthProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />);

