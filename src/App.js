import EmailCapture from "./pages/EmailCapture";

function App() {
  const path = window.location.pathname;

  // Assessment entry
  if (path === "/assessment") {
    return <EmailCapture />;
  }

  // Marketing homepage
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">
        See how your AWS setup scores in 2 minutes
      </h1>

      <p className="mb-6 text-gray-600 max-w-xl">
        Answer 12 quick questions to uncover cost, reliability, and security
        insights based on the AWS Well-Architected Framework.
      </p>

      <a
        href="/assessment"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Start Free Assessment
      </a>

      {/* Checkout Button */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <button
          onClick={async () => {
            const API_URL = 'https://kbcloud-backend-production.up.railway.app';
            // Check for referral code in URL
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
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Get Full Platform - $497/month
        </button>
        <p className="text-sm text-gray-500 mt-2">
          20% commission for partners who refer customers
        </p>
      </div>
    </div>
  );
}

export default App;
