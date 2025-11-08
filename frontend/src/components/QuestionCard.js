import React from "react";

const QuestionCard = ({ id, pillar, question, handleAnswer }) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "15px",
      }}
    >
      <h3>{pillar}</h3>
      <p>{question}</p>
      <div onChange={(e) => handleAnswer(id, e.target.value)}>
        <label>
          <input type="radio" name={id} value="Yes" /> Yes
        </label>{" "}
        <label>
          <input type="radio" name={id} value="Partially" /> Partially
        </label>{" "}
        <label>
          <input type="radio" name={id} value="No" /> No
        </label>
      </div>
    </div>
  );
};

export default QuestionCard;

