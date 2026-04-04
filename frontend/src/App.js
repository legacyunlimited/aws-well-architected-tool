import EmailCapture from "./pages/EmailCapture";

function App() {
  const path = window.location.pathname;

  // Assessment entry
  if (path === "/assessment") {
    return <EmailCapture />;
  }

  // Marketing homepage
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '32px',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#111827'
      }}>
        See how your AWS setup scores in 2 minutes
      </h1>

      <p style={{
        marginBottom: '24px',
        color: '#6b7280',
        maxWidth: '600px',
        lineHeight: '1.5'
      }}>
        Answer 12 quick questions to uncover cost, reliability, and security
        insights based on the AWS Well-Architected Framework.
      </p>

      <a
        href="/assessment"
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '32px'
        }}
      >
        Start Free Assessment
      </a>

      <div style={{
        borderTop: '1px solid #e5e7eb',
        width: '100%',
        maxWidth: '400px',
        margin: '16px 0'
      }}></div>

      <button
        onClick={async () => {
          const API_URL = 'https://kbcloud-backend-production.up.railway.app';
          const urlParams = new URLSearchParams(window.location.search);
          const referralCode = urlParams.get('ref');
          if (referralCode) {
            localStorage.setItem('referral_code', referralCode);
          }
          const storedCode = localStorage.getItem('referral_code');
          
          const response = await fetch(`${API_URL}/api/checkout/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralCode: storedCode })
          });
          const { url } = await response.json();
          window.location.href = url;
        }}
        style={{
          backgroundColor: '#3fb950',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '16px'
        }}
      >
        Get Full Platform - $497/month
      </button>
      <p style={{
        fontSize: '14px',
        color: '#9ca3af',
        marginTop: '12px'
      }}>
        20% commission for partners who refer customers
      </p>
    </div>
  );
}

export default App;
