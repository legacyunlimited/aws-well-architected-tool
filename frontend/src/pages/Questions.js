import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

const Questions = ({ email }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  // Load questions from JSON
  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions))
      .catch(() => setError("Failed to load questions"));
  }, []);

  const handleAnswerChange = (pillar, question, value) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: value
    }));
  };

  const handleSubmit = async () => {
    if (!email) {
      setError("Missing email. Please restart the assessment.");
      return;
    }

    const contactId = email.replace(/[^a-zA-Z0-9]/g, "") + Date.now();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        "https://wus8k3xh18.execute-api.us-east-1.amazonaws.com/prod/submit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contactId,
            accessKeyId: "",
            secretAccessKey: "",
            answers
          })
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setSuccess(true);
      generateSummary();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = () => {
    const summaryData = {};
    questions.forEach((q) => {
      const ans = answers[q.question];
      if (!ans) return;

      if (!summaryData[q.pillar]) {
        summaryData[q.pillar] = { Yes: 0, No: 0, Partially: 0 };
      }

      summaryData[q.pillar][ans]++;
    });

    setSummary(summaryData);
  };

  const resetAssessment = () => {
    setAnswers({});
    setSuccess(false);
    setError(null);
    setSummary(null);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text("AWS Well-Architected Assessment Summary", 14, 20);

    doc.setFontSize(12);
    doc.text(`Email: ${email}`, 14, 30);
    doc.text(`Date: ${timestamp}`, 14, 38);

    let y = 50;

    Object.entries(summary).forEach(([pillar, results]) => {
      doc.setFontSize(14);
      doc.text(pillar, 14, y);
      y += 8;

      doc.setFontSize(12);
      doc.text(`Yes: ${results.Yes}`, 20, y);
      y += 6;
      doc.text(`Partially: ${results.Partially}`, 20, y);
      y += 6;
      doc.text(`No: ${results.No}`, 20, y);
      y += 10;
    });

    doc.save(`AWS-Assessment-${email}.pdf`);
  };

  const grouped = questions.reduce((acc, q) => {
    acc[q.pillar] = acc[q.pillar] || [];
    acc[q.pillar].push(q);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AWS Well-Architected Assessment</h1>

      {!summary && (
        <>
          <p style={{ textAlign: "center", marginBottom: 20 }}>
            <strong>Email:</strong> {email}
          </p>

          {Object.entries(grouped).map(([pillar, qs]) => (
            <div key={pillar} style={styles.pillarSection}>
              <h2 style={styles.pillarTitle}>{pillar}</h2>

              {qs.map((q, index) => (
                <div key={index} style={styles.questionCard}>
                  <p>{q.question}</p>
                  <div style={styles.options}>
                    {q.options.map((opt) => (
                      <label key={opt} style={styles.optionLabel}>
                        <input
                          type="radio"
                          name={q.question}
                          value={opt}
                          checked={answers[q.question] === opt}
                          onChange={() =>
                            handleAnswerChange(pillar, q.question, opt)
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          {success && (
            <p style={styles.success}>Responses saved successfully!</p>
          )}
          {error && <p style={styles.error}>{error}</p>}
        </>
      )}

      {summary && (
        <div style={styles.summaryContainer}>
          <h2 style={{ textAlign: "center", color: "#232f3e" }}>
            Assessment Summary
          </h2>

          {Object.entries(summary).map(([pillar, results]) => (
            <div key={pillar} style={styles.summaryCard}>
              <h3 style={{ color: "#0073bb" }}>{pillar}</h3>
              <p>Yes: {results.Yes}</p>
              <p>Partially: {results.Partially}</p>
              <p>No: {results.No}</p>
            </div>
          ))}

          <div style={styles.summaryButtons}>
            <button onClick={downloadPDF} style={styles.pdfButton}>
              Download PDF Summary
            </button>
            <button onClick={resetAssessment} style={styles.restartButton}>
              Start New Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    color: "#232f3e"
  },
  pillarSection: {
    marginBottom: "30px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px"
  },
  pillarTitle: {
    color: "#0073bb",
    borderBottom: "2px solid #0073bb",
    paddingBottom: "4px",
    marginBottom: "10px"
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "10px",
    border: "1px solid #eee"
  },
  options: {
    display: "flex",
    gap: "15px",
    marginTop: "5px"
  },
  optionLabel: {
    fontSize: "14px"
  },
  button: {
    backgroundColor: "#0073bb",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "block",
    margin: "20px auto"
  },
  success: {
    textAlign: "center",
    color: "green"
  },
  error: {
    textAlign: "center",
    color: "red"
  },
  summaryContainer: {
    textAlign: "center"
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #eee",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  },
  summaryButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "20px"
  },
  pdfButton: {
    backgroundColor: "#0073bb",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  restartButton: {
    backgroundColor: "#232f3e",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default Questions;

