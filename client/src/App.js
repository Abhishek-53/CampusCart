// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SellPage from './pages/SellPage';
import AdminPage from './pages/AdminPage'; // <-- Import the new page
import ProductDetailPage from './pages/ProductDetailPage'; 
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if a user is logged in when the app loads
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (response.ok) {
          setUser(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar user={user} />
        <header className="App-header">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/admin" element={<AdminPage />} /> 
            <Route path="/product/:id" element={<ProductDetailPage user={user} />} />
          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;