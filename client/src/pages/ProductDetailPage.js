// client/src/pages/ProductDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000'; 

function ProductDetailPage(user) {
  const [product, setProduct] = useState(null);
  const [showEmail, setShowEmail] = useState(false); // <-- Add state
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          setProduct(await response.json());
        } else {
          console.error("Product not found");
          setProduct(null);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <div>Loading product details...</div>;
  }
  if (user && product) {
    console.log("--- PAY BUTTON DEBUG ---");
    console.log("1. Is user logged in?", !!user);
    console.log("2. Is product not sold?", product.status !== 'sold');
    console.log("3. Is final price set?", !!product.final_price);
    console.log("4. Logged-in user's ID:", user.user_id);
    console.log("5. Product's intended buyer ID:", product.intended_buyer_id);
    console.log("6. Do the IDs match?", product.intended_buyer_id === user.user_id);
    console.log("------------------------");
  }
  const showPayButton = 
    user && // Is the user logged in?
    product.intended_buyer_id === user.user_id && // Is this the intended buyer?
    product.final_price && // Is a final price set?
    product.status !== 'sold';
  return (
    <div>
      <h1>{product.name}</h1>
      {product.image_url && (
        <img 
          src={`${API_URL}${product.image_url}`} 
          alt={product.name} 
          style={{ width: '100%', maxWidth: '500px', height: 'auto', borderRadius: '8px' }}
        />
      )}
      <p>{product.description}</p>
      <p><strong>Estimated Price:</strong> ₹{product.estimated_price}</p>
      <p><strong>Category:</strong> {product.category_name}</p>
      <p><strong>Seller:</strong> {product.seller_name}</p>
      
      {/* --- ADD THIS NEW SECTION --- */}
      <button onClick={() => setShowEmail(!showEmail)}>
        {showEmail ? 'Hide Seller Info' : 'Contact Seller'}
      </button>

      {showEmail && (
        <div style={{ marginTop: '10px' }}>
          <p>Please contact the seller at: <strong>{product.seller_email}</strong></p>
        </div>
      )}
      {showPayButton && (
        <div style={{ marginTop: '20px', padding: '10px', border: '2px solid #61dafb' }}>
          <h3>Deal Finalized!</h3>
          <p>The seller has offered you this product for the final price of: 
            <strong> ₹{product.final_price}</strong>
          </p>
          <button style={{ backgroundColor: '#61dafb', color: '#282c34', fontSize: '1.2rem', padding: '10px 20px' }}>
            Pay Now
          </button>
        </div>
      )}
      {/* --------------------------- */}

    </div>
  );
}

export default ProductDetailPage;