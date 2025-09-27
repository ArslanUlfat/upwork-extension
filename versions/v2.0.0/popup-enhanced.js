// 🪄 Magic Upwork Extension - Enhanced Popup Controller with AI
class MagicPopupController {
  constructor() {
    this.jobs = [];
    this.aiAnalyzer = new AIJobAnalyzer();
    this.autoApplyEngine = new AutoApplyEngine();
    this.currentSort = 'ai_score';
    this.theme = 'light';
    this.autoScrapeSettings = null;
    
    this.initializeElements();
    this.bindEvents();
    this.loadStoredData();
    this.initializeTheme();
    this.initializeAutoApply();
  }

  initializeElements() {
    this.elements = {
      // Core elements
      scrapeBtn: document.getElementById('scrapeBtn'),
      clearBtn: document.getElementById('clearBtn'),
      searchInput: document.getElementById('searchInput'),
      sortFilter: document.getElementById('sortFilter'),
      jobsList: document.getElementById('jobsList'),
      jobCount: document.getElementById('jobCount'),
      loadingIndicator: document.getElementById('loadingIndicator'),
      errorMessage: document.getElementById('errorMessage'),
      
      // New magic elements
      themeToggle: document.getElementById('themeToggle'),
      showAnalytics: document.getElementById('showAnalytics'),
      analyticsDashboard: document.getElementById('analyticsDashboard'),
      toggleAnalytics: document.getElementById('toggleAnalytics'),
      
      // Analytics elements
      avgScore: document.getElementById('avgScore'),
      highBudgetJobs: document.getElementById('highBudgetJobs'),
      lowCompetition: document.getElementById('lowCompetition'),
      trendingJobs: document.getElementById('trendingJobs'),
      topSkills: document.getElementById('topSkills'),
      
      // Auto-apply elements
      autoApplyToggle: document.getElementById('autoApplyToggle'),
      autoApplyControls: document.getElementById('autoApplyControls'),
      minAIScore: document.getElementById('minAIScore'),
      maxAppsPerDay: document.getElementById('maxAppsPerDay'),
      autoSubmitProposals: document.getElementById('autoSubmitProposals'),
      customizeProposals: document.getElementById('customizeProposals'),
      
      // Existing elements
      autoScrapeToggle: document.getElementById('autoScrapeToggle'),
      exportBtn: document.getElementById('exportBtn'),
      sendSlackBtn: document.getElementById('sendSlackBtn')
    };
  }

  bindEvents() {
    // Core functionality
    this.elements.scrapeBtn.addEventListener('click', () => this.scrapeJobs());
    this.elements.clearBtn.addEventListener('click', () => this.clearJobs());
    this.elements.sortFilter.addEventListener('change', (e) => this.sortJobs(e.target.value));
    
    // New magic features
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.elements.showAnalytics?.addEventListener('click', () => this.showAnalytics());
    this.elements.toggleAnalytics?.addEventListener('click', () => this.hideAnalytics());
    
    // Enhanced search with debouncing
    let searchTimeout;
    this.elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.filterDisplayedJobs(e.target.value);
      }, 300);
    });

    // Enter key to scrape
    this.elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.scrapeJobs();
    });
  }

  async scrapeJobs() {
    const searchQuery = this.elements.searchInput.value.trim() || 'rails';
    
    this.showLoading(true);
    this.hideError();

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('upwork.com')) {
        this.showError('Please navigate to Upwork.com first');
        return;
      }

      // Navigate to search page if needed
      if (!tab.url.includes('/nx/search/jobs')) {
        await chrome.tabs.update(tab.id, {
          url: `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(searchQuery)}`
        });
        await this.waitForTabLoad(tab.id);
      }

      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      await new Promise(r => setTimeout(r, 1000));

      // Send scrape message
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'scrapeJobs',
        searchQuery: searchQuery
      });

      if (response && response.success) {
        // 🪄 MAGIC: Analyze jobs with AI
        const analyzedJobs = this.aiAnalyzer.analyzeJobs(response.jobs);
        this.jobs = analyzedJobs;
        
        this.displayJobs(this.jobs);
        this.updateAnalytics();
        this.saveJobsToStorage();
        
        // Show success animation
        this.showSuccessAnimation(`✨ Found ${this.jobs.length} jobs with AI analysis!`);
      } else {
        this.showError('Failed to scrape jobs. Please try again.');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      this.showError('Error occurred while scraping jobs');
    } finally {
      this.showLoading(false);
    }
  }

  displayJobs(jobs) {
    const container = this.elements.jobsList;
    container.innerHTML = '';

    if (jobs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <h3>🔍 No jobs found</h3>
          <p>Try adjusting your search terms</p>
        </div>
      `;
      return;
    }

    jobs.forEach((job, index) => {
      const jobCard = this.createJobCard(job, index);
      container.appendChild(jobCard);
    });

    this.updateJobCount(jobs.length);
  }

  createJobCard(job, index) {
    const card = document.createElement('div');
    card.className = 'job-card fade-in';
    card.style.animationDelay = `${index * 0.1}s`;

    const analysis = job.ai_analysis || {};
    const scoreClass = this.getScoreClass(analysis.overall_score || 0);
    
    card.innerHTML = `
      <div class="job-header">
        <a href="${job.url}" target="_blank" class="job-title">${job.title}</a>
        <div class="job-budget">${job.budget || 'Not specified'}</div>
      </div>
      
      <div class="job-description">${job.description || 'No description available'}</div>
      
      <div class="job-meta">
        <div class="job-meta-item">
          ⏰ ${job.postedTime || 'Unknown'}
        </div>
        <div class="job-meta-item">
          👥 ${job.proposals || 'Unknown'}
        </div>
        <div class="job-meta-item">
          🏢 ${job.clientInfo || 'Unknown'}
        </div>
      </div>

      ${analysis.detected_skills?.length ? `
        <div class="skills-detected">
          ${analysis.detected_skills.slice(0, 5).map(skill => 
            `<span class="skill-badge">${skill.name}</span>`
          ).join('')}
        </div>
      ` : ''}

      ${analysis ? `
        <div class="ai-analysis">
          <div class="ai-score">
            <div>
              <strong>🤖 AI Analysis</strong>
              <div style="font-size: 12px; color: var(--text-muted);">
                Success Rate: ${analysis.success_probability || 0}%
              </div>
            </div>
            <div class="score-circle ${scoreClass}">
              ${analysis.overall_score || 0}
            </div>
          </div>
          
          ${analysis.tags?.length ? `
            <div class="ai-tags">
              ${analysis.tags.slice(0, 3).map(tag => 
                `<span class="ai-tag ${tag.includes('🔥') ? 'hot-skill' : ''}">${tag}</span>`
              ).join('')}
            </div>
          ` : ''}
          
          <div class="ai-recommendation">
            ${analysis.ai_recommendation || 'No recommendation available'}
          </div>
          
          <div class="ai-actions" style="margin-top: 12px; display: flex; gap: 8px;">
            <button class="ai-proposal-btn" data-job-id="${job.id}" 
                    style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">
              🤖 Generate AI Proposal
            </button>
            <button class="quick-apply-btn" data-job-id="${job.id}" 
                    style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">
              ⚡ Quick Apply
            </button>
          </div>
        </div>
      ` : ''}
    `;

    // Add event listeners for AI proposal generation
    const proposalBtn = card.querySelector('.ai-proposal-btn');
    const quickApplyBtn = card.querySelector('.quick-apply-btn');
    
    if (proposalBtn) {
      proposalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.generateProposalForJob(job);
      });
    }
    
    if (quickApplyBtn) {
      quickApplyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.quickApplyToJob(job);
      });
    }

    return card;
  }

  // Generate AI proposal for a specific job
  async generateProposalForJob(job) {
    try {
      // Show loading state
      const proposalBtn = document.querySelector(`[data-job-id="${job.id}"].ai-proposal-btn`);
      const originalText = proposalBtn.textContent;
      proposalBtn.textContent = '🤖 Generating...';
      proposalBtn.disabled = true;

      // Generate proposal using real AI
      const proposal = await this.autoApplyEngine.generateProposal(job);
      
      // Show proposal in modal
      this.showProposalModal(job, proposal);
      
      // Reset button
      proposalBtn.textContent = originalText;
      proposalBtn.disabled = false;
      
    } catch (error) {
      console.error('Error generating proposal:', error);
      this.showError('Failed to generate AI proposal. Please try again.');
      
      // Reset button
      const proposalBtn = document.querySelector(`[data-job-id="${job.id}"].ai-proposal-btn`);
      proposalBtn.textContent = '🤖 Generate AI Proposal';
      proposalBtn.disabled = false;
    }
  }

  // Show proposal in a modal dialog
  showProposalModal(job, proposal) {
    const modal = document.createElement('div');
    modal.className = 'proposal-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(5px);
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: var(--shadow-heavy);
      border: 1px solid var(--border-color);
    `;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: var(--text-primary); margin: 0;">🤖 AI-Generated Proposal</h3>
        <button id="closeModal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted);">×</button>
      </div>
      
      <div style="margin-bottom: 16px;">
        <strong style="color: var(--text-primary);">Job:</strong> 
        <span style="color: var(--text-secondary);">${job.title}</span>
      </div>
      
      <div style="margin-bottom: 16px;">
        <div style="display: flex; gap: 16px; margin-bottom: 12px;">
          <div style="background: var(--bg-secondary); padding: 8px 12px; border-radius: 8px;">
            <strong>Method:</strong> ${proposal.generation_method === 'ai_powered' ? '🤖 AI-Powered' : '📝 Template-Based'}
          </div>
          <div style="background: var(--bg-secondary); padding: 8px 12px; border-radius: 8px;">
            <strong>Confidence:</strong> ${proposal.confidence_score}%
          </div>
          <div style="background: var(--bg-secondary); padding: 8px 12px; border-radius: 8px;">
            <strong>Rate:</strong> $${proposal.suggested_rate}/hr
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Generated Proposal:</label>
        <textarea id="proposalText" style="width: 100%; height: 300px; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; font-size: 14px; line-height: 1.5; background: var(--bg-secondary); color: var(--text-primary); resize: vertical;">${proposal.proposal_text}</textarea>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="copyProposal" style="background: var(--info-color); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">
          📋 Copy to Clipboard
        </button>
        <button id="openJobUrl" style="background: var(--success-color); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">
          🚀 Open Job & Apply
        </button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('closeModal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.getElementById('copyProposal').addEventListener('click', () => {
      const textarea = document.getElementById('proposalText');
      textarea.select();
      document.execCommand('copy');
      
      const btn = document.getElementById('copyProposal');
      const originalText = btn.textContent;
      btn.textContent = '✅ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });

    document.getElementById('openJobUrl').addEventListener('click', () => {
      chrome.tabs.create({ url: job.url });
      document.body.removeChild(modal);
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Quick apply to job
  async quickApplyToJob(job) {
    try {
      const result = await this.autoApplyEngine.processJobForAutoApply(job);
      
      if (result.applied) {
        this.showSuccessAnimation(`✅ Successfully applied to: ${job.title}`);
      } else if (result.proposal_ready) {
        this.showProposalModal(job, result.proposal);
      } else {
        this.showError(`Cannot apply: ${result.reason}`);
      }
    } catch (error) {
      console.error('Error in quick apply:', error);
      this.showError('Failed to process application. Please try again.');
    }
  }

  // Initialize auto-apply functionality
  initializeAutoApply() {
    // Load auto-apply settings
    this.autoApplyEngine.loadSettings();
    
    // Bind auto-apply toggle
    if (this.elements.autoApplyToggle) {
      this.elements.autoApplyToggle.addEventListener('change', (e) => {
        this.toggleAutoApply(e.target.checked);
      });
    }
    
    // Bind settings changes
    if (this.elements.minAIScore) {
      this.elements.minAIScore.addEventListener('change', (e) => {
        this.autoApplyEngine.updateSettings({ minScore: parseInt(e.target.value) });
      });
    }
    
    if (this.elements.maxAppsPerDay) {
      this.elements.maxAppsPerDay.addEventListener('change', (e) => {
        this.autoApplyEngine.updateSettings({ maxApplicationsPerDay: parseInt(e.target.value) });
      });
    }
    
    if (this.elements.autoSubmitProposals) {
      this.elements.autoSubmitProposals.addEventListener('change', (e) => {
        this.autoApplyEngine.updateSettings({ autoSubmit: e.target.checked });
      });
    }
  }

  // Toggle auto-apply functionality
  toggleAutoApply(enabled) {
    this.autoApplyEngine.isEnabled = enabled;
    
    if (this.elements.autoApplyControls) {
      this.elements.autoApplyControls.classList.toggle('hidden', !enabled);
    }
    
    if (enabled) {
      this.showSuccessAnimation('🤖 Auto-Apply enabled! High-quality jobs will be processed automatically.');
    } else {
      this.showSuccessAnimation('⏸️ Auto-Apply disabled.');
    }
  }

  getScoreClass(score) {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-decent';
    return 'score-poor';
  }

  updateAnalytics() {
    if (!this.jobs.length) return;

    const insights = this.aiAnalyzer.getMarketInsights(this.jobs);
    
    this.elements.avgScore.textContent = insights.avg_score;
    this.elements.highBudgetJobs.textContent = insights.budget_distribution.high;
    this.elements.lowCompetition.textContent = insights.competition_levels.low;
    this.elements.trendingJobs.textContent = insights.trending_opportunities;

    // Update top skills
    const topSkillsHtml = Object.entries(insights.top_skills)
      .slice(0, 5)
      .map(([skill, count]) => 
        `<span class="skill-badge" style="margin: 2px;">${skill} (${count})</span>`
      ).join('');
    
    this.elements.topSkills.innerHTML = `
      <div style="margin-top: 12px;">
        <strong>🔥 Top Skills:</strong><br>
        ${topSkillsHtml}
      </div>
    `;
  }

  showAnalytics() {
    this.elements.analyticsDashboard.classList.remove('hidden');
    this.elements.showAnalytics.style.display = 'none';
  }

  hideAnalytics() {
    this.elements.analyticsDashboard.classList.add('hidden');
    this.elements.showAnalytics.style.display = 'block';
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', this.theme);
    this.elements.themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('theme', this.theme);
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.theme = savedTheme;
    document.body.setAttribute('data-theme', this.theme);
    this.elements.themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
  }

  sortJobs(sortBy) {
    if (!this.jobs.length) return;

    this.jobs.sort((a, b) => {
      switch(sortBy) {
        case 'ai_score':
          return (b.ai_analysis?.overall_score || 0) - (a.ai_analysis?.overall_score || 0);
        case 'budget':
          const budgetA = this.extractBudgetNumber(a.budget);
          const budgetB = this.extractBudgetNumber(b.budget);
          return budgetB - budgetA;
        case 'date':
          return new Date(b.scrapedAt) - new Date(a.scrapedAt);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    this.displayJobs(this.jobs);
  }

  extractBudgetNumber(budgetStr) {
    if (!budgetStr) return 0;
    const match = budgetStr.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  showSuccessAnimation(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, var(--success-color), #059669);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 1000;
      animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showLoading(show) {
    this.elements.loadingIndicator.classList.toggle('hidden', !show);
  }

  showError(message) {
    this.elements.errorMessage.querySelector('p').textContent = message;
    this.elements.errorMessage.classList.remove('hidden');
    setTimeout(() => this.hideError(), 5000);
  }

  hideError() {
    this.elements.errorMessage.classList.add('hidden');
  }

  updateJobCount(count) {
    this.elements.jobCount.textContent = `${count} jobs analyzed`;
  }

  async waitForTabLoad(tabId) {
    return new Promise((resolve) => {
      const listener = (updatedTabId, changeInfo) => {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  clearJobs() {
    this.jobs = [];
    this.displayJobs([]);
    this.hideAnalytics();
    chrome.storage.local.remove(['upwork_rails_jobs']);
  }

  async saveJobsToStorage() {
    await chrome.storage.local.set({
      'upwork_rails_jobs': this.jobs,
      'last_scrape_time': new Date().toISOString()
    });
  }

  async loadStoredData() {
    const result = await chrome.storage.local.get(['upwork_rails_jobs', 'last_scrape_time']);
    if (result.upwork_rails_jobs) {
      this.jobs = result.upwork_rails_jobs;
      this.displayJobs(this.jobs);
      this.updateAnalytics();
    }
  }

  filterDisplayedJobs(query) {
    if (!query) {
      this.displayJobs(this.jobs);
      return;
    }

    const filtered = this.jobs.filter(job => {
      const searchText = `${job.title} ${job.description}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    this.displayJobs(filtered);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize the magic! 🪄
document.addEventListener('DOMContentLoaded', () => {
  window.magicController = new MagicPopupController();
});

// Add AI analyzer to window for content script access
if (typeof AIJobAnalyzer !== 'undefined') {
  window.AIJobAnalyzer = AIJobAnalyzer;
}
