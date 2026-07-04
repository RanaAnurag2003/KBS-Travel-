import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TravelLoader from './components/TravelLoader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TravelLoader />
    <App />
  </StrictMode>,
)
