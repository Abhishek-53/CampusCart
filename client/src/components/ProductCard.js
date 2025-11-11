// client/src/components/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

// Define your backend URL
const API_URL = 'http://localhost:5000'; 

function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.product_id}`} className="product-card-link">
      <div className="product-card">
        {product.image_url && (
          <img 
            src={`${API_URL}${product.image_url}`} 
            alt={product.name} 
            className="product-card-image"
          />
        )}
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-details">
          <span>Price: ₹{product.estimated_price}</span>
          <span>Category: {product.category_name}</span>
          <span>Seller: {product.seller_name}</span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;