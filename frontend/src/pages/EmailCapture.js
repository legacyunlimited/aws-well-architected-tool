import React, { useState } from "react";
import Questions from "./Questions";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [started, setStarted] = useState(false);

  if (started) {
    return <Questions email={email} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">AWS Well-Architected Assessment</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Enter your email to begin your 12-question AWS Health Check.
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
          if (email) setStarted(true);
          else alert("Please enter your email to continue.");
        }}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Start Assessment
      </button>
    </div>
  );
}

