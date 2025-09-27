// Test data for Magic Upwork Pro interface
const testJobs = [
  {
    id: 'job-1',
    title: 'Full Stack Ruby on Rails Shopify App Developer',
    url: 'https://www.upwork.com/jobs/~01234567890abcdef',
    budget: '$60/hr',
    description: 'Looking for an experienced Ruby on Rails developer to build a custom Shopify app...',
    scrapedAt: new Date().toISOString(),
    ai_analysis: {
      overall_score: 92,
      skill_match_score: 95,
      quality_score: 88,
      budget_score: 90,
      competition_score: 85,
      success_probability: 87,
      detected_skills: [
        { name: 'ruby', confidence: 0.95 },
        { name: 'rails', confidence: 0.92 },
        { name: 'shopify', confidence: 0.88 }
      ],
      tags: ['🔥 Hot Match', '💰 Great Budget'],
      ai_recommendation: 'Excellent match! This job aligns perfectly with your Rails expertise and offers competitive compensation.',
      red_flags: [],
      green_flags: ['Detailed requirements', 'Established client', 'Clear scope'],
      estimated_hourly_rate: 60,
      project_complexity: 'medium'
    }
  },
  {
    id: 'job-2',
    title: 'React Frontend Developer for E-commerce Platform',
    url: 'https://www.upwork.com/jobs/~01234567890abcdef',
    budget: '$45/hr',
    description: 'We need a skilled React developer to build the frontend for our e-commerce platform...',
    scrapedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    ai_analysis: {
      overall_score: 78,
      skill_match_score: 82,
      quality_score: 75,
      budget_score: 70,
      competition_score: 80,
      success_probability: 73,
      detected_skills: [
        { name: 'react', confidence: 0.90 },
        { name: 'javascript', confidence: 0.85 },
        { name: 'css', confidence: 0.75 }
      ],
      tags: ['⚡ Quick Start', '🎯 Good Fit'],
      ai_recommendation: 'Good opportunity with solid requirements. Consider applying if you have React experience.',
      red_flags: ['Tight deadline'],
      green_flags: ['Clear requirements', 'Good communication'],
      estimated_hourly_rate: 45,
      project_complexity: 'low'
    }
  },
  {
    id: 'job-3',
    title: 'Python Data Science & Machine Learning Expert',
    url: 'https://www.upwork.com/jobs/~01234567890abcdef',
    budget: '$80/hr',
    description: 'Seeking a Python expert for data analysis and machine learning model development...',
    scrapedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    ai_analysis: {
      overall_score: 65,
      skill_match_score: 60,
      quality_score: 70,
      budget_score: 85,
      competition_score: 45,
      success_probability: 58,
      detected_skills: [
        { name: 'python', confidence: 0.92 },
        { name: 'machine-learning', confidence: 0.88 },
        { name: 'data-science', confidence: 0.85 }
      ],
      tags: ['💰 High Budget', '⚠️ High Competition'],
      ai_recommendation: 'High-paying opportunity but very competitive. Apply only if you have strong ML background.',
      red_flags: ['Very competitive', 'Complex requirements'],
      green_flags: ['High budget', 'Long-term potential'],
      estimated_hourly_rate: 80,
      project_complexity: 'high'
    }
  }
];

// Function to load test data into storage
function loadTestData() {
  chrome.storage.local.set({ 
    'upwork_rails_jobs': testJobs 
  }, () => {
    console.log('Test data loaded successfully!');
  });
}

// Auto-load test data if no jobs exist
chrome.storage.local.get(['upwork_rails_jobs'], (result) => {
  if (!result.upwork_rails_jobs || result.upwork_rails_jobs.length === 0) {
    loadTestData();
  }
});
