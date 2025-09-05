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

// Format a single term
function term(coef, variable, exponent) {
  if (exponent === 0) return coef === 1 ? "1" : coef.toString();
  let coefStr = "";
  if (coef === -1) coefStr = "-";
  else if (coef !== 1) coefStr = coef.toString();
  if (exponent === 1) return `${coefStr}${variable}`;
  return `${coefStr}${variable}^${exponent}`;
}

// Multiply terms of the same variable
function multiplyTerms(coef1, exp1, coef2, exp2, variable) {
  const newCoef = coef1 * coef2;
  const newExp = exp1 + exp2;
  return term(newCoef, variable, newExp);
}

// Generate a flashcard for one of the four cases
function generateFlashcard() {
  const caseNum = randInt(1, 4);

  // Coefficients can be negative but nonzero
  let a, b;
  do { a = randInt(-6, 6); } while (a === 0);
  do { b = randInt(-6, 6); } while (b === 0);

  const v1 = randChoice(VARIABLES);
  const v2 = randChoice(VARIABLES.filter((x) => x !== v1));
  const m = randInt(-4, 4);
  const n = randInt(-4, 4);
  const p = randInt(0, 4);
  const q = randInt(0, 4);

  let expr = "";
  let answer = "";

  switch (caseNum) {
    case 1: { // Single variable, positive exponents
      const m1 = Math.max(1, m);
      const n1 = Math.max(1, n);
      expr = `(${term(a, v1, m1)})(${term(b, v1, n1)})`;
      answer = multiplyTerms(a, m1, b, n1, v1);
      break;
    }
    case 2: { // Single variable, negative exponents
      const m1 = Math.max(1, m);
      const n1 = -Math.abs(n);
      expr = `(${term(a, v1, m1)})(${term(b, v1, n1)})`;
      answer = multiplyTerms(a, m1, b, n1, v1);
      break;
    }
    case 3: { // Single variable, zero exponent
      const m1 = Math.max(1, m);
      expr = `(${term(a, v1, m1)})(${term(b, v1, 0)})`;
      answer = multiplyTerms(a, m1, b, 0, v1);
      break;
    }
    case 4: { // Two variables, non-negative exponents
      const m1 = Math.max(0, m);
      const n1 = Math.max(0, n);
      const p1 = Math.max(0, p);
      const q1 = Math.max(0, q);
      expr = `(${term(a, v1, m1)}${term(1, v2, n1)})(${term(b, v1, p1)}${term(1, v2, q1)})`;
      const coef = a * b;
      const expV1 = m1 + p1;
      const expV2 = n1 + q1;
      answer = `${coef}${v1}^${expV1}${v2}^${expV2}`;
      break;
    }
    default:
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
        <h1>Product of Powers Flashcards</h1>
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
      <h1>Product of Powers Flashcards</h1>
      <h2>Question {currentIndex + 1} / {flashcards.length}</h2>
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