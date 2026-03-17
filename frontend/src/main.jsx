import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Questions from './components/Questions.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <AdminDashboard></AdminDashboard>
  </StrictMode>,
)
