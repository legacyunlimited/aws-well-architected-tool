import React, { useState, useEffect } from 'react';

const API_BASE = "https://kbcloud-backend-production.up.railway.app";

// Stripe Price IDs - Create these in Stripe Dashboard
const PRICES = {
  subscription: null, // Will use STRIPE_SUBSCRIPTION_PRICE_ID from backend
  healthCheck: 'price_1SVIYxADzK8DwhH4HmtVx1NW', // Replace with actual Price ID
  costBlueprint: 'price_1SVIanADzK8DwhH4STAiuZeE', // Replace with actual Price ID
  fullCleanup: 'price_1SVIbuADzK8DwhH4mgTfnZmu', // Replace with actual Price ID
};

// Sample report PDF paths (place PDFs in frontend/public/samples/)
const SAMPLE_REPORTS = {
  healthCheck: 'https://kbcloud-backend-production.up.railway.app/samples/health-check',
  costBlueprint: 'https://kbcloud-backend-production.up.railway.app/samples/blueprint',
  fullCleanup: 'https://kbcloud-backend-production.up.railway.app/samples/cleanup',
  platform: 'https://kbcloud-backend-production.up.railway.app/samples/platform',
};

export default function Services() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [referrerCode, setReferrerCode] = useState(null);

  // NEW: Capture referrer code from URL when page loads
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    
    // Also check localStorage (in case it was stored from assessment page)
    const storedRef = localStorage.getItem('referrerCode') || sessionStorage.getItem('referrerCode');
    
    const finalRef = ref || storedRef;
    
    if (finalRef) {
      setReferrerCode(finalRef);
      // Store it for checkout to use
      sessionStorage.setItem('referrerCode', finalRef);
      localStorage.setItem('referrerCode', finalRef);
      console.log('Referrer captured on services page:', finalRef);
    }
  }, []);

  // Helper function to add referrer to checkout request
  const addReferrerToRequest = (requestBody) => {
    if (referrerCode) {
      return { ...requestBody, referrerCode: referrerCode };
    }
    return requestBody;
  };

  const handleSubscription = async () => {
    setLoading('subscription');
    setError(null);
    
    const email = sessionStorage.getItem('assessmentEmail') || prompt('Enter your email:');
    if (!email) {
      setError('Email is required');
      setLoading(null);
      return;
    }
    
    sessionStorage.setItem('assessmentEmail', email);
    
    try {
      const requestBody = addReferrerToRequest({ customerEmail: email });
      const response = await fetch(`${API_BASE}/stripe/create-subscription-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) throw new Error('Failed to create checkout');
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError('Payment initiation failed. Please try again.');
      setLoading(null);
    }
  };
  
  const handleOneTimePurchase = async (priceId, productType, serviceName) => {
    setLoading(serviceName);
    setError(null);
    
    const email = sessionStorage.getItem('assessmentEmail') || prompt('Enter your email to receive the report:');
    if (!email) {
      setError('Email is required');
      setLoading(null);
      return;
    }
    
    sessionStorage.setItem('assessmentEmail', email);
    
    try {
      const requestBody = addReferrerToRequest({
        priceId,
        customerEmail: email,
        productType,
      });
      
      const response = await fetch(`${API_BASE}/stripe/create-onetime-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) throw new Error('Failed to create checkout session');
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError('Payment initiation failed. Please try again.');
      setLoading(null);
    }
  };
  
  // Reusable styles
  const buttonStyle = (loadingState) => ({
    background: loadingState ? '#ccc' : '#1a56db',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: loadingState ? 'not-allowed' : 'pointer',
    marginRight: '12px',
  });
  
  const sampleLinkStyle = {
    fontSize: '14px',
    marginTop: '8px',
  };
  
  const sampleLinkAnchorStyle = {
    color: '#1a56db',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };
  
  return (
    <div style={{ fontFamily: 'Arial', maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      <h1>AWS Optimization Services</h1>
      <p>No phone calls. No meetings. Clear deliverables. Fast turnaround.</p>
      
      {/* NEW: Show active referral */}
      {referrerCode && (
        <div style={{
          background: '#e6f7e6',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          border: '1px solid #2ecc71',
          textAlign: 'center'
        }}>
          ✓ Partner referral active: {referrerCode} (your partner earns 20% commission)
        </div>
      )}
      
      {error && (
        <div style={{ background: '#fee', padding: '10px', marginBottom: '20px', borderRadius: '4px', color: '#c00' }}>
          {error}
        </div>
      )}
      
      {/* SUBSCRIPTION PRODUCT */}
      <div style={{ border: '2px solid #1a56db', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>☁️ Cloud Cost Optimization Platform — <strong>$497/month</strong></h2>
        <ul>
          <li>Automated AWS cost waste detection</li>
          <li>Well-Architected assessments</li>
          <li>Unlimited scans</li>
          <li>PDF reports</li>
          <li>Priority support</li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <button 
            onClick={handleSubscription}
            disabled={loading}
            style={buttonStyle(loading === 'subscription')}
          >
            {loading === 'subscription' ? 'Processing...' : 'Subscribe Now'}
          </button>
          <div style={sampleLinkStyle}>
            <a href={SAMPLE_REPORTS.platform} target="_blank" rel="noopener noreferrer" style={sampleLinkAnchorStyle}>
              📄 View sample dashboard →
            </a>
          </div>
        </div>
      </div>
      
      {/* ONE-TIME PRODUCTS */}
      
      {/* Product 1: Health Check */}
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h2>1. AWS Health Check Report — <strong>$497</strong></h2>
        <ul>
          <li>12-pillar review</li>
          <li>Security & IAM scan</li>
          <li>Cost baseline</li>
          <li>PDF report delivered within 48 hours</li>
          <li>Read-only access only</li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <button 
            onClick={() => handleOneTimePurchase(PRICES.healthCheck, 'health-check', 'health-check')}
            disabled={loading}
            style={buttonStyle(loading === 'health-check')}
          >
            {loading === 'health-check' ? 'Processing...' : 'Buy Now - $497'}
          </button>
          <div style={sampleLinkStyle}>
            <a href={SAMPLE_REPORTS.healthCheck} target="_blank" rel="noopener noreferrer" style={sampleLinkAnchorStyle}>
              📄 View sample report →
            </a>
          </div>
        </div>
      </div>
      
      {/* Product 2: Cost Optimization Blueprint */}
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h2>2. Cost Optimization Blueprint — <strong>$995</strong></h2>
        <ul>
          <li>Deep cost analysis</li>
          <li>Waste detection</li>
          <li>Rightsizing recommendations</li>
          <li>S3 & backup improvements</li>
          <li>PDF delivered in 72 hours</li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <button 
            onClick={() => handleOneTimePurchase(PRICES.costBlueprint, 'cost-blueprint', 'cost-blueprint')}
            disabled={loading}
            style={buttonStyle(loading === 'cost-blueprint')}
          >
            {loading === 'cost-blueprint' ? 'Processing...' : 'Buy Now - $995'}
          </button>
          <div style={sampleLinkStyle}>
            <a href={SAMPLE_REPORTS.costBlueprint} target="_blank" rel="noopener noreferrer" style={sampleLinkAnchorStyle}>
              📄 View sample report →
            </a>
          </div>
        </div>
      </div>
      
      {/* Product 3: Full Cloud Cleanup */}
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h2>3. Full Cloud Cleanup — <strong>$2,497</strong></h2>
        <ul>
          <li>IAM cleanup</li>
          <li>S3 lifecycle setup</li>
          <li>Backup + cost control automation</li>
          <li>Security tightening</li>
          <li>Delivered in 5–7 days</li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <button 
            onClick={() => handleOneTimePurchase(PRICES.fullCleanup, 'full-cleanup', 'full-cleanup')}
            disabled={loading}
            style={buttonStyle(loading === 'full-cleanup')}
          >
            {loading === 'full-cleanup' ? 'Processing...' : 'Buy Now - $2,497'}
          </button>
          <div style={sampleLinkStyle}>
            <a href={SAMPLE_REPORTS.fullCleanup} target="_blank" rel="noopener noreferrer" style={sampleLinkAnchorStyle}>
              📄 View sample report →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}