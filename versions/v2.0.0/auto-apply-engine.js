// 🤖 AI-Powered Auto-Apply Engine with Real AI Integration
class AutoApplyEngine {
  constructor() {
    this.userProfile = null;
    this.proposalTemplates = this.initializeTemplates();
    this.applicationHistory = new Set();
    this.isEnabled = false;
    this.aiApiKey = 'AIzaSyDa0jOXmeVOEgYT_6dp-7JcWGppTs9EzWE';
    this.aiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.settings = {
      minScore: 75,
      maxApplicationsPerDay: 10,
      autoSubmit: false, // Safety first!
      customizeProposals: true,
      includePortfolio: true,
      followUpEnabled: true,
      useRealAI: true, // Enable real AI generation
      aiCreativity: 0.7, // Temperature for AI responses
      proposalLength: 'medium' // short, medium, long
    };
  }

  // Initialize proposal templates based on job types
  initializeTemplates() {
    return {
      rails_developer: {
        opening: [
          "Hi there! I'm excited about your Rails project and would love to help bring your vision to life.",
          "Hello! Your Rails development needs caught my attention, and I believe I'm the perfect fit for this project.",
          "Greetings! As a seasoned Rails developer, I'm thrilled to see a project that aligns perfectly with my expertise."
        ],
        experience: [
          "With {years} years of Ruby on Rails experience, I've built scalable web applications for startups and enterprises alike.",
          "I've been crafting elegant Rails solutions for {years} years, specializing in {specializations}.",
          "My {years}-year journey with Rails has equipped me with deep expertise in {key_skills}."
        ],
        value_proposition: [
          "What sets me apart is my ability to write clean, maintainable code while delivering projects on time and within budget.",
          "I focus on building robust, scalable solutions that grow with your business needs.",
          "My approach combines technical excellence with clear communication to ensure project success."
        ],
        closing: [
          "I'd love to discuss how I can contribute to your project's success. When would be a good time for a quick call?",
          "Let's chat about your specific requirements and how I can help achieve your goals.",
          "I'm ready to start immediately and would appreciate the opportunity to discuss this further."
        ]
      },
      ai_ml_developer: {
        opening: [
          "Hello! Your AI/ML project is exactly the type of cutting-edge work I'm passionate about.",
          "Hi! As an AI enthusiast, I'm excited to help you leverage machine learning for your business goals.",
          "Greetings! Your AI project caught my eye, and I believe my ML expertise would be valuable here."
        ],
        experience: [
          "I've developed AI solutions using TensorFlow, PyTorch, and modern LLM frameworks for {years} years.",
          "My experience spans {years} years in machine learning, from data preprocessing to model deployment.",
          "With {years} years in AI/ML, I've worked on everything from computer vision to natural language processing."
        ],
        value_proposition: [
          "I specialize in translating complex AI concepts into practical, business-ready solutions.",
          "My strength lies in building end-to-end ML pipelines that deliver measurable results.",
          "I focus on creating AI systems that are not just accurate, but also scalable and maintainable."
        ],
        closing: [
          "I'd be happy to discuss your AI objectives and propose a tailored solution approach.",
          "Let's explore how AI can transform your business. I'm available for a detailed discussion anytime.",
          "I'm excited to contribute to your AI journey. Shall we schedule a call to discuss specifics?"
        ]
      },
      frontend_developer: {
        opening: [
          "Hi! Your frontend project looks fantastic, and I'd love to help create an amazing user experience.",
          "Hello! As a frontend specialist, I'm excited about the opportunity to work on your UI/UX project.",
          "Greetings! Your frontend requirements align perfectly with my React/Vue.js expertise."
        ],
        experience: [
          "I've been crafting responsive, interactive web interfaces for {years} years using modern frameworks.",
          "With {years} years of frontend development, I specialize in React, Vue.js, and performance optimization.",
          "My {years}-year frontend journey has focused on creating pixel-perfect, accessible user interfaces."
        ],
        value_proposition: [
          "I combine technical skills with design sensibility to create interfaces that users love.",
          "My focus is on building fast, accessible, and mobile-first web experiences.",
          "I deliver clean, maintainable code with excellent cross-browser compatibility."
        ],
        closing: [
          "I'd love to see your design mockups and discuss the technical implementation approach.",
          "Let's talk about your vision and how I can bring it to life with modern frontend technologies.",
          "I'm ready to start coding and would appreciate the chance to discuss your project details."
        ]
      },
      fullstack_developer: {
        opening: [
          "Hello! Your full-stack project is right up my alley, and I'm excited to handle both frontend and backend.",
          "Hi there! As a full-stack developer, I can take your project from concept to deployment seamlessly.",
          "Greetings! I love full-stack challenges and would be thrilled to work on your complete solution."
        ],
        experience: [
          "I've built end-to-end web applications for {years} years, handling everything from database design to user interfaces.",
          "With {years} years of full-stack development, I'm comfortable with the entire web development lifecycle.",
          "My {years}-year full-stack journey covers modern frameworks, APIs, databases, and deployment strategies."
        ],
        value_proposition: [
          "Working with one developer for your entire stack ensures consistency and faster communication.",
          "I provide seamless integration between frontend and backend, resulting in better performance and user experience.",
          "My full-stack approach means I can optimize the entire application architecture for your specific needs."
        ],
        closing: [
          "I'd love to discuss your technical requirements and propose a comprehensive development approach.",
          "Let's chat about your project scope and timeline. I'm ready to handle the complete development process.",
          "I'm excited to be your one-stop solution for this project. When can we discuss the details?"
        ]
      }
    };
  }

  // Analyze job and determine the best template
  selectTemplate(job) {
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const analysis = job.ai_analysis;

    // Check for AI/ML keywords
    if (jobText.includes('ai') || jobText.includes('machine learning') || 
        jobText.includes('tensorflow') || jobText.includes('pytorch') ||
        jobText.includes('openai') || jobText.includes('chatgpt')) {
      return 'ai_ml_developer';
    }

    // Check for Rails keywords
    if (jobText.includes('rails') || jobText.includes('ruby')) {
      return 'rails_developer';
    }

    // Check for frontend keywords
    if (jobText.includes('react') || jobText.includes('vue') || 
        jobText.includes('frontend') || jobText.includes('ui/ux')) {
      return 'frontend_developer';
    }

    // Check for full-stack keywords
    if (jobText.includes('full stack') || jobText.includes('fullstack') ||
        (jobText.includes('backend') && jobText.includes('frontend'))) {
      return 'fullstack_developer';
    }

    // Default to most relevant based on detected skills
    if (analysis?.detected_skills?.length) {
      const skills = analysis.detected_skills.map(s => s.name.toLowerCase());
      if (skills.some(s => ['rails', 'ruby'].includes(s))) return 'rails_developer';
      if (skills.some(s => ['react', 'vue', 'angular'].includes(s))) return 'frontend_developer';
      if (skills.some(s => ['python', 'tensorflow', 'pytorch'].includes(s))) return 'ai_ml_developer';
    }

    return 'fullstack_developer'; // Default fallback
  }

  // Generate personalized proposal with real AI
  async generateProposal(job, userProfile = null) {
    const analysis = job.ai_analysis || {};
    
    // Extract user info or use defaults
    const profile = userProfile || {
      years_experience: 5,
      specializations: ['web development', 'modern frameworks'],
      key_skills: ['JavaScript', 'Python', 'React'],
      hourly_rate: 50,
      portfolio_items: []
    };

    let proposalText = '';
    
    if (this.settings.useRealAI) {
      try {
        // Generate AI-powered proposal
        proposalText = await this.generateAIProposal(job, profile, analysis);
      } catch (error) {
        console.error('AI proposal generation failed, falling back to templates:', error);
        // Fallback to template-based generation
        proposalText = this.generateTemplateProposal(job, profile, analysis);
      }
    } else {
      // Use template-based generation
      proposalText = this.generateTemplateProposal(job, profile, analysis);
    }

    return {
      proposal_text: proposalText,
      estimated_time: this.estimateProjectTime(job),
      suggested_rate: this.suggestRate(job, profile),
      confidence_score: this.calculateConfidenceScore(job, analysis),
      customizations_applied: this.getCustomizationsApplied(job, analysis),
      generation_method: this.settings.useRealAI ? 'ai_powered' : 'template_based'
    };
  }

  // Real AI-powered proposal generation
  async generateAIProposal(job, profile, analysis) {
    const prompt = this.buildAIPrompt(job, profile, analysis);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: this.settings.aiCreativity,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: this.getMaxTokensForLength(this.settings.proposalLength),
      }
    };

    const response = await fetch(`${this.aiEndpoint}?key=${this.aiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Invalid AI response format');
    }
  }

  // Build comprehensive AI prompt
  buildAIPrompt(job, profile, analysis) {
    const detectedSkills = analysis.detected_skills?.map(s => s.name).join(', ') || 'Not specified';
    const aiScore = analysis.overall_score || 0;
    const successProbability = analysis.success_probability || 0;
    const redFlags = analysis.red_flags?.join(', ') || 'None';
    const greenFlags = analysis.green_flags?.join(', ') || 'None';
    
    const lengthInstruction = {
      short: 'Keep the proposal concise (100-150 words)',
      medium: 'Write a detailed proposal (200-300 words)',
      long: 'Create a comprehensive proposal (300-500 words)'
    }[this.settings.proposalLength];

    return `You are an expert freelancer writing a winning Upwork proposal. Generate a professional, personalized proposal for this job:

JOB DETAILS:
- Title: ${job.title}
- Description: ${job.description?.substring(0, 500)}...
- Budget: ${job.budget || 'Not specified'}
- Posted: ${job.postedTime || 'Recently'}
- Proposals: ${job.proposals || 'Unknown'}

MY PROFILE:
- Experience: ${profile.years_experience} years
- Specializations: ${profile.specializations.join(', ')}
- Key Skills: ${profile.key_skills.join(', ')}
- Hourly Rate: $${profile.hourly_rate}/hr

AI ANALYSIS:
- Overall Score: ${aiScore}%
- Success Probability: ${successProbability}%
- Required Skills Detected: ${detectedSkills}
- Potential Concerns: ${redFlags}
- Positive Indicators: ${greenFlags}

INSTRUCTIONS:
1. ${lengthInstruction}
2. Start with a compelling hook that shows you understand their specific needs
3. Highlight relevant experience and skills that match the detected requirements
4. Address any potential concerns subtly if red flags were detected
5. Include a clear value proposition and next steps
6. Use a professional but friendly tone
7. End with a strong call-to-action
8. DO NOT use generic templates - make it specific to this job
9. DO NOT mention the AI analysis directly
10. Focus on solving their problem, not just listing your skills

Generate a winning proposal that stands out from the competition:`;
  }

  // Fallback template-based generation
  generateTemplateProposal(job, profile, analysis) {
    const template = this.proposalTemplates[this.selectTemplate(job)];
    
    // Select random variations for natural feel
    const opening = this.getRandomItem(template.opening);
    const experience = this.getRandomItem(template.experience);
    const value = this.getRandomItem(template.value_proposition);
    const closing = this.getRandomItem(template.closing);

    // Customize based on job specifics
    let customizedExperience = experience
      .replace('{years}', profile.years_experience)
      .replace('{specializations}', profile.specializations.join(', '))
      .replace('{key_skills}', profile.key_skills.join(', '));

    // Add job-specific customizations
    let jobSpecificSection = this.generateJobSpecificSection(job, analysis);

    // Build the complete proposal
    let proposal = `${opening}\n\n${customizedExperience}\n\n`;
    
    if (jobSpecificSection) {
      proposal += `${jobSpecificSection}\n\n`;
    }
    
    proposal += `${value}\n\n`;

    // Add portfolio if relevant
    if (this.settings.includePortfolio && profile.portfolio_items?.length) {
      proposal += this.generatePortfolioSection(profile.portfolio_items, job) + '\n\n';
    }

    // Add budget consideration
    proposal += this.generateBudgetSection(job, profile) + '\n\n';

    proposal += closing;

    return proposal;
  }

  // Get max tokens based on proposal length setting
  getMaxTokensForLength(length) {
    const tokenLimits = {
      short: 200,
      medium: 400,
      long: 600
    };
    return tokenLimits[length] || 400;
  }

  generateJobSpecificSection(job, analysis) {
    const detectedSkills = analysis.detected_skills || [];
    const jobText = `${job.title} ${job.description}`.toLowerCase();

    let section = '';

    // Mention specific technologies from the job
    if (detectedSkills.length > 0) {
      const relevantSkills = detectedSkills.slice(0, 3).map(s => s.name);
      section += `I noticed you're looking for expertise in ${relevantSkills.join(', ')}, which aligns perfectly with my skill set. `;
    }

    // Address specific requirements
    if (jobText.includes('urgent') || jobText.includes('asap')) {
      section += `I understand this is time-sensitive and can prioritize your project to meet tight deadlines. `;
    }

    if (jobText.includes('scalable') || jobText.includes('performance')) {
      section += `I have extensive experience building scalable, high-performance applications that can handle growth. `;
    }

    if (jobText.includes('startup') || jobText.includes('mvp')) {
      section += `I love working with startups and understand the importance of building MVPs that can evolve quickly. `;
    }

    if (jobText.includes('enterprise') || jobText.includes('large scale')) {
      section += `My enterprise experience has taught me the importance of robust architecture and maintainable code. `;
    }

    return section.trim();
  }

  generatePortfolioSection(portfolioItems, job) {
    const relevantItems = portfolioItems.filter(item => 
      this.isPortfolioRelevant(item, job)
    ).slice(0, 2);

    if (relevantItems.length === 0) return '';

    let section = 'Here are some relevant projects from my portfolio:\n';
    relevantItems.forEach(item => {
      section += `• ${item.title}: ${item.description} (${item.technologies})\n`;
    });

    return section;
  }

  generateBudgetSection(job, profile) {
    const budgetText = job.budget || '';
    const hourlyMatch = budgetText.match(/\$(\d+)(?:-\$?(\d+))?\s*(?:per\s*hour|\/hr|hourly)/i);
    
    if (hourlyMatch) {
      const jobRate = parseInt(hourlyMatch[1]);
      if (jobRate >= profile.hourly_rate) {
        return `Your budget of ${budgetText} works well for this project scope.`;
      } else {
        return `I'd be happy to discuss the budget to ensure we can deliver the quality you need within your range.`;
      }
    }

    return `I'm flexible with pricing and always aim to deliver excellent value for your investment.`;
  }

  estimateProjectTime(job) {
    const description = job.description || '';
    const complexity = this.assessComplexity(job);
    
    const baseHours = {
      low: 20,
      medium: 50,
      high: 100
    };

    return `${baseHours[complexity]}-${baseHours[complexity] * 1.5} hours`;
  }

  suggestRate(job, profile) {
    const analysis = job.ai_analysis || {};
    let baseRate = profile.hourly_rate || 50;

    // Adjust based on job quality
    if (analysis.overall_score >= 85) baseRate *= 1.2;
    else if (analysis.overall_score <= 50) baseRate *= 0.9;

    // Adjust based on urgency
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    if (jobText.includes('urgent') || jobText.includes('asap')) {
      baseRate *= 1.15;
    }

    return Math.round(baseRate);
  }

  calculateConfidenceScore(job, analysis) {
    let score = 50; // Base confidence

    // Boost based on AI analysis
    if (analysis.overall_score) {
      score += (analysis.overall_score - 50) * 0.5;
    }

    // Boost based on skill match
    if (analysis.detected_skills?.length >= 3) score += 20;
    if (analysis.detected_skills?.length >= 5) score += 10;

    // Reduce based on red flags
    if (analysis.red_flags?.length > 0) score -= analysis.red_flags.length * 5;

    // Boost based on green flags
    if (analysis.green_flags?.length > 0) score += analysis.green_flags.length * 3;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  getCustomizationsApplied(job, analysis) {
    const customizations = [];
    
    if (analysis.detected_skills?.length > 0) {
      customizations.push(`Mentioned ${analysis.detected_skills.length} relevant skills`);
    }
    
    if (analysis.red_flags?.length > 0) {
      customizations.push('Addressed potential concerns');
    }
    
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    if (jobText.includes('urgent')) {
      customizations.push('Emphasized quick turnaround capability');
    }
    
    return customizations;
  }

  assessComplexity(job) {
    const analysis = job.ai_analysis || {};
    const skillCount = analysis.detected_skills?.length || 0;
    const description = job.description || '';

    if (skillCount >= 5 || description.length > 1000) return 'high';
    if (skillCount >= 3 || description.length > 500) return 'medium';
    return 'low';
  }

  isPortfolioRelevant(item, job) {
    const jobSkills = job.ai_analysis?.detected_skills?.map(s => s.name.toLowerCase()) || [];
    const itemTech = item.technologies.toLowerCase();
    
    return jobSkills.some(skill => itemTech.includes(skill));
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Auto-apply workflow
  async processJobForAutoApply(job) {
    const analysis = job.ai_analysis || {};
    
    // Check if job meets criteria
    if (!this.shouldAutoApply(job, analysis)) {
      return { applied: false, reason: 'Does not meet auto-apply criteria' };
    }

    // Check daily limit
    if (this.getTodayApplicationCount() >= this.settings.maxApplicationsPerDay) {
      return { applied: false, reason: 'Daily application limit reached' };
    }

    // Generate proposal
    const proposal = this.generateProposal(job, this.userProfile);
    
    // If auto-submit is disabled, just prepare the proposal
    if (!this.settings.autoSubmit) {
      return {
        applied: false,
        proposal_ready: true,
        proposal: proposal,
        reason: 'Auto-submit disabled - proposal prepared for review'
      };
    }

    // TODO: Implement actual application submission
    // This would require additional Upwork API integration
    
    return {
      applied: true,
      proposal: proposal,
      timestamp: new Date().toISOString()
    };
  }

  shouldAutoApply(job, analysis) {
    // Must meet minimum AI score
    if ((analysis.overall_score || 0) < this.settings.minScore) return false;
    
    // Must not have too many red flags
    if ((analysis.red_flags?.length || 0) > 2) return false;
    
    // Must not have already applied
    if (this.applicationHistory.has(job.url)) return false;
    
    // Must have some skill match
    if ((analysis.detected_skills?.length || 0) < 2) return false;
    
    return true;
  }

  getTodayApplicationCount() {
    const today = new Date().toDateString();
    const todayApps = Array.from(this.applicationHistory).filter(app => 
      app.date === today
    );
    return todayApps.length;
  }

  // Settings management
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  async saveSettings() {
    await chrome.storage.local.set({ 'auto_apply_settings': this.settings });
  }

  async loadSettings() {
    const result = await chrome.storage.local.get(['auto_apply_settings']);
    if (result.auto_apply_settings) {
      this.settings = { ...this.settings, ...result.auto_apply_settings };
    }
  }

  // User profile management
  setUserProfile(profile) {
    this.userProfile = profile;
    chrome.storage.local.set({ 'user_profile': profile });
  }

  async loadUserProfile() {
    const result = await chrome.storage.local.get(['user_profile']);
    if (result.user_profile) {
      this.userProfile = result.user_profile;
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoApplyEngine;
} else {
  window.AutoApplyEngine = AutoApplyEngine;
}
