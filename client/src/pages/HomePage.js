// client/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import './HomePage.css'; // <-- 1. Import a new CSS file

function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          setProducts(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Products for Sale</h2>
      {/* 2. Wrap the list in a container */}
      <div className="product-list-container">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))
        ) : (
          <p>No products listed yet.</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;