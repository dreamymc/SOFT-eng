import React from 'react';

// Swapped to a much more reliable stroke-based SVG that won't disappear in flexboxes
const PurchaseTagIcon = () => (
  <svg className="flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

export default function ProductCard({ id, name, price, stock, image, onBuyClick }) {
  return (
    <div className="card h-100 border-0" style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: '-2px 5px 50px 4px rgba(0,0,0,0.1)' }}>
      
      {/* Assuming the DB saves it as 'products/filename.jpg', this will work perfectly after running php artisan storage:link */}
      <img 
        src={image ? (image?.startsWith('http') ? image : `/storage/${image}`) : '/assets/images/product.png'} 
        className="card-img-top object-fit-cover" 
        alt={name} 
        style={{ height: '250px', backgroundColor: '#F4F5FA' }} 
        onError={(e) => { e.target.src = '/assets/images/product.png'; }} // Fallback if image still fails
      />
      
      <div className="card-body d-flex flex-column justify-content-between" style={{ backgroundColor: '#7978E9', color: 'white' }}>
        <h6 className="card-title fw-bold mb-3 text-truncate">{name}</h6>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div style={{ color: '#F5F7FF', fontSize: '0.85rem' }}>₱{price}</div>
            <div style={{ fontSize: '0.85rem' }}>
              <span className="fw-bold">{stock}</span> stocks available
            </div>
          </div>
          
          <button 
            onClick={() => onBuyClick({ id, name, price, stock, image })}
            disabled={stock < 1}
            className="btn d-flex align-items-center justify-content-center gap-2 fw-bold text-white px-3"
            style={{ backgroundColor: '#6C63FF', border: '1px solid black', borderRadius: '10px', height: '37px' }}
          >
            <PurchaseTagIcon /> Buy
          </button>
        </div>
      </div>
    </div>
  );
}