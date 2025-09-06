import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./flashcards.css";

// --- Utilities ---
const VARIABLES = ["x","y","z","a","b","c"];
const randInt = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
const randChoice = arr => arr[Math.floor(Math.random()*arr.length)];

// Ensure coefficient != 0
function generateCoef(){
  let coef;
  do { coef = randInt(-6,6); } while(coef===0);
  return coef;
}

// Format single term for expressions
function formatTerm(coef, variable, exp){
  if(exp === 0) return coef.toString(); 
  let coefStr = "";
  if(coef === -1) coefStr = "-";
  else if(coef !== 1) coefStr = coef.toString();
  return exp === 1 ? `${coefStr}${variable}` : `${coefStr}${variable}^${exp}`;
}

// Format final answer, handle negative exponents as fractions
function formatFinalTerm(coef, variable, exp){
  if(exp === 0) return coef.toString();
  if(exp > 0){
    return exp === 1 ? `${coef}${variable}` : `${coef}${variable}^${exp}`;
  } else {
    const posExp = -exp;
    if(coef===1) return `1/${variable}${posExp===1?"":`^${posExp}`}`;
    if(coef===-1) return `-1/${variable}${posExp===1?"":`^${posExp}`}`;
    return `${coef}/${variable}${posExp===1?"":`^${posExp}`}`;
  }
}

// Multiply two terms
function multiplyTerms(coef1, exp1, coef2, exp2){
  return {coef: coef1*coef2, exp: exp1+exp2};
}

// --- Generate exponent ---
function getExponent(caseNum){
  switch(caseNum){
    case 1: return randInt(1,4);      // positive
    case 2: return -randInt(1,4);     // negative
    case 3: return randInt(0,4);      // zero allowed
    default: return 1;
  }
}

// --- Generate a term with guaranteed variable ---
function generateValidTerm(minExp=0,maxExp=4){
  const v = randChoice(VARIABLES);
  const coef = generateCoef();
  let exp = randInt(minExp,maxExp);
  if(exp === 0) exp = 1; // force variable to appear
  return {coef, variable: v, exp};
}

// --- Single Variable Flashcard (fixed: same variable for both terms) ---
function generateSingleVariable(caseNum){
  const v = randChoice(VARIABLES); // single variable for whole card
  const coef1 = generateCoef();
  const coef2 = generateCoef();
  let exp1 = getExponent(caseNum);
  let exp2 = getExponent(caseNum);

  if(exp1===0) exp1=1;
  if(exp2===0) exp2=1;

  const expr = `(${formatTerm(coef1,v,exp1)})(${formatTerm(coef2,v,exp2)})`;
  const {coef: finalCoef, exp: finalExp} = multiplyTerms(coef1,exp1,coef2,exp2);
  const answer = formatFinalTerm(finalCoef,v,finalExp);

  return {expr, answer};
}

// --- Two Variable Flashcard ---
function generateTwoVariable(){
  const v1 = randChoice(VARIABLES);
  const v2 = randChoice(VARIABLES.filter(v=>v!==v1));

  const {coef: coef1, exp: exp1_v1} = generateValidTerm();
  const {coef: coef2, exp: exp2_v1} = generateValidTerm();

  let exp1_v2 = randInt(0,4);
  let exp2_v2 = randInt(0,4);

  if(exp1_v1===0 && exp1_v2===0) exp1_v1=1;
  if(exp2_v1===0 && exp2_v2===0) exp2_v1=1;

  const term1 = `${formatTerm(coef1,v1,exp1_v1)}${formatTerm(1,v2,exp1_v2)}`;
  const term2 = `${formatTerm(coef2,v1,exp2_v1)}${formatTerm(1,v2,exp2_v2)}`;
  const expr = `(${term1})(${term2})`;

  const finalCoef = coef1*coef2;
  const finalExp_v1 = exp1_v1+exp2_v1;
  const finalExp_v2 = exp1_v2+exp2_v2;

  const part1 = formatFinalTerm(finalCoef,v1,finalExp_v1);
  const part2 = finalExp_v2===0 ? "" : formatFinalTerm(1,v2,finalExp_v2).replace(/^1/,"");
  const answer = part1+part2;

  return {expr, answer};
}

// --- Generate Flashcard ---
function generateFlashcard(){
  const caseNum = randInt(1,4);
  return caseNum<=3 ? generateSingleVariable(caseNum) : generateTwoVariable();
}

// --- Main Component ---
export default function Flashcards(){
  const [flashcards,setFlashcards]=useState([]);
  const [currentIndex,setCurrentIndex]=useState(0);
  const [answers,setAnswers]=useState({});
  const [showResults,setShowResults]=useState(false);

  const startPractice=()=>{
    const newSet = Array.from({length:10},()=>generateFlashcard());
    setFlashcards(newSet);
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer=(value)=>setAnswers({...answers,[currentIndex]:value});
  const checkAnswer=(userInput,correct)=>userInput.replace(/\s+/g,"")===correct.replace(/\s+/g,"");

  const nextCard=()=>setCurrentIndex(prev=>(prev===flashcards.length-1?0:prev+1));
  const prevCard=()=>setCurrentIndex(prev=>(prev===0?flashcards.length-1:prev-1));

  if(!flashcards.length){
    return(
      <div className="flashcards-container">
        <h1>Product of Powers Flashcards</h1>
        <h3 style={{ fontWeight:"normal", marginBottom:"1rem" }}>by Jonathan R. Bacolod, LPT</h3>
        <button className="btn-primary" onClick={startPractice}>Start Practice</button>
      </div>
    );
  }

  if(showResults){
    const score = flashcards.filter((card,i)=>checkAnswer(answers[i]||"",card.answer)).length;
    return(
      <div className="answer-key-screen">
        <p className="score">Score: {score}/{flashcards.length}</p>
        <h2>Answer Key</h2>
        <div className="answer-key">
          {flashcards.map((card,i)=>{
            const correct = checkAnswer(answers[i]||"",card.answer);
            return(
              <div key={i}>
                <p>
                  <strong>Q{i+1}:</strong> {card.expr}<br/>
                  Your Answer: {answers[i]||"(none)"} {correct?"✓":"✗"}<br/>
                  Correct Answer: {card.answer || "1"}
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

  return(
    <div className="flashcards-container">
      <h1>Product of Powers Flashcards</h1>
      <h3 style={{ fontWeight:"normal", marginBottom:"1rem" }}>by Jonathan R. Bacolod, LPT</h3>
      <h2>Question {currentIndex+1} / {flashcards.length}</h2>
      <div className="flashcard-container">
        <AnimatePresence exitBeforeEnter>
          <motion.div
            key={currentIndex}
            className="flashcard"
            initial={{ opacity:0, x:50 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-50 }}
            transition={{ duration:0.3 }}
          >
            {currentCard.expr}
          </motion.div>
        </AnimatePresence>
      </div>
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