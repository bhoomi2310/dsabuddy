import { useState, useEffect } from 'react';
import { Badge, Spinner } from '../../../components/common';
import { mockQuestion } from './mockData';

export function QuestionView() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setQuestion(mockQuestion);
      setLoading(false);
    }, 300);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Question not found
      </div>
    );
  }

  const difficultyColors = {
    Easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  return (
    <div className="flex gap-6">
      <div className="flex-[2] space-y-6">
        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{question.name}</h1>
              <div className="flex items-center gap-3">
                <Badge className={difficultyColors[question.difficulty]}>
                  {question.difficulty}
                </Badge>
                <span className="text-sm text-gray-400">
                  Acceptance: {question.acceptance}%
                </span>
                <span className="text-sm text-gray-400">
                  Frequency: {question.frequency}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Problem Statement</h2>
          <p className="text-gray-300 leading-relaxed">{question.statement}</p>
        </div>

        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Examples</h2>
          <div className="space-y-6">
            {question.examples.map((example, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm font-medium text-gray-400">Example {index + 1}:</p>
                <div className="bg-[#0D1117] border border-gray-700 rounded p-4 font-mono text-sm">
                  <div className="text-gray-300">
                    <span className="text-blue-400">Input:</span> {example.input}
                  </div>
                  <div className="text-gray-300 mt-2">
                    <span className="text-green-400">Output:</span> {example.output}
                  </div>
                  {example.explanation && (
                    <div className="text-gray-400 mt-2">
                      <span className="text-yellow-400">Explanation:</span> {example.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Constraints</h2>
          <ul className="space-y-2">
            {question.constraints.map((constraint, index) => (
              <li key={index} className="text-gray-300 flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Companies</h3>
          <div className="flex flex-wrap gap-2">
            {question.companies.map((company, index) => (
              <Badge 
                key={index}
                className="bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                {company}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Submissions</span>
              <span className="text-white font-medium">{question.stats.submissions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Accepted</span>
              <span className="text-green-400 font-medium">{question.stats.accepted.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Acceptance Rate</span>
              <span className="text-white font-medium">{question.acceptance}%</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Related Problems</h3>
          <div className="space-y-3">
            {question.relatedProblems.map((problem, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-[#0D1117] border border-gray-700 rounded hover:border-gray-600 transition-colors cursor-pointer"
              >
                <span className="text-gray-300 text-sm">{problem.name}</span>
                <Badge className={difficultyColors[problem.difficulty]}>
                  {problem.difficulty}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

