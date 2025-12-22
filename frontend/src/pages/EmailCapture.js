import React, { useState } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");

  const startAssessment = () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      alert("Please enter a valid email address.");
      return;
    }

    // Store email for next step
    sessionStorage.setItem("assessmentEmail", email);

    // Go to questions page
   
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">AWS Assessment</h1>

      <p className="mb-6 text-gray-600 max-w-md">
        Answer 12 quick questions to see how your AWS environment scores across
        security, cost, reliability, and performance.
      </p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="border border-gray-300 rounded-md p-2 w-64 mb-4 text-center"
      />

<button
  onClick={() => {
    console.log("BUTTON CLICKED");
    startAssessment();
  }}
  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
>
  Start Free Assessment
</button>

    </div>
  );
}

