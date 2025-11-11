// client/src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';

function AdminPage() {
  const [pendingProducts, setPendingProducts] = useState([]);

  const fetchPendingProducts = async () => {
    try {
      const response = await fetch('/api/admin/pending-products');
      if (response.ok) {
        setPendingProducts(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch pending products:", error);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleApprove = async (productId) => {
    try {
      await fetch(`/api/admin/products/${productId}/approve`, { method: 'PUT' });
      alert('Product approved!');
      // Refresh the list after approving
      fetchPendingProducts();
    } catch (error) {
      alert('Failed to approve product.');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Pending Products</h2>
      {pendingProducts.length > 0 ? (
        pendingProducts.map(product => (
          <div key={product.product_id} style={{ border: '1px solid white', padding: '10px', marginBottom: '10px' }}>
            <h4>{product.name}</h4>
            <p>{product.description}</p>
            <p>Price: {product.estimated_price}</p>
            <button onClick={() => handleApprove(product.product_id)}>Approve</button>
          </div>
        ))
      ) : (
        <p>No products are waiting for approval.</p>
      )}
    </div>
  );
}

export default AdminPage;