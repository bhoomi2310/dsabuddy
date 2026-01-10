import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { companies, interviewSets, companyQuestions } from './userData';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export function PYQs() {
  const [selectedCompany, setSelectedCompany] = useState('adobe');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const currentSet = interviewSets[selectedCompany];
  const questions = companyQuestions[selectedCompany] || [];

  // Apply filters
  const filteredQuestions = questions.filter((question) => {
    const matchesDifficulty = difficultyFilter === 'all' || 
      question.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    
    const matchesFrequency = frequencyFilter === 'all' || 
      question.frequency.toLowerCase().replace(' ', '-') === frequencyFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'solved' ? question.solved : !question.solved);
    
    return matchesDifficulty && matchesFrequency && matchesStatus;
  });

  const difficultyColors = {
    EASY: 'text-[#10B981]',
    MEDIUM: 'text-[#FBBF24]',
    HARD: 'text-[#EF4444]',
  };

  const frequencyColors = {
    'Very High': 'text-[#FBBF24]',
    'High': 'text-[#FBBF24]',
    'Occasional': 'text-[#6B7280]',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[#E5E7EB] text-4xl font-bold font-Spline-Sans">Company Archives</h1>
      </div>

      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company.id)}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedCompany === company.id
                  ? 'bg-[#FBBF24]/10 border-[#FBBF24]'
                  : 'bg-[#161B22] border-[#1F2937] hover:border-[#FBBF24]/20'
              }`}
            >
              <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-[#0D1117] font-bold text-xl font-Spline-Sans">
                  {company.name[0]}
                </span>
              </div>
              <h3 className="text-[#E5E7EB] font-bold text-sm font-Spline-Sans mb-1">{company.name}</h3>
              <p className="text-[#6B7280] text-xs font-JetBrains-Mono">{company.questionCount} Questions</p>
            </button>
          ))}
        </div>
      </div>

      {currentSet && (
        <div className="bg-[#161B22] rounded-xl p-8 border border-[#1F2937]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg flex items-center justify-center">
                <span className="text-[#0D1117] font-bold text-xl font-Spline-Sans">
                  {companies.find(c => c.id === selectedCompany)?.name[0]}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[#E5E7EB] font-bold text-lg font-Spline-Sans">{currentSet.name}</h3>
                  <Badge variant="primary" className="!bg-[#FBBF24] !text-[#0D1117]">
                    {currentSet.tag}
                  </Badge>
                </div>
                <p className="text-[#6B7280] text-sm font-JetBrains-Mono">{currentSet.lastUpdated}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-2 font-JetBrains-Mono">EASY</p>
              <p className="text-[#10B981] text-2xl font-bold font-Spline-Sans">
                {currentSet.easy.count} <span className="text-[#6B7280] text-lg">/ {currentSet.easy.total}</span>
              </p>
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-2 font-JetBrains-Mono">MEDIUM</p>
              <p className="text-[#FBBF24] text-2xl font-bold font-Spline-Sans">
                {currentSet.medium.count} <span className="text-[#6B7280] text-lg">/ {currentSet.medium.total}</span>
              </p>
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-2 font-JetBrains-Mono">HARD</p>
              <p className="text-[#EF4444] text-2xl font-bold font-Spline-Sans">
                {currentSet.hard.count} <span className="text-[#6B7280] text-lg">/ {currentSet.hard.total}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#161B22] rounded-xl p-8 border border-[#1F2937]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setDifficultyFilter('all')}
              variant={difficultyFilter === 'all' ? 'accent' : 'outline'}
              size="sm"
              className={difficultyFilter === 'all' ? '!bg-[#FBBF24]' : '!bg-[#0D1117] !text-[#9CA3AF] hover:!text-[#E5E7EB] !border-transparent'}
            >
              All
            </Button>
            <Button
              onClick={() => setDifficultyFilter('easy')}
              variant={difficultyFilter === 'easy' ? 'accent' : 'outline'}
              size="sm"
              className={difficultyFilter === 'easy' ? '!bg-[#FBBF24]' : '!bg-[#0D1117] !text-[#9CA3AF] hover:!text-[#E5E7EB] !border-transparent'}
            >
              Easy
            </Button>
            <Button
              onClick={() => setDifficultyFilter('medium')}
              variant={difficultyFilter === 'medium' ? 'accent' : 'outline'}
              size="sm"
              className={difficultyFilter === 'medium' ? '!bg-[#FBBF24]' : '!bg-[#0D1117] !text-[#9CA3AF] hover:!text-[#E5E7EB] !border-transparent'}
            >
              Medium
            </Button>
            <Button
              onClick={() => setDifficultyFilter('hard')}
              variant={difficultyFilter === 'hard' ? 'accent' : 'outline'}
              size="sm"
              className={difficultyFilter === 'hard' ? '!bg-[#FBBF24]' : '!bg-[#0D1117] !text-[#9CA3AF] hover:!text-[#E5E7EB] !border-transparent'}
            >
              Hard
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#1F2937] rounded-lg px-3 py-2 text-[#E5E7EB] text-sm font-JetBrains-Mono focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="all">All Frequency</option>
              <option value="very-high">Very High</option>
              <option value="high">High</option>
              <option value="occasional">Occasional</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#1F2937] rounded-lg px-3 py-2 text-[#E5E7EB] text-sm font-JetBrains-Mono focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>

            <button className="text-[#9CA3AF] hover:text-[#FBBF24] text-sm font-JetBrains-Mono transition-colors px-3 py-2">
              Frequency (High to Low)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-[#0D1117] rounded-lg p-6 border border-[#1F2937] hover:border-[#FBBF24]/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-[#E5E7EB] font-bold font-Spline-Sans">{question.title}</h4>
                    <ExternalLink className="w-4 h-4 text-[#6B7280] hover:text-[#FBBF24] cursor-pointer transition-colors" />
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="!bg-[#1F2937] !text-[#9CA3AF]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className={`text-sm font-bold font-JetBrains-Mono ${difficultyColors[question.difficulty]}`}>
                      {question.difficulty}
                    </p>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <div className="flex items-center gap-1">
                      <span className="text-[#FBBF24]">⚡</span>
                      <p className={`text-sm font-JetBrains-Mono ${frequencyColors[question.frequency]}`}>
                        {question.frequency}
                      </p>
                    </div>
                  </div>

                  {question.solved && (
                    <Badge variant="success" className="!bg-[#10B981]/10 !text-[#10B981]">
                      Solved
                    </Badge>
                  )}

                  <a 
                    href={question.leetcodeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="accent" size="sm" className="!bg-[#FBBF24] hover:!bg-[#D97706]">
                      Solve
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" size="sm" className="!text-[#FBBF24] hover:!text-[#D97706] !border-transparent hover:!border-transparent">
            Load More →
          </Button>
        </div>
      </div>
    </div>
  );
}   
