import React, { useState } from "react";
import "./flashcards.css";

// Variables commonly used in high school algebra
const VARIABLES = ["x", "y", "z", "a", "b", "c"];

// Utility to get random integer between min and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility to randomly pick an element from an array
function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to format each term
function term(coef, variable, exponent) {
  // Handle coefficient signs and omit 1
  let coefStr = "";
  if (coef === -1) coefStr = "-";
  else if (coef !== 1) coefStr = coef.toString();

  // Exponent rules
  if (exponent === 0) return coef ? `${coef}` : "1"; // anything^0 → 1 unless coef is empty
  if (exponent === 1) return `${coefStr}${variable}`; // anything^1 → variable
  return `${coefStr}${variable}^${exponent}`;
}

// Generate a flashcard for one of the four exponent cases
function generateFlashcard() {
  const caseNum = randInt(1, 4);

  // Coefficients can be negative but nonzero
  let a, b;
  do { a = randInt(-6, 6); } while (a === 0);
  do { b = randInt(-6, 6); } while (b === 0);

  const v1 = randChoice(VARIABLES);
  const v2 = randChoice(VARIABLES.filter((x) => x !== v1)); // For case 4
  const m = randInt(-4, 4);
  const n = randInt(-4, 4);
  const p = randInt(0, 4);
  const q = randInt(0, 4);

  let expr = "";
  let answer = "";

  switch (caseNum) {
    case 1: // Single variable, positive exponents
      const m1 = Math.max(1, m);
      const n1 = Math.max(1, n);
      expr = `(${term(a, v1, m1)})(${term(b, v1, n1)})`;
      answer = `${a * b}${v1}^${m1 + n1}`;
      break;

    case 2: // Single variable, negative exponents
      const m2 = Math.max(1, m);
      const n2 = -Math.abs(n);
      expr = `(${term(a, v1, m2)})(${term(b, v1, n2)})`;
      const exponent2 = m2 + n2;
      if (exponent2 > 0) {
        answer = `${a * b}${v1}^${exponent2}`;
      } else if (exponent2 === 0) {
        answer = `${a * b}`;
      } else {
        answer = `1/${a * b}${v1}^${-exponent2}`;
      }
      break;

    case 3: // Single variable, zero exponent
      const m3 = Math.max(1, m);
      expr = `(${term(a, v1, m3)})(${term(b, v1, 0)})`;
      answer = `${a * b}${v1}^${m3}`;
      break;

    case 4: // Two variables, non-negative exponents
      const m4 = Math.max(0, m);
      const n4 = Math.max(0, n);
      const p4 = Math.max(0, p);
      const q4 = Math.max(0, q);
      expr = `(${term(a, v1, m4)}${term(1, v2, n4)})(${term(b, v1, p4)}${term(1, v2, q4)})`;
      answer = `${a * b}${v1}^${m4 + p4}${v2}^${n4 + q4}`;
      break;
  }

  return { expr, answer };
}

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const startPractice = () => {
    const newSet = Array.from({ length: 10 }, () => generateFlashcard());
    setFlashcards(newSet);
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const checkAnswer = (userInput, correct) => {
    // Remove whitespace for comparison
    return userInput.replace(/\s+/g, "") === correct.replace(/\s+/g, "");
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
  };

  if (!flashcards.length) {
    return (
      <div className="flashcards-container">
        <h1>Exponent Rule Flashcards</h1>
        <button className="btn-primary" onClick={startPractice}>
          Start Practice
        </button>
      </div>
    );
  }

  if (showResults) {
    const score = flashcards.filter((card, i) =>
      checkAnswer(answers[i] || "", card.answer)
    ).length;

    return (
      <div className="answer-key-screen">
        <p className="score">Score: {score}/{flashcards.length}</p>
        <h2>Answer Key</h2>

        <div className="answer-key">
          {flashcards.map((card, i) => {
            const correct = checkAnswer(answers[i] || "", card.answer);
            return (
              <div key={i}>
                <p>
                  <strong>Q{i + 1}:</strong> {card.expr}<br />
                  Your Answer: {answers[i] || "(none)"} {correct ? "✓" : "✗"}<br />
                  Correct Answer: {card.answer}
                </p>
              </div>
            );
          })}
        </div>
        <div className="button-group">
          <button className="btn-primary" onClick={startPractice}>
            Try Another Set
          </button>
          <button className="btn-submit" onClick={() => setShowResults(false)}>
            Back to Cards
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  return (
    <div className="flashcards-container">
      <h1>Question {currentIndex + 1} / {flashcards.length}</h1>
      <div className="flashcard">{currentCard.expr}</div>
      <input
        type="text"
        className="input-answer"
        placeholder="Your answer"
        value={answers[currentIndex] || ""}
        onChange={(e) => handleAnswer(e.target.value)}
      />
      <div className="button-group">
        <button className="btn-primary" onClick={prevCard}>Previous</button>
        <button className="btn-primary" onClick={nextCard}>Next</button>
        <button className="btn-submit" onClick={() => setShowResults(true)}>Submit</button>
      </div>
    </div>
  );
}