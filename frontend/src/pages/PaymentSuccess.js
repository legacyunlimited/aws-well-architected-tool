import React, { useEffect, useState } from 'react';

const API_BASE = "https://kbcloud-backend-production.up.railway.app";

export default function PaymentSuccess() {
  const [status, setStatus] = useState('loading');
  const [reportInfo, setReportInfo] = useState(null);
  
  useEffect(() => {
    // Manual URL parsing instead of react-router-dom
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      checkSessionStatus(sessionId);
    } else {
      setStatus('error');
    }
  }, []);
  
  const checkSessionStatus = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/stripe/session/${sessionId}`);
      const data = await response.json();
      
      if (data.status === 'paid' || data.status === 'complete') {
        setStatus('success');
        setReportInfo(data);
      } else {
        setStatus('processing');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setStatus('error');
    }
  };
  
  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '100px auto', 
      padding: '40px', 
      textAlign: 'center', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
    }}>
      {status === 'loading' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h1>Processing Your Payment...</h1>
          <p style={{ color: '#6b7280' }}>Please wait while we confirm your payment.</p>
        </>
      )}
      
      {status === 'processing' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
          <h1 style={{ color: '#2563eb' }}>Payment Confirmed!</h1>
          <p>Your report is being generated and will be emailed to you shortly.</p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '20px' }}>
            This usually takes 5-10 minutes.
          </p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ color: '#10b981' }}>Payment Successful!</h1>
          <p>Thank you for your purchase.</p>
          <p>Your comprehensive AWS report is being generated and will be emailed to:</p>
          <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '20px 0' }}>
            {reportInfo?.customerEmail || 'your email'}
          </p>
          
          <div style={{ 
            marginTop: '40px', 
            padding: '20px', 
            background: '#f0f9ff', 
            borderRadius: '8px',
            textAlign: 'left'
          }}>
            <h3 style={{ marginTop: 0 }}>What's Next?</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>✓ Check your email in the next 5-10 minutes</li>
              <li>✓ Report includes detailed findings and recommendations</li>
              <li>✓ Save the PDF for your records</li>
              <li>✓ Reply to the email with any questions</li>
            </ul>
          </div>
          
          <a 
            href="/services" 
            style={{
              display: 'inline-block',
              marginTop: '30px',
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            ← Return to Services
          </a>
        </>
      )}
      
      {status === 'error' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ color: '#ef4444' }}>Something went wrong</h1>
          <p>Please contact support@kbcloudsolutions.com with your order details.</p>
          <a 
            href="/services" 
            style={{
              display: 'inline-block',
              marginTop: '30px',
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            Return to Services
          </a>
        </>
      )}
    </div>
  );
}
