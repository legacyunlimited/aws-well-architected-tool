import EmailCapture from "./pages/EmailCapture";
import Questions from "./pages/Questions";
import Services from "./pages/Services";
import PaymentSuccess from "./pages/PaymentSuccess";
import CustomerPortal from "./pages/CustomerPortal";

function App() {
  const path = window.location.pathname;

  // Assessment entry - captures email
  if (path === "/assessment") {
    return <EmailCapture />;
  }

  // Questions page - after email capture
  if (path === "/questions") {
    return <Questions />;
  }

  // Services/Pricing page
  if (path === "/services") {
    return <Services />;
  }

  // Payment success page - after Stripe checkout
  if (path === "/payment-success") {
    return <PaymentSuccess />;
  }

  // Customer portal - view purchased reports
  if (path === "/customer-portal") {
    return <CustomerPortal />;
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

      {/* Navigation Links */}
      <div className="mt-8 pt-8 border-t border-gray-200 flex gap-6">
        <a
          href="/services"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          View Pricing & Services
        </a>
        <a
          href="/customer-portal"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Customer Portal
        </a>
      </div>

      {/* Partner Info */}
      <div className="mt-6">
        <a
          href="/signup.html"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-block"
        >
          Become a Partner
        </a>
        <p className="text-sm text-gray-500 mt-2">
          20% commission for partners who refer customers
        </p>
      </div>
    </div>
  );
}

export default App;