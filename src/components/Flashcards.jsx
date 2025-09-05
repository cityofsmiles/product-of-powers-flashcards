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
  if (exponent === 0) return "1";
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
      n = 0;
      break;
    default: break;
  }

  const expr = `(${term(a,v,m)})(${term(b,v,n)})`;
  const answer = multiplyTerms(a,m,b,n,v);
  return { expr, answer };
}

// Generate two-variable term (at least one variable)
function generateTwoVariableTerm() {
  const v1 = randChoice(VARIABLES);
  const v2 = randChoice(VARIABLES.filter(x => x !== v1));
  let coef;
  do { coef = randInt(-6,6); } while(coef===0);
  let exp1, exp2;
  do {
    exp1 = randInt(0,4);
    exp2 = randInt(0,4);
  } while(exp1===0 && exp2===0);
  return { coef, v1, exp1, v2, exp2 };
}

// Generate flashcard
function generateFlashcard() {
  const caseNum = randInt(1,4);
  let expr="", answer="";

  if(caseNum <= 3){
    return generateSingleVariableFlashcard(caseNum);
  } else { // Case 4: two variables
    const t1 = generateTwoVariableTerm();
    const t2 = generateTwoVariableTerm();
    const coef = t1.coef * t2.coef;
    const expV1 = t1.exp1 + t2.exp1;
    const expV2 = t1.exp2 + t2.exp2;
    expr = `(${term(t1.coef, t1.v1, t1.exp1)}${term(1, t1.v2, t1.exp2)})` +
           `(${term(t2.coef, t2.v1, t2.exp1)}${term(1, t2.v2, t2.exp2)})`;
    answer = `${coef}${t1.v1}^${expV1}${t1.v2}^${expV2}`;
  }

  return { expr, answer };
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