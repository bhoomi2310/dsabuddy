// Mock question data for the Question Page
export const mockQuestion = {
  id: '1',
  name: '1. Two Sum',
  difficulty: 'Easy',
  acceptance: '48.4%',
  frequency: 'Very High',
  statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
    },
    {
      input: 'nums = [3,3], target = 6',
      output: '[0,1]',
    },
  ],
  constraints: [
    '2 ≤ nums.length ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹',
    'Only one valid answer exists.',
  ],
  companies: ['Amazon', 'Google', 'Apple', 'Microsoft', 'Uber', 'Facebook', 'Adobe', 'Bloomberg', 'Oracle', 'Netflix', 'Spotify', 'Airbnb'],
  stats: {
    accepted: '11.2M',
    submissions: '23.4M',
    acceptanceRate: '48.4%',
  },
  relatedProblems: [
    { id: '15', name: '3Sum', difficulty: 'Medium' },
    { id: '18', name: '4Sum', difficulty: 'Medium' },
    { id: '167', name: 'Two Sum II', difficulty: 'Medium' },
  ],
};
