import EmailCapture from "./pages/EmailCapture";
import Services from './pages/Services';
import PaymentSuccess from './pages/PaymentSuccess';
import Questions from './pages/Questions';

function App() {
  const path = window.location.pathname;

  // Assessment entry - captures email first
  if (path === "/assessment") {
    return <EmailCapture />;
  }

  // Questions page - after email capture
  if (path === "/questions") {
    return <Questions />;
  }

  // Services page - pricing and products
  if (path === "/services") {
    return <Services />;
  }

  // Payment success page - after Stripe checkout
  if (path === "/payment-success") {
    return <PaymentSuccess />;
  }

  // Marketing homepage (root path)
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

      {/* This button should link to /services, not directly to Stripe */}
      <a
        href="/services"
        style={{
          backgroundColor: '#3fb950',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          textDecoration: 'none',
          fontSize: '16px',
          marginTop: '16px'
        }}
      >
        View Pricing & Products →
      </a>
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

export default App;// Force rebuild - Thu Apr  9 10:51:39 UTC 2026
