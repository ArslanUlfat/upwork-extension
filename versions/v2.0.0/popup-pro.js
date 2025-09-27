// 🪄 Magic Upwork Pro - Professional Interface Controller
class MagicUpworkPro {
  constructor() {
    this.jobs = [];
    this.filteredJobs = [];
    this.selectedJobs = new Set();
    this.currentTab = 'jobs';
    this.sortBy = 'ai_score';
    this.sortOrder = 'desc';
    
    // Initialize version management
    this.versionDisplay = new VersionDisplay();
    
    // Initialize AI engines
    this.aiAnalyzer = new AIJobAnalyzer();
    this.autoApplyEngine = new AutoApplyEngine();
    this.profileOptimizer = new ProfileOptimizer();
    this.notificationEngine = new NotificationEngine();
    this.dataExporter = new DataExportEngine();
    
    this.initializeInterface();
    this.bindEvents();
    this.loadStoredData();
  }

  async initializeInterface() {
    // Initialize version display
    await this.versionDisplay.initialize();
    const versionContainer = document.getElementById('versionDisplay');
    if (versionContainer) {
      this.versionDisplay.addVersionInfo(versionContainer, { 
        showBadge: true, 
        showFeatures: true, 
        compact: false 
      });
    }
    
    // Add version-specific classes to body
    document.body.className += ' ' + this.versionDisplay.getVersionClasses();
    
    // Check for upgrades and show notification if available
    const upgradeInfo = this.versionDisplay.versionManager.checkForUpgrade();
    if (upgradeInfo) {
      setTimeout(() => this.versionDisplay.showUpgradeNotification(), 2000);
    }
    
    // Tab switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Settings modal
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettingsModal();
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
      this.closeSettingsModal();
    });

    // Filter controls
    this.initializeFilters();
    
    // Jobs table
    this.initializeJobsTable();
    
    // Proposal generator
    this.initializeProposalGenerator();
    
    // Analytics
    this.initializeAnalytics();
  }

  bindEvents() {
    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    });

    // Filter controls
    document.querySelectorAll('.filter-select, .budget-input').forEach(control => {
      control.addEventListener('change', () => this.applyFilters());
    });

    // Score range slider
    const scoreSlider = document.getElementById('minScoreRange');
    const scoreValue = document.getElementById('minScoreValue');
    scoreSlider.addEventListener('input', (e) => {
      scoreValue.textContent = e.target.value;
      this.applyFilters();
    });

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', () => {
      this.clearAllFilters();
    });

    // Action buttons
    document.getElementById('generateProposalBtn').addEventListener('click', () => {
      this.generateProposalsForSelected();
    });

    document.getElementById('sendToSlackBtn').addEventListener('click', () => {
      this.sendSelectedToSlack();
    });

    document.getElementById('scrapeJobsBtn').addEventListener('click', () => {
      this.scrapeNewJobs();
    });

    // Select all checkbox
    document.getElementById('selectAll').addEventListener('change', (e) => {
      this.toggleSelectAll(e.target.checked);
    });

    // Table sorting
    document.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', (e) => {
        const sortField = e.currentTarget.dataset.sort;
        this.sortJobs(sortField);
      });
    });
  }

  switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    this.currentTab = tabName;

    // Load tab-specific data
    if (tabName === 'analytics') {
      this.updateAnalytics();
    }
  }

  initializeFilters() {
    // Populate skill options dynamically
    this.populateSkillsFilter();
    
    // Set default values
    document.getElementById('minScoreRange').value = 70;
    document.getElementById('minScoreValue').textContent = '70';
  }

  populateSkillsFilter() {
    const skillsFilter = document.getElementById('skillsFilter');
    const commonSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'Ruby on Rails',
      'PHP', 'Java', 'C#', 'Vue.js', 'Angular', 'TypeScript',
      'AI/ML', 'Data Science', 'DevOps', 'AWS', 'Docker'
    ];

    commonSkills.forEach(skill => {
      const option = document.createElement('option');
      option.value = skill.toLowerCase().replace(/[^a-z0-9]/g, '-');
      option.textContent = skill;
      skillsFilter.appendChild(option);
    });
  }

  initializeJobsTable() {
    // Show loading state initially
    this.showLoadingState();
  }

  initializeProposalGenerator() {
    const generateBtn = document.getElementById('generateProposalMainBtn');
    generateBtn.addEventListener('click', () => {
      this.generateProposalFromInput();
    });

    document.getElementById('copyProposalBtn').addEventListener('click', () => {
      this.copyGeneratedProposal();
    });

    document.getElementById('regenerateBtn').addEventListener('click', () => {
      this.regenerateProposal();
    });
  }

  initializeAnalytics() {
    // Initialize charts and metrics
    this.updateAnalytics();
  }

  async loadStoredData() {
    try {
      const result = await chrome.storage.local.get(['upwork_rails_jobs']);
      if (result.upwork_rails_jobs) {
        this.jobs = result.upwork_rails_jobs;
        this.filteredJobs = [...this.jobs];
        this.renderJobsTable();
        this.updateJobCount();
        this.hideLoadingState();
      } else {
        this.showEmptyState();
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
      this.showEmptyState();
    }
  }

  async scrapeNewJobs() {
    this.showLoadingState();
    
    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('upwork.com')) {
        this.showError('Please navigate to Upwork job search page first');
        return;
      }

      // Inject content script and scrape
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['shared/content.js']
      });

      // Wait for scraping to complete
      setTimeout(async () => {
        await this.loadStoredData();
        this.showSuccess('Jobs scraped and analyzed successfully!');
      }, 3000);

    } catch (error) {
      console.error('Error scraping jobs:', error);
      this.showError('Failed to scrape jobs. Please try again.');
      this.hideLoadingState();
    }
  }

  applyFilters() {
    const filters = this.getFilterValues();
    
    this.filteredJobs = this.jobs.filter(job => {
      // Search filter
      if (filters.search) {
        const searchText = `${job.title} ${job.description}`.toLowerCase();
        if (!searchText.includes(filters.search.toLowerCase())) {
          return false;
        }
      }

      // Category filter
      if (filters.category && job.category !== filters.category) {
        return false;
      }

      // Skills filter
      if (filters.skills) {
        const jobSkills = job.ai_analysis?.detected_skills?.map(s => s.name.toLowerCase()) || [];
        if (!jobSkills.some(skill => skill.includes(filters.skills.toLowerCase()))) {
          return false;
        }
      }

      // Budget filter
      if (filters.minBudget || filters.maxBudget) {
        const jobBudget = this.extractBudgetNumber(job.budget);
        if (filters.minBudget && jobBudget < filters.minBudget) return false;
        if (filters.maxBudget && jobBudget > filters.maxBudget) return false;
      }

      // AI Score filter
      const aiScore = job.ai_analysis?.overall_score || 0;
      if (aiScore < filters.minScore) {
        return false;
      }

      // Posted date filter
      if (filters.postedDays) {
        const jobDate = new Date(job.scrapedAt);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.postedDays);
        if (jobDate < cutoffDate) return false;
      }

      return true;
    });

    this.renderJobsTable();
    this.updateJobCount();
  }

  getFilterValues() {
    return {
      search: document.getElementById('searchInput').value.trim(),
      category: document.getElementById('categoryFilter').value,
      skills: document.getElementById('skillsFilter').value,
      experience: document.getElementById('experienceFilter').value,
      minBudget: parseInt(document.getElementById('minBudget').value) || 0,
      maxBudget: parseInt(document.getElementById('maxBudget').value) || Infinity,
      minScore: parseInt(document.getElementById('minScoreRange').value),
      postedDays: parseInt(document.getElementById('postedDateFilter').value) || null
    };
  }

  clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('skillsFilter').value = '';
    document.getElementById('experienceFilter').value = '';
    document.getElementById('minBudget').value = '';
    document.getElementById('maxBudget').value = '';
    document.getElementById('minScoreRange').value = 70;
    document.getElementById('minScoreValue').textContent = '70';
    document.getElementById('postedDateFilter').value = '';
    
    this.applyFilters();
  }

  sortJobs(field) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'desc';
    }

    this.filteredJobs.sort((a, b) => {
      let aVal = this.getSortValue(a, field);
      let bVal = this.getSortValue(b, field);

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    this.renderJobsTable();
    this.updateSortIndicators();
  }

  getSortValue(job, field) {
    switch (field) {
      case 'title': return job.title || '';
      case 'category': return job.category || '';
      case 'skills': return job.ai_analysis?.detected_skills?.length || 0;
      case 'budget': return this.extractBudgetNumber(job.budget);
      case 'posted': return new Date(job.scrapedAt).getTime();
      case 'location': return job.location || '';
      case 'proposals': return parseInt(job.proposals?.match(/\d+/)?.[0] || '0');
      case 'ai_score': return job.ai_analysis?.overall_score || 0;
      default: return '';
    }
  }

  updateSortIndicators() {
    document.querySelectorAll('.sortable').forEach(header => {
      header.classList.remove('sort-asc', 'sort-desc');
      if (header.dataset.sort === this.sortBy) {
        header.classList.add(`sort-${this.sortOrder}`);
      }
    });
  }

  renderJobsTable() {
    const tbody = document.getElementById('jobsTableBody');
    tbody.innerHTML = '';

    if (this.filteredJobs.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();

    this.filteredJobs.forEach(job => {
      const row = this.createJobRow(job);
      tbody.appendChild(row);
    });
  }

  createJobRow(job) {
    const row = document.createElement('tr');
    const analysis = job.ai_analysis || {};
    const aiScore = analysis.overall_score || 0;
    const scoreClass = this.getScoreClass(aiScore);

    row.innerHTML = `
      <td>
        <input type="checkbox" class="table-checkbox job-checkbox" data-job-id="${job.id}">
      </td>
      <td>
        <div class="job-title">
          <a href="${job.url}" target="_blank" class="job-link" title="${job.title}">${job.title.length > 40 ? job.title.substring(0, 40) + '...' : job.title}</a>
          <div class="job-meta">
            ${analysis.tags?.slice(0, 1).map(tag => `<span class="job-tag">${tag}</span>`).join('') || ''}
          </div>
        </div>
      </td>
      <td>
        <div class="skills-list">
          ${analysis.detected_skills?.slice(0, 2).map(skill => 
            `<span class="skill-tag">${skill.name}</span>`
          ).join('') || 'N/A'}
        </div>
      </td>
      <td class="budget-cell">${job.budget || 'Not specified'}</td>
      <td>${this.formatDate(job.scrapedAt)}</td>
      <td>
        <div class="ai-score ${scoreClass}">
          <span class="score-value">${aiScore}%</span>
          <div class="score-bar">
            <div class="score-fill" style="width: ${aiScore}%"></div>
          </div>
        </div>
      </td>
    `;

    // Add click handler for row selection
    const checkbox = row.querySelector('.job-checkbox');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        this.selectedJobs.add(job.id);
        row.classList.add('selected');
      } else {
        this.selectedJobs.delete(job.id);
        row.classList.remove('selected');
      }
      this.updateActionButtons();
    });

    return row;
  }

  getScoreClass(score) {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-poor';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  extractBudgetNumber(budgetStr) {
    if (!budgetStr) return 0;
    const match = budgetStr.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  toggleSelectAll(checked) {
    this.selectedJobs.clear();
    
    document.querySelectorAll('.job-checkbox').forEach(checkbox => {
      checkbox.checked = checked;
      const jobId = checkbox.dataset.jobId;
      const row = checkbox.closest('tr');
      
      if (checked) {
        this.selectedJobs.add(jobId);
        row.classList.add('selected');
      } else {
        row.classList.remove('selected');
      }
    });

    this.updateActionButtons();
  }

  updateActionButtons() {
    const hasSelection = this.selectedJobs.size > 0;
    document.getElementById('generateProposalBtn').disabled = !hasSelection;
    document.getElementById('sendToSlackBtn').disabled = !hasSelection;
  }

  updateJobCount() {
    const count = this.filteredJobs.length;
    const total = this.jobs.length;
    const countText = count === total ? 
      `${count} jobs found` : 
      `${count} of ${total} jobs`;
    
    document.getElementById('jobCount').textContent = countText;
  }

  showLoadingState() {
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('emptyState').style.display = 'none';
    document.querySelector('.jobs-table-container').style.display = 'none';
  }

  hideLoadingState() {
    document.getElementById('loadingState').style.display = 'none';
    document.querySelector('.jobs-table-container').style.display = 'block';
  }

  showEmptyState() {
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('loadingState').style.display = 'none';
    document.querySelector('.jobs-table-container').style.display = 'none';
  }

  hideEmptyState() {
    document.getElementById('emptyState').style.display = 'none';
    document.querySelector('.jobs-table-container').style.display = 'block';
  }

  async generateProposalsForSelected() {
    if (this.selectedJobs.size === 0) return;

    const selectedJobIds = Array.from(this.selectedJobs);
    const selectedJobsData = this.jobs.filter(job => selectedJobIds.includes(job.id));

    // Switch to proposals tab
    this.switchTab('proposals');

    // Generate proposal for first selected job
    const firstJob = selectedJobsData[0];
    const jobDetails = `${firstJob.title}\n\n${firstJob.description}`;
    document.getElementById('jobDetailsInput').value = jobDetails;

    this.showSuccess(`Switched to Proposals tab. ${selectedJobsData.length} job(s) selected for proposal generation.`);
  }

  async generateProposalFromInput() {
    const jobDetails = document.getElementById('jobDetailsInput').value.trim();
    if (!jobDetails) {
      this.showError('Please enter job details first');
      return;
    }

    const generateBtn = document.getElementById('generateProposalMainBtn');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = '🤖 Generating...';
    generateBtn.disabled = true;

    try {
      // Create a mock job object for the AI
      const mockJob = {
        title: jobDetails.split('\n')[0],
        description: jobDetails,
        ai_analysis: {
          overall_score: 75,
          detected_skills: [{ name: 'Web Development' }]
        }
      };

      const settings = {
        proposalLength: document.getElementById('proposalLength').value,
        aiCreativity: 0.7
      };

      // Update auto-apply engine settings
      this.autoApplyEngine.settings = { ...this.autoApplyEngine.settings, ...settings };

      const proposal = await this.autoApplyEngine.generateProposal(mockJob);
      document.getElementById('generatedProposal').value = proposal.proposal_text;

      this.showSuccess('Proposal generated successfully!');
    } catch (error) {
      console.error('Error generating proposal:', error);
      this.showError('Failed to generate proposal. Please try again.');
    } finally {
      generateBtn.textContent = originalText;
      generateBtn.disabled = false;
    }
  }

  copyGeneratedProposal() {
    const textarea = document.getElementById('generatedProposal');
    textarea.select();
    document.execCommand('copy');
    this.showSuccess('Proposal copied to clipboard!');
  }

  regenerateProposal() {
    this.generateProposalFromInput();
  }

  async sendSelectedToSlack() {
    if (this.selectedJobs.size === 0) return;

    try {
      const selectedJobsData = this.jobs.filter(job => 
        Array.from(this.selectedJobs).includes(job.id)
      );

      await this.notificationEngine.notifyNewJobs(selectedJobsData);
      this.showSuccess(`Sent ${selectedJobsData.length} job(s) to Slack!`);
    } catch (error) {
      console.error('Error sending to Slack:', error);
      this.showError('Failed to send to Slack. Please check your webhook settings.');
    }
  }

  updateAnalytics() {
    if (this.jobs.length === 0) return;

    // Update metrics
    const totalJobs = this.jobs.length;
    const avgScore = Math.round(
      this.jobs.reduce((sum, job) => sum + (job.ai_analysis?.overall_score || 0), 0) / totalJobs
    );
    const highQualityJobs = this.jobs.filter(job => (job.ai_analysis?.overall_score || 0) >= 80).length;
    const avgBudget = Math.round(
      this.jobs.reduce((sum, job) => sum + this.extractBudgetNumber(job.budget), 0) / totalJobs
    );

    document.getElementById('totalJobsMetric').textContent = totalJobs;
    document.getElementById('avgScoreMetric').textContent = `${avgScore}%`;
    document.getElementById('highQualityMetric').textContent = highQualityJobs;
    document.getElementById('avgBudgetMetric').textContent = `$${avgBudget}`;

    // Update charts
    this.updateSkillsChart();
    this.updateBudgetChart();
  }

  updateSkillsChart() {
    const skillCounts = {};
    this.jobs.forEach(job => {
      job.ai_analysis?.detected_skills?.forEach(skill => {
        skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const chartContainer = document.getElementById('skillsChart');
    chartContainer.innerHTML = topSkills.map(([skill, count]) => `
      <div class="skill-bar">
        <div class="skill-name">${skill}</div>
        <div class="skill-bar-bg">
          <div class="skill-bar-fill" style="width: ${(count / topSkills[0][1]) * 100}%"></div>
        </div>
        <div class="skill-count">${count}</div>
      </div>
    `).join('');
  }

  updateBudgetChart() {
    const budgetRanges = {
      'Under $25': 0,
      '$25-50': 0,
      '$50-75': 0,
      '$75-100': 0,
      'Over $100': 0
    };

    this.jobs.forEach(job => {
      const budget = this.extractBudgetNumber(job.budget);
      if (budget < 25) budgetRanges['Under $25']++;
      else if (budget < 50) budgetRanges['$25-50']++;
      else if (budget < 75) budgetRanges['$50-75']++;
      else if (budget < 100) budgetRanges['$75-100']++;
      else budgetRanges['Over $100']++;
    });

    const chartContainer = document.getElementById('budgetChart');
    const maxCount = Math.max(...Object.values(budgetRanges));
    
    chartContainer.innerHTML = Object.entries(budgetRanges).map(([range, count]) => `
      <div class="budget-bar">
        <div class="budget-range">${range}</div>
        <div class="budget-bar-bg">
          <div class="budget-bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
        </div>
        <div class="budget-count">${count}</div>
      </div>
    `).join('');
  }

  openSettingsModal() {
    document.getElementById('settingsModal').classList.add('active');
  }

  closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.magicUpworkPro = new MagicUpworkPro();
});

// Add notification styles
const notificationStyles = `
<style>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
}

.notification-success {
  background: var(--success);
}

.notification-error {
  background: var(--error);
}

.notification-info {
  background: var(--info);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.skill-bar, .budget-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.skill-name, .budget-range {
  min-width: 100px;
  font-size: 12px;
  color: var(--text-secondary);
}

.skill-bar-bg, .budget-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.skill-bar-fill, .budget-bar-fill {
  height: 100%;
  background: var(--accent-primary);
  transition: width 0.3s ease;
}

.skill-count, .budget-count {
  min-width: 30px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}

.job-link {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
}

.job-link:hover {
  color: var(--accent-primary);
}

.job-meta {
  margin-top: 4px;
}

.job-tag {
  display: inline-block;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 4px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-tag {
  background: var(--accent-primary);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.ai-score {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 60px;
}

.score-value {
  font-size: 12px;
  font-weight: 600;
}

.score-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.score-excellent .score-value { color: var(--success); }
.score-excellent .score-fill { background: var(--success); }

.score-good .score-value { color: var(--accent-primary); }
.score-good .score-fill { background: var(--accent-primary); }

.score-fair .score-value { color: var(--warning); }
.score-fair .score-fill { background: var(--warning); }

.score-poor .score-value { color: var(--error); }
.score-poor .score-fill { background: var(--error); }

tr.selected {
  background: rgba(16, 185, 129, 0.1);
}

.sortable {
  position: relative;
}

.sortable::after {
  content: '';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  opacity: 0.5;
}

.sortable.sort-asc::after {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 6px solid currentColor;
}

.sortable.sort-desc::after {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid currentColor;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);
