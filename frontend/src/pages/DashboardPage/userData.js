/**
 * THIS IS AI GENERATED FILE 
 * User Data for Dashboard
 * 
 * Backend Integration Notes:
 * - Replace these with actual API calls
 * - User data: GET /api/user/profile
 * - Streak data: GET /api/user/streak
 * - Platform data: GET /api/platforms (returns array of connected platforms)
 * - Leaderboard: GET /api/leaderboard?filter=college|branch|year
 * - Activity: GET /api/user/activity?range=weekly|yearly
 */

export const userData = {
  id: 'user_001',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  branch: 'Computer Science',
  year: '2024',
  rank: 42,
  points: 1850,
  role: 'CS - 2024',
};

export const streakData = {
  current: 12,
  best: 15,
  remainingDays: 3,
  lastActive: new Date().toISOString(),
};

export const platformsData = [
  {
    id: 'leetcode',
    name: 'LeetCode',
    username: 'alexcode23',
    rating: 1642,
    problemsSolved: 342,
    rank: 'Knight',
    synced: true,
    logo: null, // Can add actual logo URLs
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    username: 'chef_alex',
    rating: 1450,
    stars: 2,
    problemsSolved: 156,
    synced: true,
    logo: null,
  },
  {
    id: 'codeforces',
    name: 'Codeforces',
    username: 'alexcoder',
    rating: 1100,
    problemsSolved: 89,
    rank: 'Newbie',
    synced: false,
    logo: null,
  },
  {
    id: 'gfg',
    name: 'GFG',
    username: 'alex_gfg',
    rating: 450,
    problemsSolved: 120,
    rank: null,
    synced: true,
    logo: null,
  },
];

export const leaderboardData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    branch: 'Computer Science',
    year: '2024',
    points: 2450,
    rank: 1,
  },
  {
    id: 2,
    name: 'Michael Zhang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    branch: 'Computer Science',
    year: '2024',
    points: 2180,
    rank: 2,
  },
  {
    id: 3,
    name: 'Priya Sharma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    branch: 'Computer Science',
    year: '2024',
    points: 1920,
    rank: 3,
  },
  {
    id: 40,
    name: 'Marcus Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    branch: 'Computer Science',
    year: '2024',
    points: 1905,
    rank: 40,
  },
  {
    id: 41,
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    branch: 'Information Technology',
    year: '2024',
    points: 1880,
    rank: 41,
  },
  {
    id: 42,
    name: 'Alex Chen', // Current user
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    branch: 'Computer Science',
    year: '2024',
    points: 1850,
    rank: 42,
  },
  {
    id: 43,
    name: 'Emily Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    branch: 'Computer Science',
    year: '2025',
    points: 1820,
    rank: 43,
  },
  {
    id: 44,
    name: 'Ryan Lee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan',
    branch: 'Electronics',
    year: '2024',
    points: 1790,
    rank: 44,
  },
];

export const yearlyActivityData = (() => {
  const data = [];
  const today = new Date();
  const pattern = [0, 1, 2, 1, 3, 2, 4, 3, 2, 1, 0, 1, 2, 3];
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: pattern[i % pattern.length],
    });
  }
  return data;
})();

export const leaderboardFilters = [
  { id: 'college', label: 'College' },
  { id: 'branch', label: 'Branch' },
  { id: 'year', label: 'Year' },
];

export const profileSettings = {
  name: userData.name,
  email: userData.email,
  avatar: userData.avatar,
  branch: userData.branch,
  year: userData.year,
};

export const settingSections = [
  {
    id: 'profile',
    icon: 'user',
    title: 'Profile Settings',
    description: 'Update your personal information including name, email, avatar, branch and year',
  },
  {
    id: 'platforms',
    icon: 'link',
    title: 'Connected Platforms',
    description: 'Manage your coding platform connections for LeetCode, CodeChef, Codeforces, and GeeksForGeeks',
  },
];

export const analyticsStats = [
  { label: 'Avg. Daily Problems', value: '4.2', color: '#10B981' },
  { label: 'Active Days', value: '287', color: '#FBBF24' },
  { label: 'Total Solved', value: '1,234', color: '#3B82F6' },
  { label: 'Best Streak', value: '45', color: '#F59E0B' },
];

export const companies = [
  { id: 'adobe', name: 'Adobe', questionCount: 48 },
  { id: 'amazon', name: 'Amazon', questionCount: 90 },
  { id: 'google', name: 'Google', questionCount: 158 },
  { id: 'microsoft', name: 'Microsoft', questionCount: 80 },
  { id: 'meta', name: 'Meta', questionCount: 88 },
  { id: 'apple', name: 'Apple', questionCount: 65 },
];

export const interviewSets = {
  adobe: {
    name: 'Adobe Interview Set',
    tag: 'TOP 50',
    lastUpdated: '2 days ago',
    easy: { count: 18, total: 45 },
    medium: { count: 19, total: 45 },
    hard: { count: 8, total: 45 },
  },
  amazon: {
    name: 'Amazon Interview Set',
    tag: 'TOP 100',
    lastUpdated: '1 week ago',
    easy: { count: 25, total: 90 },
    medium: { count: 45, total: 90 },
    hard: { count: 20, total: 90 },
  },
  google: {
    name: 'Google Interview Set',
    tag: 'TOP 150',
    lastUpdated: '3 days ago',
    easy: { count: 35, total: 158 },
    medium: { count: 78, total: 158 },
    hard: { count: 45, total: 158 },
  },
};

export const companyQuestions = {
  adobe: [
    {
      id: 1,
      title: 'Trapping Rain Water',
      tags: ['Array', 'Two Pointers', 'Dynamic Programming'],
      difficulty: 'HARD',
      frequency: 'Very High',
      solved: false,
      leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    },
    {
      id: 2,
      title: 'Add Two Numbers',
      tags: ['Linked List', 'Math', 'Recursion'],
      difficulty: 'MEDIUM',
      frequency: 'High',
      solved: false,
      leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/',
    },
    {
      id: 3,
      title: 'Merge Intervals',
      tags: ['Array', 'Sorting'],
      difficulty: 'MEDIUM',
      frequency: 'High',
      solved: false,
      leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/',
    },
    {
      id: 4,
      title: 'Two Sum',
      tags: ['Array', 'Hash Table'],
      difficulty: 'EASY',
      frequency: 'Occasional',
      solved: true,
      leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    },
    {
      id: 5,
      title: 'Median of Two Sorted Arrays',
      tags: ['Array', 'Binary Search', 'Divide and Conquer'],
      difficulty: 'HARD',
      frequency: 'Occasional',
      solved: false,
      leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    },
  ],
};
