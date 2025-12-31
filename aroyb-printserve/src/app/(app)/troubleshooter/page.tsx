'use client';

import { useState } from 'react';
import { getQuestionsForSymptom, diagnose, symptomInfo, type Symptom, type Question } from '@/lib/ai/troubleshooter';
import { addIssueLog } from '@/lib/storage';
import { generateId } from '@/lib/formatting';
import type { DiagnosisResult } from '@/types';

export default function TroubleshooterPage() {
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  
  const handleSelectSymptom = (symptom: Symptom) => {
    setSelectedSymptom(symptom);
    setQuestions(getQuestionsForSymptom(symptom));
    setAnswers({});
    setResult(null);
  };
  
  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };
  
  const handleDiagnose = () => {
    if (!selectedSymptom) return;
    
    const diagnosis = diagnose(selectedSymptom, answers);
    setResult(diagnosis);
    
    // Log the issue
    addIssueLog({
      id: generateId('issue-'),
      symptom: selectedSymptom,
      answers,
      result: diagnosis,
      createdAt: new Date().toISOString(),
    });
  };
  
  const handleReset = () => {
    setSelectedSymptom(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
  };
  
  const allQuestionsAnswered = questions.every(q => answers[q.id]);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Printer Troubleshooter</h1>
      <p className="text-neutral-400 mb-6">🤖 AI-powered diagnosis for common printer issues</p>
      
      {!selectedSymptom ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">What issue are you experiencing?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(symptomInfo) as Symptom[]).map(symptom => (
              <button
                key={symptom}
                onClick={() => handleSelectSymptom(symptom)}
                className="card card-hover text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{symptomInfo[symptom].icon}</span>
                  <span className="font-bold">{symptomInfo[symptom].label}</span>
                </div>
                <p className="text-sm text-neutral-400">{symptomInfo[symptom].description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl">
          {/* Symptom Header */}
          <div className="card mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{symptomInfo[selectedSymptom].icon}</span>
              <div>
                <h2 className="text-xl font-bold">{symptomInfo[selectedSymptom].label}</h2>
                <p className="text-neutral-400">{symptomInfo[selectedSymptom].description}</p>
              </div>
            </div>
          </div>
          
          {/* Questions */}
          {!result && (
            <div className="card mb-6">
              <h3 className="font-semibold mb-4">Answer a few questions:</h3>
              <div className="space-y-6">
                {questions.map((question, idx) => (
                  <div key={question.id}>
                    <p className="font-medium mb-2">{idx + 1}. {question.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {question.options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswer(question.id, opt.value)}
                          className={`px-4 py-2 rounded-lg text-sm ${
                            answers[question.id] === opt.value
                              ? 'bg-[#ed7424] text-white'
                              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleDiagnose}
                disabled={!allQuestionsAnswered}
                className="btn btn-primary w-full mt-6"
              >
                🔍 Diagnose Issue
              </button>
            </div>
          )}
          
          {/* Result */}
          {result && (
            <div className="space-y-4">
              {/* Confidence */}
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Confidence</span>
                  <span className={`text-lg font-bold ${result.confidence >= 0.7 ? 'text-green-400' : result.confidence >= 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${result.confidence >= 0.7 ? 'bg-green-500' : result.confidence >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Likely Causes */}
              <div className="card">
                <h3 className="font-semibold mb-3">Likely Causes</h3>
                <div className="space-y-2">
                  {result.causes.map((cause, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800">
                      <span>{cause.cause}</span>
                      <span className={`badge ${cause.likelihood >= 70 ? 'bg-red-500/20 text-red-400' : cause.likelihood >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-600 text-neutral-300'}`}>
                        {cause.likelihood}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Steps */}
              <div className="card">
                <h3 className="font-semibold mb-3">Recommended Steps</h3>
                <ol className="space-y-2">
                  {result.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-[#ed7424] font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              {/* Escalation */}
              {result.escalation && (
                <div className="card bg-amber-500/10 border border-amber-500/30">
                  <h3 className="font-semibold mb-2 text-amber-400">⚠️ When to Escalate</h3>
                  <p className="text-sm">{result.escalation}</p>
                </div>
              )}
              
              {/* Reasoning (collapsible) */}
              <div className="card">
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="flex items-center justify-between w-full"
                >
                  <span className="font-semibold">🤖 AI Reasoning</span>
                  <span>{showReasoning ? '▲' : '▼'}</span>
                </button>
                {showReasoning && (
                  <p className="mt-3 text-sm text-neutral-400">{result.reasoning}</p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleReset} className="btn btn-ghost flex-1">
                  ← Try Another Issue
                </button>
                <button onClick={() => window.print()} className="btn btn-primary flex-1">
                  🖨️ Print Steps
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
