import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./flashcards.css";

// --- Utility functions ---
const VARIABLES = ["x","y","z","a","b","c"];
const randInt = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
const randChoice = arr => arr[Math.floor(Math.random()*arr.length)];

function term(coef, variable, exp){
  if(exp === 0) return `${coef<0?coef:""}${variable}^0`;
  let coefStr = "";
  if(coef === -1) coefStr = "-";
  else if(coef !== 1) coefStr = coef.toString();
  return exp===1?`${coefStr}${variable}`:`${coefStr}${variable}^${exp}`;
}

function termDisplay(coef,variable,exp){
  if(exp===0) return coef.toString();
  if(exp>0){
    let coefStr="";
    if(coef===-1) coefStr="-";
    else if(coef!==1) coefStr=coef.toString();
    return exp===1?`${coefStr}${variable}`:`${coefStr}${variable}^${exp}`;
  } else {
    const absExp=Math.abs(exp);
    return `${coef}/${variable}${absExp===1?"":`^${absExp}`}`;
  }
}

function multiplyTerms(c1,e1,c2,e2){
  return {coef:c1*c2,exp:e1+e2};
}

// --- Generate flashcards ---
function generateSingleVariable(caseNum){
  const v = randChoice(VARIABLES);
  let a,b;
  do { a = randInt(-6,6); } while(a===0);
  do { b = randInt(-6,6); } while(b===0);
  let m,n;
  switch(caseNum){
    case 1: m=randInt(1,4); n=randInt(1,4); break;
    case 2: m=randInt(1,4); n=-randInt(1,4); break;
    case 3: m=randInt(0,4); n=randInt(0,4); break;
    default: break;
  }
  const expr=`(${term(a,v,m)})(${term(b,v,n)})`;
  const product = multiplyTerms(a,m,b,n);
  let answer;
  if(product.exp===0) answer = product.coef.toString();
  else answer = termDisplay(product.coef,v,product.exp);
  return {expr,answer};
}

function generateTwoVariable(){
  const v1 = randChoice(VARIABLES);
  const v2 = randChoice(VARIABLES.filter(x=>x!==v1));
  let coef1, coef2;
  do { coef1 = randInt(-6,6); } while(coef1===0);
  do { coef2 = randInt(-6,6); } while(coef2===0);
  let e1_1,e1_2,e2_1,e2_2;
  do {
    e1_1=randInt(0,4); e1_2=randInt(0,4);
    e2_1=randInt(0,4); e2_2=randInt(0,4);
  } while(e1_1+e1_2===0 && e2_1+e2_2===0);
  const expr=`(${term(coef1,v1,e1_1)}${term(1,v2,e2_1)})(${term(coef2,v1,e1_2)}${term(1,v2,e2_2)})`;
  const finalCoef = coef1*coef2;
  const finalExpV1 = e1_1+e1_2;
  const finalExpV2 = e2_1+e2_2;
  let part1 = finalExpV1===0? finalCoef.toString():termDisplay(finalCoef,v1,finalExpV1);
  let part2 = finalExpV2===0? "":termDisplay(1,v2,finalExpV2).replace(/^1/,"");
  const answer = part1+part2;
  return {expr,answer};
}

function generateFlashcard(){
  const caseNum = randInt(1,4);
  return caseNum<=3?generateSingleVariable(caseNum):generateTwoVariable();
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