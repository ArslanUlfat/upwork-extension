// 🎯 AI-Powered Profile Optimization Engine
class ProfileOptimizer {
  constructor() {
    this.marketTrends = this.initializeMarketTrends();
    this.skillDemandData = this.initializeSkillDemand();
    this.optimizationRules = this.initializeOptimizationRules();
  }

  initializeMarketTrends() {
    return {
      hot_skills_2024: [
        { skill: 'AI/Machine Learning', growth: 150, avg_rate: 85 },
        { skill: 'ChatGPT Integration', growth: 200, avg_rate: 75 },
        { skill: 'React', growth: 45, avg_rate: 65 },
        { skill: 'Node.js', growth: 40, avg_rate: 60 },
        { skill: 'Python', growth: 55, avg_rate: 70 },
        { skill: 'TypeScript', growth: 60, avg_rate: 68 },
        { skill: 'Next.js', growth: 80, avg_rate: 72 },
        { skill: 'Vue.js', growth: 35, avg_rate: 58 },
        { skill: 'Ruby on Rails', growth: 25, avg_rate: 75 },
        { skill: 'Docker', growth: 50, avg_rate: 65 },
        { skill: 'AWS', growth: 65, avg_rate: 80 },
        { skill: 'Blockchain', growth: 90, avg_rate: 90 }
      ],
      declining_skills: [
        { skill: 'jQuery', decline: -30 },
        { skill: 'PHP (legacy)', decline: -20 },
        { skill: 'WordPress (basic)', decline: -15 }
      ],
      seasonal_trends: {
        'Q1': ['Tax Software', 'Planning Tools', 'Analytics'],
        'Q2': ['E-learning', 'Travel Apps', 'Summer Projects'],
        'Q3': ['Back-to-School', 'Education Tech', 'LMS'],
        'Q4': ['E-commerce', 'Holiday Features', 'Black Friday']
      }
    };
  }

  initializeSkillDemand() {
    return {
      'AI/ML': { demand: 'very_high', competition: 'medium', rate_premium: 25 },
      'React': { demand: 'high', competition: 'high', rate_premium: 10 },
      'Node.js': { demand: 'high', competition: 'medium', rate_premium: 8 },
      'Python': { demand: 'high', competition: 'medium', rate_premium: 12 },
      'Rails': { demand: 'medium', competition: 'low', rate_premium: 15 },
      'Vue.js': { demand: 'medium', competition: 'medium', rate_premium: 5 },
      'Angular': { demand: 'medium', competition: 'medium', rate_premium: 5 },
      'DevOps': { demand: 'high', competition: 'low', rate_premium: 20 },
      'Mobile Development': { demand: 'high', competition: 'medium', rate_premium: 15 }
    };
  }

  initializeOptimizationRules() {
    return {
      title_optimization: {
        power_words: ['Expert', 'Specialist', 'Senior', 'Full-Stack', 'AI-Powered'],
        avoid_words: ['Beginner', 'Learning', 'Cheap', 'Budget'],
        max_length: 50,
        include_top_skills: 2
      },
      overview_optimization: {
        min_length: 300,
        max_length: 1000,
        include_sections: ['experience', 'skills', 'achievements', 'value_proposition'],
        keyword_density: 0.02,
        call_to_action: true
      },
      skills_optimization: {
        max_skills: 15,
        prioritize_trending: true,
        include_certifications: true,
        skill_grouping: true
      },
      portfolio_optimization: {
        min_projects: 3,
        max_projects: 8,
        include_case_studies: true,
        showcase_results: true,
        recent_work_priority: true
      }
    };
  }

  // Main profile analysis function
  analyzeProfile(profileData) {
    const analysis = {
      overall_score: 0,
      title_score: 0,
      overview_score: 0,
      skills_score: 0,
      portfolio_score: 0,
      rate_optimization: 0,
      recommendations: [],
      trending_opportunities: [],
      skill_gaps: [],
      rate_suggestions: {},
      competitive_analysis: {}
    };

    // Analyze each section
    this.analyzeTitleOptimization(profileData.title || '', analysis);
    this.analyzeOverviewOptimization(profileData.overview || '', analysis);
    this.analyzeSkillsOptimization(profileData.skills || [], analysis);
    this.analyzePortfolioOptimization(profileData.portfolio || [], analysis);
    this.analyzeRateOptimization(profileData.hourly_rate || 0, profileData.skills || [], analysis);

    // Calculate overall score
    analysis.overall_score = Math.round(
      (analysis.title_score * 0.2 +
       analysis.overview_score * 0.3 +
       analysis.skills_score * 0.25 +
       analysis.portfolio_score * 0.15 +
       analysis.rate_optimization * 0.1)
    );

    // Generate recommendations
    this.generateRecommendations(profileData, analysis);

    return analysis;
  }

  analyzeTitleOptimization(title, analysis) {
    const rules = this.optimizationRules.title_optimization;
    let score = 50; // Base score

    // Check length
    if (title.length > rules.max_length) {
      score -= 15;
      analysis.recommendations.push({
        type: 'title',
        priority: 'high',
        message: `Title is too long (${title.length} chars). Keep it under ${rules.max_length} characters.`,
        suggestion: title.substring(0, rules.max_length - 3) + '...'
      });
    }

    // Check for power words
    const powerWordsFound = rules.power_words.filter(word => 
      title.toLowerCase().includes(word.toLowerCase())
    );
    score += powerWordsFound.length * 10;

    // Check for avoid words
    const avoidWordsFound = rules.avoid_words.filter(word => 
      title.toLowerCase().includes(word.toLowerCase())
    );
    score -= avoidWordsFound.length * 15;

    if (avoidWordsFound.length > 0) {
      analysis.recommendations.push({
        type: 'title',
        priority: 'high',
        message: `Avoid weak words: ${avoidWordsFound.join(', ')}`,
        suggestion: 'Use stronger, more confident language'
      });
    }

    // Check for trending skills
    const trendingInTitle = this.marketTrends.hot_skills_2024.filter(trend =>
      title.toLowerCase().includes(trend.skill.toLowerCase())
    );
    score += trendingInTitle.length * 15;

    analysis.title_score = Math.max(0, Math.min(100, score));
  }

  analyzeOverviewOptimization(overview, analysis) {
    const rules = this.optimizationRules.overview_optimization;
    let score = 50;

    // Check length
    if (overview.length < rules.min_length) {
      score -= 20;
      analysis.recommendations.push({
        type: 'overview',
        priority: 'high',
        message: `Overview is too short (${overview.length} chars). Aim for ${rules.min_length}-${rules.max_length} characters.`,
        suggestion: 'Add more details about your experience, achievements, and value proposition'
      });
    } else if (overview.length > rules.max_length) {
      score -= 10;
      analysis.recommendations.push({
        type: 'overview',
        priority: 'medium',
        message: `Overview is quite long (${overview.length} chars). Consider condensing to ${rules.max_length} characters.`,
        suggestion: 'Focus on your most impactful achievements and skills'
      });
    } else {
      score += 15;
    }

    // Check for required sections
    const sectionKeywords = {
      experience: ['years', 'experience', 'worked', 'developed', 'built'],
      skills: ['expert', 'skilled', 'proficient', 'specialize'],
      achievements: ['increased', 'improved', 'delivered', 'successful', 'award'],
      value_proposition: ['help', 'solve', 'deliver', 'provide', 'ensure']
    };

    let sectionsFound = 0;
    Object.entries(sectionKeywords).forEach(([section, keywords]) => {
      const hasSection = keywords.some(keyword => 
        overview.toLowerCase().includes(keyword)
      );
      if (hasSection) {
        sectionsFound++;
        score += 8;
      } else {
        analysis.recommendations.push({
          type: 'overview',
          priority: 'medium',
          message: `Add ${section} section to your overview`,
          suggestion: `Include details about your ${section.replace('_', ' ')}`
        });
      }
    });

    // Check for call to action
    const ctaWords = ['contact', 'discuss', 'chat', 'message', 'reach out'];
    const hasCTA = ctaWords.some(word => overview.toLowerCase().includes(word));
    if (hasCTA) {
      score += 10;
    } else {
      analysis.recommendations.push({
        type: 'overview',
        priority: 'medium',
        message: 'Add a call-to-action at the end of your overview',
        suggestion: 'End with something like "Let\'s discuss your project!" or "Message me to get started"'
      });
    }

    analysis.overview_score = Math.max(0, Math.min(100, score));
  }

  analyzeSkillsOptimization(skills, analysis) {
    const rules = this.optimizationRules.skills_optimization;
    let score = 50;

    // Check skill count
    if (skills.length < 5) {
      score -= 20;
      analysis.recommendations.push({
        type: 'skills',
        priority: 'high',
        message: `Add more skills (${skills.length}/15). You can list up to 15 skills.`,
        suggestion: 'Include both technical skills and soft skills relevant to your niche'
      });
    } else if (skills.length > rules.max_skills) {
      score -= 10;
      analysis.recommendations.push({
        type: 'skills',
        priority: 'medium',
        message: `Too many skills (${skills.length}/${rules.max_skills}). Focus on your strongest skills.`,
        suggestion: 'Remove less relevant or weaker skills to improve your profile focus'
      });
    }

    // Check for trending skills
    const trendingSkills = this.marketTrends.hot_skills_2024.filter(trend =>
      skills.some(skill => skill.toLowerCase().includes(trend.skill.toLowerCase()))
    );

    score += trendingSkills.length * 8;

    // Identify missing trending skills
    const missingTrending = this.marketTrends.hot_skills_2024.filter(trend =>
      !skills.some(skill => skill.toLowerCase().includes(trend.skill.toLowerCase()))
    ).slice(0, 3);

    analysis.skill_gaps = missingTrending.map(trend => ({
      skill: trend.skill,
      growth: trend.growth,
      avg_rate: trend.avg_rate,
      reason: `High demand skill with ${trend.growth}% growth and $${trend.avg_rate}/hr average rate`
    }));

    // Check skill relevance
    const skillDemandScore = skills.reduce((total, skill) => {
      const demand = this.skillDemandData[skill];
      if (demand) {
        switch(demand.demand) {
          case 'very_high': return total + 15;
          case 'high': return total + 10;
          case 'medium': return total + 5;
          default: return total;
        }
      }
      return total;
    }, 0);

    score += Math.min(40, skillDemandScore);

    analysis.skills_score = Math.max(0, Math.min(100, score));
  }

  analyzePortfolioOptimization(portfolio, analysis) {
    const rules = this.optimizationRules.portfolio_optimization;
    let score = 50;

    // Check portfolio count
    if (portfolio.length < rules.min_projects) {
      score -= 25;
      analysis.recommendations.push({
        type: 'portfolio',
        priority: 'high',
        message: `Add more portfolio projects (${portfolio.length}/${rules.min_projects} minimum)`,
        suggestion: 'Showcase your best work with detailed case studies and results'
      });
    } else if (portfolio.length > rules.max_projects) {
      score -= 5;
      analysis.recommendations.push({
        type: 'portfolio',
        priority: 'low',
        message: `Consider reducing portfolio items (${portfolio.length}/${rules.max_projects} recommended)`,
        suggestion: 'Keep only your most impressive and relevant projects'
      });
    }

    // Check for case studies
    const hasCaseStudies = portfolio.some(item => 
      item.description && item.description.length > 200
    );
    if (hasCaseStudies) {
      score += 15;
    } else {
      analysis.recommendations.push({
        type: 'portfolio',
        priority: 'medium',
        message: 'Add detailed case studies to your portfolio items',
        suggestion: 'Include problem, solution, technologies used, and results achieved'
      });
    }

    // Check for recent work
    const currentYear = new Date().getFullYear();
    const recentWork = portfolio.filter(item => 
      item.year && item.year >= currentYear - 1
    );
    
    if (recentWork.length === 0) {
      score -= 15;
      analysis.recommendations.push({
        type: 'portfolio',
        priority: 'high',
        message: 'Add recent work to show you\'re actively developing',
        suggestion: 'Include projects from the last 12 months to demonstrate current skills'
      });
    }

    analysis.portfolio_score = Math.max(0, Math.min(100, score));
  }

  analyzeRateOptimization(currentRate, skills, analysis) {
    let score = 50;

    // Calculate suggested rate based on skills
    const skillPremiums = skills.reduce((total, skill) => {
      const demand = this.skillDemandData[skill];
      return total + (demand ? demand.rate_premium : 0);
    }, 0);

    const baseRate = 45; // Industry average
    const suggestedRate = baseRate + (skillPremiums / skills.length) * 2;

    analysis.rate_suggestions = {
      current_rate: currentRate,
      suggested_rate: Math.round(suggestedRate),
      market_average: baseRate,
      skill_premium: Math.round(skillPremiums / skills.length)
    };

    // Rate optimization score
    if (currentRate === 0) {
      score = 0;
      analysis.recommendations.push({
        type: 'rate',
        priority: 'high',
        message: 'Set your hourly rate to appear in more searches',
        suggestion: `Based on your skills, consider starting at $${Math.round(suggestedRate * 0.8)}-${Math.round(suggestedRate)}/hr`
      });
    } else if (currentRate < suggestedRate * 0.7) {
      score = 30;
      analysis.recommendations.push({
        type: 'rate',
        priority: 'medium',
        message: 'Your rate might be too low for your skill level',
        suggestion: `Consider increasing to $${Math.round(suggestedRate * 0.85)}-${Math.round(suggestedRate)}/hr`
      });
    } else if (currentRate > suggestedRate * 1.3) {
      score = 40;
      analysis.recommendations.push({
        type: 'rate',
        priority: 'medium',
        message: 'Your rate might be limiting opportunities',
        suggestion: `Market rate for your skills is around $${Math.round(suggestedRate)}/hr`
      });
    } else {
      score = 90;
    }

    analysis.rate_optimization = score;
  }

  generateRecommendations(profileData, analysis) {
    // Add trending opportunities
    const userSkills = (profileData.skills || []).map(s => s.toLowerCase());
    
    this.marketTrends.hot_skills_2024.forEach(trend => {
      const hasSkill = userSkills.some(skill => 
        skill.includes(trend.skill.toLowerCase())
      );
      
      if (hasSkill) {
        analysis.trending_opportunities.push({
          skill: trend.skill,
          growth: trend.growth,
          avg_rate: trend.avg_rate,
          action: 'Highlight this skill more prominently in your profile'
        });
      }
    });

    // Add seasonal recommendations
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    const seasonalSkills = this.marketTrends.seasonal_trends[`Q${currentQuarter}`];
    
    if (seasonalSkills) {
      analysis.recommendations.push({
        type: 'seasonal',
        priority: 'low',
        message: `Q${currentQuarter} trending: ${seasonalSkills.join(', ')}`,
        suggestion: 'Consider adding relevant seasonal skills or projects to your profile'
      });
    }

    // Sort recommendations by priority
    analysis.recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Generate optimized profile suggestions
  generateOptimizedProfile(currentProfile, analysis) {
    const optimized = {
      title: this.generateOptimizedTitle(currentProfile, analysis),
      overview: this.generateOptimizedOverview(currentProfile, analysis),
      skills: this.generateOptimizedSkills(currentProfile, analysis),
      rate_suggestion: analysis.rate_suggestions.suggested_rate
    };

    return optimized;
  }

  generateOptimizedTitle(profile, analysis) {
    const skills = profile.skills || [];
    const topSkills = this.marketTrends.hot_skills_2024
      .filter(trend => skills.some(skill => 
        skill.toLowerCase().includes(trend.skill.toLowerCase())
      ))
      .slice(0, 2)
      .map(trend => trend.skill);

    const powerWord = this.optimizationRules.title_optimization.power_words[0];
    
    if (topSkills.length >= 2) {
      return `${powerWord} ${topSkills[0]} & ${topSkills[1]} Developer`;
    } else if (topSkills.length === 1) {
      return `${powerWord} ${topSkills[0]} Developer & Consultant`;
    } else {
      return `${powerWord} Full-Stack Developer & Problem Solver`;
    }
  }

  generateOptimizedOverview(profile, analysis) {
    const experience = profile.years_experience || 5;
    const topSkills = (profile.skills || []).slice(0, 3).join(', ');
    
    return `🚀 ${experience}+ years of experience delivering high-quality solutions using ${topSkills}.

💡 I specialize in building scalable, maintainable applications that drive business results. My expertise spans the full development lifecycle from planning to deployment.

🏆 Recent achievements:
• Increased client revenue by 40% through performance optimization
• Delivered 50+ successful projects with 98% client satisfaction
• Expert in modern frameworks and best practices

🎯 I help businesses transform ideas into powerful digital solutions. Whether you need a complete application or want to optimize existing systems, I deliver results that exceed expectations.

💬 Ready to discuss your project? Let's chat about how I can help you achieve your goals!`;
  }

  generateOptimizedSkills(profile, analysis) {
    const currentSkills = profile.skills || [];
    const trendingSkills = analysis.skill_gaps.slice(0, 3).map(gap => gap.skill);
    
    // Combine current skills with trending suggestions
    const optimizedSkills = [...currentSkills];
    
    trendingSkills.forEach(skill => {
      if (!optimizedSkills.some(existing => 
        existing.toLowerCase().includes(skill.toLowerCase())
      )) {
        optimizedSkills.push(skill);
      }
    });

    return optimizedSkills.slice(0, 15);
  }

  // Market intelligence features
  getMarketInsights() {
    return {
      trending_skills: this.marketTrends.hot_skills_2024.slice(0, 5),
      declining_skills: this.marketTrends.declining_skills,
      seasonal_opportunities: this.marketTrends.seasonal_trends,
      rate_benchmarks: this.calculateRateBenchmarks()
    };
  }

  calculateRateBenchmarks() {
    return {
      entry_level: { min: 25, max: 45 },
      mid_level: { min: 45, max: 75 },
      senior_level: { min: 75, max: 120 },
      expert_level: { min: 120, max: 200 }
    };
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfileOptimizer;
} else {
  window.ProfileOptimizer = ProfileOptimizer;
}
