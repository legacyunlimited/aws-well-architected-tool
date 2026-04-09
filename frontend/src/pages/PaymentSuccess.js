import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Success() {
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      console.log('Checkout session:', sessionId);
    }
  }, [location]);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#3fb950',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <svg fill="none" stroke="white" viewBox="0 0 24 24" width="50" height="50">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>Welcome to KBCloud Solutions!</h1>
        <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>Your subscription has been successfully activated.</p>
        
        <div style={{
          textAlign: 'left',
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '12px',
          margin: '20px 0'
        }}>
          <h3 style={{ marginTop: 0, color: '#3fb950' }}>What happens next?</h3>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li style={{ margin: '8px 0' }}>✅ You'll receive a confirmation email shortly</li>
            <li style={{ margin: '8px 0' }}>✅ We'll begin scanning your AWS account within 24 hours</li>
            <li style={{ margin: '8px 0' }}>✅ You'll receive your first cost optimization report within 48 hours</li>
          </ul>
        </div>
        
        <button onClick={() => window.location.href='/'} style={{
          background: '#3fb950',
          color: 'white',
          border: 'none',
          padding: '14px 30px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}>Return to Home</button>
      </div>
    </div>
  );
}

export default Success;
