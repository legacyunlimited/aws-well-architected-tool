import React, { useEffect, useState } from 'react';

const API_BASE = "https://kbcloud-backend-production.up.railway.app";

export default function PaymentSuccess() {
  const [status, setStatus] = useState('loading');
  const [reportInfo, setReportInfo] = useState(null);
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      checkSessionStatus(sessionId);
      
      // Start countdown for redirect to AWS connection
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = `/connect-aws?session_id=${sessionId}`;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
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
      
      {(status === 'processing' || status === 'success') && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ color: '#10b981' }}>Payment Successful!</h1>
          <p>Thank you for your purchase.</p>
          <p style={{ margin: '20px 0' }}>
            Next, we'll need read-only access to your AWS account to generate your report.
          </p>
          
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: '#f0f9ff', 
            borderRadius: '8px',
            textAlign: 'left'
          }}>
            <h3 style={{ marginTop: 0 }}>What's Next?</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>✓ You'll be redirected to connect your AWS account</li>
              <li>✓ We'll run an automated scan (5-10 minutes)</li>
              <li>✓ Your comprehensive PDF report will be emailed to you</li>
              <li>✓ You can track progress in the Customer Portal</li>
            </ul>
          </div>
          
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '20px' }}>
            Redirecting in {countdown} seconds...
          </p>
          
          <a 
            href={`/connect-aws?session_id=${new URLSearchParams(window.location.search).get('session_id')}`}
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            Connect AWS Now →
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
