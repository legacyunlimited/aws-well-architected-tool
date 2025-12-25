import React, { useState } from "react";
import Questions from "./Questions";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [started, setStarted] = useState(false);

  const startAssessment = () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      alert("Please enter a valid email address.");
      return;
    }

    // Store email for next step
    sessionStorage.setItem("assessmentEmail", email);
    setStarted(true);
  };

  if (started) {
    return <Questions email={email} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8 text-center">
      {/* Headline */}
      <h1 className="text-3xl font-semibold mb-4">
        See how your AWS setup scores in 2 minutes
      </h1>

      {/* Subheadline */}
      <p className="mb-4 text-gray-600 max-w-md">
        Answer 12 quick questions to identify cost waste, reliability gaps, and
        security risks based on the AWS Well-Architected Framework.
      </p>

      {/* What you'll get */}
      <p className="mb-6 text-sm text-gray-500 max-w-md">
        What you’ll get:
        <br />• A normalized score (0–100)
        <br />• A risk severity rating (Low / Medium / High)
        <br />• A recommended next step — no calls required
      </p>

      {/* Email input */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="border border-gray-300 rounded-md p-2 w-64 mb-4 text-center"
      />

      {/* CTA */}
      <button
        onClick={startAssessment}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
      >
        Start Free Assessment
      </button>

      {/* Lighter reassurance text */}
      <p className="mt-3 text-xs text-gray-400">
        No login. No changes to your AWS account.
      </p>
    </div>
  );
}

