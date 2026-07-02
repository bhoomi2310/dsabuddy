import { useState, useEffect } from 'react';
import { Badge, Spinner } from '../../../components/common';
import { leetcodeService } from '@/api/services';
import DOMPurify from 'dompurify';

export function QuestionView({ titleSlug = 'two-sum' }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await leetcodeService.getQuestion(titleSlug);
        setQuestion(data);
      } catch (e) {
        console.error(e);
        setError('Network error occurred while fetching the question.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [titleSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded">Retry</button>
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
              <h1 className="text-2xl font-bold text-white mb-2">{question.title}</h1>
              <div className="flex items-center gap-3">
                <Badge className={difficultyColors[question.difficulty] || difficultyColors.Medium}>
                  {question.difficulty}
                </Badge>
                {question.stats && (
                  <span className="text-sm text-gray-400">
                    Acceptance: {question.stats.acRate}
                  </span>
                )}
                {question.isPaidOnly && (
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6 overflow-hidden">
          <div 
            className="prose prose-invert max-w-none text-gray-300 [&>p]:mb-4 [&>pre]:bg-[#0D1117] [&>pre]:p-4 [&>pre]:rounded-lg [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.content) }} 
          />
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {question.topicTags?.map((tag, index) => (
              <Badge 
                key={index}
                className="bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
          {question.stats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Submissions</span>
                <span className="text-white font-medium">{question.stats.totalSubmission}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Accepted</span>
                <span className="text-green-400 font-medium">{question.stats.totalAccepted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Acceptance Rate</span>
                <span className="text-white font-medium">{question.stats.acRate}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No stats available</div>
          )}
        </div>

        <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Related Problems</h3>
          <div className="space-y-3">
            {question.similarQuestions && question.similarQuestions.length > 0 ? (
              question.similarQuestions.map((problem, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#0D1117] border border-gray-700 rounded hover:border-gray-600 transition-colors cursor-pointer"
                >
                  <span className="text-gray-300 text-sm">{problem.title}</span>
                  <Badge className={difficultyColors[problem.difficulty]}>
                    {problem.difficulty}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm">No related problems found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

