// AI-Powered Job Analysis Engine
class AIJobAnalyzer {
  constructor() {
    this.skillsDatabase = this.initializeSkillsDatabase();
    this.jobPatterns = this.initializeJobPatterns();
    this.marketTrends = this.initializeMarketTrends();
  }

  // Initialize comprehensive skills database with weights
  initializeSkillsDatabase() {
    return {
      // Backend Technologies
      'ruby': { weight: 10, category: 'backend', demand: 'high', salary_impact: 8 },
      'rails': { weight: 10, category: 'backend', demand: 'high', salary_impact: 9 },
      'ruby on rails': { weight: 10, category: 'backend', demand: 'high', salary_impact: 9 },
      'python': { weight: 9, category: 'backend', demand: 'very_high', salary_impact: 8 },
      'django': { weight: 8, category: 'backend', demand: 'high', salary_impact: 7 },
      'node.js': { weight: 9, category: 'backend', demand: 'very_high', salary_impact: 8 },
      'express': { weight: 7, category: 'backend', demand: 'high', salary_impact: 6 },
      'php': { weight: 6, category: 'backend', demand: 'medium', salary_impact: 5 },
      'laravel': { weight: 7, category: 'backend', demand: 'medium', salary_impact: 6 },
      'java': { weight: 8, category: 'backend', demand: 'high', salary_impact: 7 },
      'spring': { weight: 7, category: 'backend', demand: 'medium', salary_impact: 6 },
      
      // Frontend Technologies
      'javascript': { weight: 9, category: 'frontend', demand: 'very_high', salary_impact: 7 },
      'typescript': { weight: 8, category: 'frontend', demand: 'high', salary_impact: 8 },
      'react': { weight: 9, category: 'frontend', demand: 'very_high', salary_impact: 8 },
      'vue': { weight: 7, category: 'frontend', demand: 'high', salary_impact: 7 },
      'angular': { weight: 7, category: 'frontend', demand: 'medium', salary_impact: 7 },
      'svelte': { weight: 6, category: 'frontend', demand: 'medium', salary_impact: 6 },
      'next.js': { weight: 8, category: 'frontend', demand: 'high', salary_impact: 8 },
      'nuxt': { weight: 6, category: 'frontend', demand: 'medium', salary_impact: 6 },
      
      // Databases
      'postgresql': { weight: 8, category: 'database', demand: 'high', salary_impact: 7 },
      'mysql': { weight: 7, category: 'database', demand: 'high', salary_impact: 6 },
      'mongodb': { weight: 7, category: 'database', demand: 'high', salary_impact: 6 },
      'redis': { weight: 6, category: 'database', demand: 'medium', salary_impact: 5 },
      'elasticsearch': { weight: 6, category: 'database', demand: 'medium', salary_impact: 6 },
      
      // Cloud & DevOps
      'aws': { weight: 9, category: 'devops', demand: 'very_high', salary_impact: 9 },
      'docker': { weight: 8, category: 'devops', demand: 'high', salary_impact: 7 },
      'kubernetes': { weight: 8, category: 'devops', demand: 'high', salary_impact: 8 },
      'terraform': { weight: 7, category: 'devops', demand: 'medium', salary_impact: 7 },
      'jenkins': { weight: 6, category: 'devops', demand: 'medium', salary_impact: 6 },
      'github actions': { weight: 7, category: 'devops', demand: 'high', salary_impact: 6 },
      
      // AI/ML (Hot trend)
      'machine learning': { weight: 10, category: 'ai', demand: 'very_high', salary_impact: 10 },
      'artificial intelligence': { weight: 10, category: 'ai', demand: 'very_high', salary_impact: 10 },
      'openai': { weight: 9, category: 'ai', demand: 'very_high', salary_impact: 9 },
      'chatgpt': { weight: 8, category: 'ai', demand: 'high', salary_impact: 8 },
      'langchain': { weight: 7, category: 'ai', demand: 'high', salary_impact: 8 },
      'tensorflow': { weight: 8, category: 'ai', demand: 'high', salary_impact: 8 },
      'pytorch': { weight: 8, category: 'ai', demand: 'high', salary_impact: 8 }
    };
  }

  // Initialize job quality patterns
  initializeJobPatterns() {
    return {
      red_flags: [
        'urgent', 'asap', 'cheap', 'budget friendly', 'low budget',
        'quick turnaround', 'copy paste', 'simple task', 'easy money',
        'no experience required', 'beginner level', 'data entry'
      ],
      green_flags: [
        'long term', 'ongoing', 'established company', 'funded startup',
        'enterprise', 'scalable', 'architecture', 'senior', 'lead',
        'technical lead', 'full stack', 'performance', 'optimization',
        'best practices', 'code review', 'testing', 'ci/cd'
      ],
      budget_indicators: {
        high: ['$50+', '$75+', '$100+', 'negotiable', 'competitive'],
        medium: ['$25-50', '$30-60', '$40-75'],
        low: ['$5-15', '$10-25', 'fixed price', 'one time']
      }
    };
  }

  // Initialize market trends data
  initializeMarketTrends() {
    return {
      trending_up: ['ai', 'machine learning', 'chatgpt', 'openai', 'blockchain', 'web3'],
      trending_down: ['jquery', 'php', 'wordpress', 'bootstrap'],
      stable: ['react', 'node.js', 'python', 'aws', 'docker'],
      seasonal: {
        'q4': ['e-commerce', 'holiday', 'black friday', 'cyber monday'],
        'q1': ['tax', 'accounting', 'new year', 'planning'],
        'q2': ['summer', 'vacation', 'travel'],
        'q3': ['back to school', 'education', 'learning']
      }
    };
  }

  // Main analysis function - the magic happens here!
  analyzeJob(job) {
    const analysis = {
      job_id: job.id,
      overall_score: 0,
      quality_score: 0,
      skill_match_score: 0,
      budget_score: 0,
      urgency_score: 0,
      competition_score: 0,
      ai_recommendation: '',
      detected_skills: [],
      missing_skills: [],
      red_flags: [],
      green_flags: [],
      estimated_hourly_rate: null,
      project_complexity: 'unknown',
      client_quality: 'unknown',
      success_probability: 0,
      tags: []
    };

    // Analyze skills
    this.analyzeSkills(job, analysis);
    
    // Analyze quality indicators
    this.analyzeQuality(job, analysis);
    
    // Analyze budget
    this.analyzeBudget(job, analysis);
    
    // Analyze competition
    this.analyzeCompetition(job, analysis);
    
    // Calculate overall score
    this.calculateOverallScore(analysis);
    
    // Generate AI recommendation
    this.generateRecommendation(job, analysis);
    
    return analysis;
  }

  // Analyze skills mentioned in job
  analyzeSkills(job, analysis) {
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const detectedSkills = [];
    let skillScore = 0;
    let totalPossibleScore = 0;

    // Check for each skill in our database
    Object.entries(this.skillsDatabase).forEach(([skill, data]) => {
      if (jobText.includes(skill.toLowerCase())) {
        detectedSkills.push({
          name: skill,
          weight: data.weight,
          category: data.category,
          demand: data.demand,
          salary_impact: data.salary_impact
        });
        skillScore += data.weight;
      }
      totalPossibleScore += data.weight;
    });

    analysis.detected_skills = detectedSkills;
    analysis.skill_match_score = Math.min(100, (skillScore / 20) * 100); // Normalize to 100

    // Identify trending skills
    detectedSkills.forEach(skill => {
      if (this.marketTrends.trending_up.includes(skill.name.toLowerCase())) {
        analysis.tags.push('🔥 Hot Skill');
      }
    });

    // Suggest missing complementary skills
    this.suggestMissingSkills(detectedSkills, analysis);
  }

  // Suggest complementary skills that might be valuable
  suggestMissingSkills(detectedSkills, analysis) {
    const categories = [...new Set(detectedSkills.map(s => s.category))];
    const suggestions = [];

    if (categories.includes('backend') && !categories.includes('frontend')) {
      suggestions.push('Frontend skills like React or Vue.js');
    }
    if (categories.includes('frontend') && !categories.includes('backend')) {
      suggestions.push('Backend skills like Node.js or Python');
    }
    if (!categories.includes('devops')) {
      suggestions.push('DevOps skills like Docker or AWS');
    }
    if (!categories.includes('ai') && detectedSkills.length > 3) {
      suggestions.push('AI/ML skills - highly in demand!');
    }

    analysis.missing_skills = suggestions;
  }

  // Analyze job quality indicators
  analyzeQuality(job, analysis) {
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    let qualityScore = 50; // Start neutral

    // Check for red flags
    this.jobPatterns.red_flags.forEach(flag => {
      if (jobText.includes(flag)) {
        analysis.red_flags.push(flag);
        qualityScore -= 10;
      }
    });

    // Check for green flags
    this.jobPatterns.green_flags.forEach(flag => {
      if (jobText.includes(flag)) {
        analysis.green_flags.push(flag);
        qualityScore += 15;
      }
    });

    // Analyze description length and detail
    if (job.description && job.description.length > 500) {
      qualityScore += 10;
      analysis.tags.push('📝 Detailed Description');
    }

    // Check for technical requirements
    const technicalWords = ['architecture', 'scalable', 'performance', 'security', 'testing'];
    const technicalCount = technicalWords.filter(word => jobText.includes(word)).length;
    qualityScore += technicalCount * 5;

    analysis.quality_score = Math.max(0, Math.min(100, qualityScore));

    // Determine project complexity
    if (analysis.detected_skills.length >= 5) {
      analysis.project_complexity = 'high';
    } else if (analysis.detected_skills.length >= 3) {
      analysis.project_complexity = 'medium';
    } else {
      analysis.project_complexity = 'low';
    }
  }

  // Analyze budget and estimate rates
  analyzeBudget(job, analysis) {
    const budgetText = job.budget || '';
    let budgetScore = 0;

    // Extract hourly rate if mentioned
    const hourlyMatch = budgetText.match(/\$(\d+)(?:-\$?(\d+))?\s*(?:per\s*hour|\/hr|hourly)/i);
    if (hourlyMatch) {
      const rate = parseInt(hourlyMatch[1]);
      analysis.estimated_hourly_rate = rate;
      
      if (rate >= 75) {
        budgetScore = 100;
        analysis.tags.push('💰 High Budget');
      } else if (rate >= 50) {
        budgetScore = 80;
        analysis.tags.push('💵 Good Budget');
      } else if (rate >= 25) {
        budgetScore = 60;
      } else {
        budgetScore = 30;
        analysis.tags.push('💸 Low Budget');
      }
    }

    // Check budget indicators
    Object.entries(this.jobPatterns.budget_indicators).forEach(([level, indicators]) => {
      indicators.forEach(indicator => {
        if (budgetText.toLowerCase().includes(indicator.toLowerCase())) {
          switch(level) {
            case 'high': budgetScore = Math.max(budgetScore, 90); break;
            case 'medium': budgetScore = Math.max(budgetScore, 60); break;
            case 'low': budgetScore = Math.max(budgetScore, 30); break;
          }
        }
      });
    });

    analysis.budget_score = budgetScore;
  }

  // Analyze competition level
  analyzeCompetition(job, analysis) {
    const proposalsText = job.proposals || '';
    const proposalsMatch = proposalsText.match(/(\d+)/);
    
    if (proposalsMatch) {
      const proposalCount = parseInt(proposalsMatch[1]);
      
      if (proposalCount <= 5) {
        analysis.competition_score = 90;
        analysis.tags.push('🎯 Low Competition');
      } else if (proposalCount <= 15) {
        analysis.competition_score = 70;
      } else if (proposalCount <= 30) {
        analysis.competition_score = 50;
      } else {
        analysis.competition_score = 20;
        analysis.tags.push('⚔️ High Competition');
      }
    } else {
      analysis.competition_score = 50; // Unknown
    }
  }

  // Calculate overall score using weighted formula
  calculateOverallScore(analysis) {
    const weights = {
      skill_match: 0.3,
      quality: 0.25,
      budget: 0.25,
      competition: 0.2
    };

    analysis.overall_score = Math.round(
      analysis.skill_match_score * weights.skill_match +
      analysis.quality_score * weights.quality +
      analysis.budget_score * weights.budget +
      analysis.competition_score * weights.competition
    );

    // Calculate success probability
    analysis.success_probability = Math.min(95, analysis.overall_score + 
      (analysis.detected_skills.length * 2) - 
      (analysis.red_flags.length * 5));

    // Add overall quality tags
    if (analysis.overall_score >= 85) {
      analysis.tags.unshift('⭐ Excellent Match');
    } else if (analysis.overall_score >= 70) {
      analysis.tags.unshift('✨ Good Match');
    } else if (analysis.overall_score >= 50) {
      analysis.tags.unshift('👍 Decent Match');
    } else {
      analysis.tags.unshift('⚠️ Poor Match');
    }
  }

  // Generate AI-powered recommendation
  generateRecommendation(job, analysis) {
    let recommendation = '';

    if (analysis.overall_score >= 85) {
      recommendation = `🎯 **HIGHLY RECOMMENDED!** This job is an excellent match with ${analysis.detected_skills.length} relevant skills detected. `;
    } else if (analysis.overall_score >= 70) {
      recommendation = `✨ **GOOD OPPORTUNITY** - Strong match with good potential. `;
    } else if (analysis.overall_score >= 50) {
      recommendation = `👍 **CONSIDER APPLYING** - Decent opportunity but evaluate carefully. `;
    } else {
      recommendation = `⚠️ **PROCEED WITH CAUTION** - Low match score, consider if worth your time. `;
    }

    // Add specific advice
    if (analysis.red_flags.length > 0) {
      recommendation += `⚠️ Red flags detected: ${analysis.red_flags.slice(0, 2).join(', ')}. `;
    }

    if (analysis.budget_score >= 80) {
      recommendation += `💰 Excellent budget potential. `;
    } else if (analysis.budget_score <= 40) {
      recommendation += `💸 Budget may be low - negotiate carefully. `;
    }

    if (analysis.competition_score >= 80) {
      recommendation += `🎯 Low competition - apply quickly! `;
    } else if (analysis.competition_score <= 30) {
      recommendation += `⚔️ High competition - make your proposal stand out. `;
    }

    // Add skill advice
    if (analysis.missing_skills.length > 0) {
      recommendation += `📚 Consider highlighting: ${analysis.missing_skills[0]}. `;
    }

    analysis.ai_recommendation = recommendation.trim();
  }

  // Batch analyze multiple jobs
  analyzeJobs(jobs) {
    return jobs.map(job => ({
      ...job,
      ai_analysis: this.analyzeJob(job)
    })).sort((a, b) => b.ai_analysis.overall_score - a.ai_analysis.overall_score);
  }

  // Get market insights
  getMarketInsights(jobs) {
    const insights = {
      total_jobs: jobs.length,
      avg_score: 0,
      top_skills: {},
      budget_distribution: { high: 0, medium: 0, low: 0 },
      competition_levels: { low: 0, medium: 0, high: 0 },
      trending_opportunities: 0
    };

    jobs.forEach(job => {
      if (job.ai_analysis) {
        insights.avg_score += job.ai_analysis.overall_score;
        
        // Count skills
        job.ai_analysis.detected_skills.forEach(skill => {
          insights.top_skills[skill.name] = (insights.top_skills[skill.name] || 0) + 1;
        });

        // Budget distribution
        if (job.ai_analysis.budget_score >= 80) insights.budget_distribution.high++;
        else if (job.ai_analysis.budget_score >= 50) insights.budget_distribution.medium++;
        else insights.budget_distribution.low++;

        // Competition levels
        if (job.ai_analysis.competition_score >= 70) insights.competition_levels.low++;
        else if (job.ai_analysis.competition_score >= 40) insights.competition_levels.medium++;
        else insights.competition_levels.high++;

        // Trending opportunities
        if (job.ai_analysis.tags.some(tag => tag.includes('Hot Skill'))) {
          insights.trending_opportunities++;
        }
      }
    });

    insights.avg_score = Math.round(insights.avg_score / jobs.length);
    
    // Sort top skills
    insights.top_skills = Object.entries(insights.top_skills)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [skill, count]) => ({ ...obj, [skill]: count }), {});

    return insights;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIJobAnalyzer;
} else {
  window.AIJobAnalyzer = AIJobAnalyzer;
}
