import React, { useState } from "react";
import "./flashcards.css";

const VARIABLES = ["x", "y", "z", "a", "b", "c"];

// Utility functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Format a term
function term(coef, variable, exponent) {
  if (exponent === 0) return `${coef<0?coef:""}${variable}^0`; // keep zero exponent visible
  let coefStr = "";
  if (coef === -1) coefStr = "-";
  else if (coef !== 1) coefStr = coef.toString();
  if (exponent === 1) return `${coefStr}${variable}`;
  return `${coefStr}${variable}^${exponent}`;
}

// Multiply single-variable terms
function multiplyTerms(coef1, exp1, coef2, exp2, variable) {
  return term(coef1 * coef2, variable, exp1 + exp2);
}

// Generate single-variable flashcard (Cases 1–3)
function generateSingleVariableFlashcard(caseNum) {
  const v = randChoice(VARIABLES); // shared variable
  let a, b;
  do { a = randInt(-6,6); } while(a===0);
  do { b = randInt(-6,6); } while(b===0);

  let m, n;
  switch(caseNum) {
    case 1: // positive exponents
      m = randInt(1,4);
      n = randInt(1,4);
      break;
    case 2: // negative exponents
      m = randInt(1,4);
      n = -randInt(1,4);
      break;
    case 3: // zero exponent
      m = randInt(1,4);
      // Ensure second term has variable
      n = randInt(-4, 0);
      if(n === 0) n = -1;
      break;
    default: break;
  }

  const expr = `(${term(a,v,m)})(${term(b,v,n)})`;
  const answer = multiplyTerms(a,m,b,n,v);
  return { expr, answer };
}

// Generate two-variable flashcard (Case 4)
function generateTwoVariableFlashcard() {
  const v1 = randChoice(VARIABLES);
  const v2 = randChoice(VARIABLES.filter(x => x !== v1));

  let coef1, coef2;
  do { coef1 = randInt(-6,6); } while(coef1===0);
  do { coef2 = randInt(-6,6); } while(coef2===0);

  let exp1_term1, exp1_term2, exp2_term1, exp2_term2;
  do {
    exp1_term1 = randInt(0,4);
    exp1_term2 = randInt(0,4);
    exp2_term1 = randInt(0,4);
    exp2_term2 = randInt(0,4);
  } while(exp1_term1 + exp1_term2 === 0 && exp2_term1 + exp2_term2 === 0);

  const expr = `(${term(coef1,v1,exp1_term1)}${term(1,v2,exp2_term1)})(${term(coef2,v1,exp1_term2)}${term(1,v2,exp2_term2)})`;
  const answer = `${coef1*coef2}${v1}^${exp1_term1+exp1_term2}${v2}^${exp2_term1+exp2_term2}`;

  return { expr, answer };
}

// Generate flashcard
function generateFlashcard() {
  const caseNum = randInt(1,4);
  if(caseNum <= 3){
    return generateSingleVariableFlashcard(caseNum);
  } else {
    return generateTwoVariableFlashcard();
  }
}

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const startPractice = () => {
    const newSet = Array.from({length:10},()=>generateFlashcard());
    setFlashcards(newSet);
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (value) => setAnswers({...answers, [currentIndex]: value});
  const checkAnswer = (userInput, correct) => userInput.replace(/\s+/g,"") === correct.replace(/\s+/g,"");
  const prevCard = () => setCurrentIndex(prev => prev===0 ? flashcards.length-1 : prev-1);
  const nextCard = () => setCurrentIndex(prev => prev===flashcards.length-1 ? 0 : prev+1);

  if(!flashcards.length){
    return (
      <div className="flashcards-container">
        <h1>Product of Powers Flashcards</h1>
        <h3 style={{ fontWeight:"normal", marginBottom:"1rem" }}>
          by Jonathan R. Bacolod, LPT
        </h3>
        <button className="btn-primary" onClick={startPractice}>Start Practice</button>
      </div>
    );
  }

  if(showResults){
    const score = flashcards.filter((card,i)=>checkAnswer(answers[i]||"", card.answer)).length;
    return (
      <div className="answer-key-screen">
        <p className="score">Score: {score}/{flashcards.length}</p>
        <h2>Answer Key</h2>
        <div className="answer-key">
          {flashcards.map((card,i)=>{
            const correct = checkAnswer(answers[i]||"", card.answer);
            return (
              <div key={i}>
                <p>
                  <strong>Q{i+1}:</strong> {card.expr}<br/>
                  Your Answer: {answers[i]||"(none)"} {correct?"✓":"✗"}<br/>
                  Correct Answer: {card.answer}
                </p>
              </div>
            );
          })}
        </div>
        <div className="button-group">
          <button className="btn-primary" onClick={startPractice}>Try Another Set</button>
          <button className="btn-submit" onClick={()=>setShowResults(false)}>Back to Cards</button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  return (
    <div className="flashcards-container">
      <h1>Product of Powers Flashcards</h1>
      <h3 style={{ fontWeight:"normal", marginBottom:"1rem" }}>
        by Jonathan R. Bacolod, LPT
      </h3>
      <h2>Question {currentIndex+1} / {flashcards.length}</h2>
      <div className="flashcard">{currentCard.expr}</div>
      <input
        type="text"
        className="input-answer"
        placeholder="Your answer"
        value={answers[currentIndex]||""}
        onChange={(e)=>handleAnswer(e.target.value)}
      />
      <div className="button-group">
        <button className="btn-primary" onClick={prevCard}>Previous</button>
        <button className="btn-primary" onClick={nextCard}>Next</button>
        <button className="btn-submit" onClick={()=>setShowResults(true)}>Submit</button>
      </div>
    </div>
  );
}