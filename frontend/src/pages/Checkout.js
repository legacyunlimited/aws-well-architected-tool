import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const urlReferrer = searchParams.get('ref');
  const product = searchParams.get('product');
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get referrer from URL or localStorage
  const referrerCode = urlReferrer || localStorage.getItem('referrerCode');
  
  const handlePurchase = async () => {
    setLoading(true);
    
    const response = await fetch('https://kcloud-backend-production.up.railway.app/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        productId: product || 'health_check_497',
        referrerCode: referrerCode  // Critical: attach referrer
      })
    });
    
    const data = await response.json();
    
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl; // Redirect to Stripe
    }
  };
  
  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Complete Your Purchase</h1>
      <p>Product: AWS Health Check – $497</p>
      
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
      />
      
      <button 
        onClick={handlePurchase}
        disabled={!email || loading}
        style={{ width: "100%", padding: "12px", background: "#0070f3", color: "white", border: "none", borderRadius: "6px" }}
      >
        {loading ? "Processing..." : "Pay $497"}
      </button>
      
      {referrerCode && (
        <p style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
          Referral code active: {referrerCode}
        </p>
      )}
    </div>
  );
}