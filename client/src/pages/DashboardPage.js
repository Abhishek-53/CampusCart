// client/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';

function DashboardPage() {
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState('');
  const [myProducts, setMyProducts] = useState([]);

  // Fetch the user's own products
  const fetchMyProducts = async () => {
    try {
      // We'll create this API route in the next step
      const response = await fetch('/api/user/products'); 
      if (response.ok) {
        setMyProducts(await response.json());
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    // ... (Your existing name update logic is perfect)
    try {
      const response = await fetch('/api/user/name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });
      if (response.ok) {
        setMessage('Success! Your name has been updated. It will refresh on your next login.');
        setNewName('');
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // We'll add the "Finalize Deal" logic here later
  const handleFinalizeDeal = async (productId) => {
    // 1. Get info from the seller
    const buyerEmail = prompt("Enter the buyer's @itbhu.ac.in email:");
    if (!buyerEmail) return; // User cancelled

    const finalPrice = prompt("Enter the final agreed-upon price (e.g., 1200.50):");
    if (!finalPrice) return; // User cancelled

    // 2. Send the data to the backend
    try {
      const response = await fetch(`/api/products/${productId}/finalize`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalPrice, buyerEmail }),
      });

      if (response.ok) {
        alert('Success! The deal has been finalized. The buyer can now see the "Pay" button.');
        // Refresh the product list to show new status
        fetchMyProducts();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`An error occurred: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
      {/* --- Left Side: Update Name --- */}
      <div>
        <h1>My Dashboard</h1>
        <form onSubmit={handleNameUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
          <h3>Update Your Display Name</h3>
          <input
            type="text"
            placeholder="Enter new display name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button type="submit">Save Name</button>
        </form>
        {message && <p>{message}</p>}
      </div>

      {/* --- Right Side: My Products --- */}
      <div style={{ flexGrow: 1 }}>
        <h2>My Product Listings</h2>
        {myProducts.length > 0 ? (
          myProducts.map(product => (
            <div key={product.product_id} style={{ border: '1px solid white', padding: '10px', marginBottom: '10px', textAlign: 'left' }}>
              <h4>{product.name}</h4>
              <p>Status: {product.status}</p>
              <p>Price: ₹{product.estimated_price}</p>
              <button onClick={() => handleFinalizeDeal(product.product_id)}>
                Finalize Deal
              </button>
            </div>
          ))
        ) : (
          <p>You have not listed any products yet.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;