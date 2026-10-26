import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return <Dashboard />
}