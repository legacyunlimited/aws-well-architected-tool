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
    </div>
  );
}

export default App;

