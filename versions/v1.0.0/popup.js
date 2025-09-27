// Popup script for the Upwork Rails Job Scraper extension
class PopupController {
  constructor() {
    this.jobs = [];
    this.currentSort = 'date';
    this.autoScrapeSettings = null;
    this.initializeElements();
    this.bindEvents();
    this.loadStoredJobs();
    this.loadAutoScrapeSettings();
  }

  initializeElements() {
    this.elements = {
      scrapeBtn: document.getElementById('scrapeBtn'),
      clearBtn: document.getElementById('clearBtn'),
      exportBtn: document.getElementById('exportBtn'),
      sendSlackBtn: document.getElementById('sendSlackBtn'),
      saveSlackBtn: document.getElementById('saveSlackBtn'),
      autoScrapeToggle: document.getElementById('autoScrapeToggle'),
      autoScrapeControls: document.getElementById('autoScrapeControls'),
      scrapeInterval: document.getElementById('scrapeInterval'),
      searchQueries: document.getElementById('searchQueries'),
      maxJobsAlert: document.getElementById('maxJobsAlert'),
      slackNotifications: document.getElementById('slackNotifications'),
      lastScrapeTime: document.getElementById('lastScrapeTime'),
      searchInput: document.getElementById('searchInput'),
      sortFilter: document.getElementById('sortFilter'),
      slackFormat: document.getElementById('slackFormat'),
      slackWebhook: document.getElementById('slackWebhook'),
      jobsList: document.getElementById('jobsList'),
      jobCount: document.getElementById('jobCount'),
      loadingIndicator: document.getElementById('loadingIndicator'),
      errorMessage: document.getElementById('errorMessage'),
      slackStatus: document.getElementById('slackStatus'),
      openUpwork: document.getElementById('openUpwork')
    };
  }

  bindEvents() {
    this.elements.scrapeBtn.addEventListener('click', () => this.scrapeJobs());
    this.elements.clearBtn.addEventListener('click', () => this.clearJobs());
    this.elements.exportBtn.addEventListener('click', () => this.exportJobs());
    this.elements.sendSlackBtn.addEventListener('click', () => this.sendToSlack());
    this.elements.saveSlackBtn?.addEventListener('click', () => this.saveSlackWebhook());
    this.elements.autoScrapeToggle.addEventListener('change', (e) => this.toggleAutoScrape(e.target.checked));
    this.elements.sortFilter.addEventListener('change', (e) => this.sortJobs(e.target.value));
    this.elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.scrapeJobs();
    });

    // Auto-scrape settings changes
    this.elements.scrapeInterval.addEventListener('change', () => this.updateAutoScrapeSettings());
    this.elements.searchQueries.addEventListener('blur', () => this.updateAutoScrapeSettings());
    this.elements.maxJobsAlert.addEventListener('change', () => this.updateAutoScrapeSettings());
    this.elements.slackNotifications.addEventListener('change', () => this.updateAutoScrapeSettings());

    // Auto-search as user types (debounced)
    let searchTimeout;
    this.elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.filterDisplayedJobs(e.target.value);
      }, 500);
    });
  }

  async scrapeJobs() {
    const searchQuery = this.elements.searchInput.value.trim() || 'rails';
    
    this.showLoading(true);
    this.hideError();

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we're on Upwork
      if (!tab.url.includes('upwork.com')) {
        this.showError('Please navigate to Upwork.com first');
        this.showLoading(false);
        return;
      }

      // Ensure we are on the search page; if not, navigate there
      if (!tab.url.includes('/nx/search/jobs')) {
        await chrome.tabs.update(tab.id, {
          url: `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(searchQuery)}`
        });
        await this.waitForTabLoad(tab.id);
      }

      // Ensure content script is present by injecting it explicitly
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        // Give the script a moment to initialize
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        // Ignore injection errors; sendMessage retry below will surface failure if any
      }

      // Send message to content script with retry if receiving end not ready
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, {
          action: 'scrapeJobs',
          searchQuery: searchQuery
        });
      } catch (err) {
        if ((err?.message || '').includes('Receiving end does not exist')) {
          // Retry once after re-injecting and brief delay
          try {
            await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
          } catch {}
          await new Promise(r => setTimeout(r, 800));
          response = await chrome.tabs.sendMessage(tab.id, {
            action: 'scrapeJobs',
            searchQuery: searchQuery
          });
        } else {
          throw err;
        }
      }

      if (response && response.success) {
        this.jobs = response.jobs || [];
        this.displayJobs();
        this.saveJobsToStorage();
        
        // Show success feedback
        this.elements.scrapeBtn.textContent = `Found ${this.jobs.length}!`;
        setTimeout(() => {
          this.elements.scrapeBtn.textContent = 'Scrape Jobs';
        }, 2000);

      } else {
        throw new Error(response?.error || 'Failed to scrape jobs');
      }

    } catch (error) {
      console.error('Scraping error:', error);
      this.showError('Error scraping jobs. Make sure you\'re on an Upwork job search page.');
    } finally {
      this.showLoading(false);
    }
  }

  async waitForTabLoad(tabId, timeoutMs = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const t = await chrome.tabs.get(tabId);
        if (t.status === 'complete') return;
      } catch (_) {
        // ignore and continue polling
      }
      await new Promise(r => setTimeout(r, 300));
    }
    throw new Error('Page load timeout');
  }

  async loadSlackWebhook() {
    try {
      const result = await chrome.storage.local.get(['slack_webhook_url']);
      if (result.slack_webhook_url && this.elements.slackWebhook) {
        this.elements.slackWebhook.value = result.slack_webhook_url;
      }
    } catch (error) {
      console.error('Error loading Slack webhook:', error);
    }
  }

  async saveSlackWebhook() {
    const url = (this.elements.slackWebhook?.value || '').trim();
    if (!url) {
      this.showSlackStatus('Please enter a Slack webhook URL.', 'error');
      return;
    }
    if (!url.startsWith('https://hooks.slack.com/')) {
      this.showSlackStatus('Invalid webhook URL. It must start with https://hooks.slack.com/', 'error');
      return;
    }

    try {
      await chrome.storage.local.set({ slack_webhook_url: url });
      this.showSlackStatus('Slack webhook saved!', 'success');
      setTimeout(() => this.elements.slackStatus.classList.add('hidden'), 2000);
    } catch (error) {
      console.error('Error saving Slack webhook:', error);
      this.showSlackStatus('Failed to save webhook.', 'error');
    }
  }

  displayJobs() {
    if (!this.jobs || this.jobs.length === 0) {
      this.elements.jobsList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.8);">
          <p>No Rails jobs found.</p>
          <p style="font-size: 12px; margin-top: 10px;">Try navigating to Upwork's job search page and click "Scrape Jobs"</p>
        </div>
      `;
      this.elements.jobCount.textContent = '0 jobs found';
      return;
    }

    this.elements.jobCount.textContent = `${this.jobs.length} jobs found`;
    
    const jobsHtml = this.jobs.map(job => this.createJobElement(job)).join('');
    this.elements.jobsList.innerHTML = jobsHtml;

    // Add click handlers for job links
    this.elements.jobsList.querySelectorAll('.job-title a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: link.href });
      });
    });
  }

  createJobElement(job) {
    const skillsHtml = job.skills && job.skills.length > 0 
      ? job.skills.map(skill => `<span class="skill-tag">${this.escapeHtml(skill)}</span>`).join('')
      : '';

    const budget = job.budget || 'Not specified';
    const postedTime = job.postedTime || 'Unknown';
    const description = job.description || 'No description available';
    const title = job.title || 'Untitled Job';
    const url = job.url || '#';

    return `
      <div class="job-item">
        <div class="job-title">
          <a href="${this.escapeHtml(url)}" target="_blank">
            ${this.escapeHtml(title)}
          </a>
        </div>
        <div class="job-meta">
          <span class="job-budget">${this.escapeHtml(budget)}</span>
          <span class="job-posted">${this.escapeHtml(postedTime)}</span>
        </div>
        <div class="job-description">
          ${this.escapeHtml(description)}
        </div>
        ${skillsHtml ? `<div class="job-skills">${skillsHtml}</div>` : ''}
      </div>
    `;
  }

  filterDisplayedJobs(query) {
    if (!query) {
      this.displayJobs();
      return;
    }

    const filteredJobs = this.jobs.filter(job => {
      const lowerQuery = query.toLowerCase();
      const titleMatch = job.title && job.title.toLowerCase().includes(lowerQuery);
      const descMatch = job.description && job.description.toLowerCase().includes(lowerQuery);
      const skillsMatch = job.skills && job.skills.some(skill => 
        skill.toLowerCase().includes(lowerQuery)
      );
      
      return titleMatch || descMatch || skillsMatch;
    });

    const originalJobs = this.jobs;
    this.jobs = filteredJobs;
    this.displayJobs();
    this.jobs = originalJobs;
  }

  sortJobs(sortType) {
    this.currentSort = sortType;
    
    this.jobs.sort((a, b) => {
      switch (sortType) {
        case 'budget':
          const budgetA = this.extractBudgetNumber(a.budget);
          const budgetB = this.extractBudgetNumber(b.budget);
          return budgetB - budgetA;
          
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
          
        case 'date':
        default:
          return new Date(b.scrapedAt || 0) - new Date(a.scrapedAt || 0);
      }
    });

    this.displayJobs();
  }

  extractBudgetNumber(budgetStr) {
    if (!budgetStr) return 0;
    const match = budgetStr.match(/\$?([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  }

  clearJobs() {
    this.jobs = [];
    this.displayJobs();
    this.clearStoredJobs();
    
    this.elements.clearBtn.textContent = 'Cleared!';
    setTimeout(() => {
      this.elements.clearBtn.textContent = 'Clear All';
    }, 1500);
  }

  exportJobs() {
    if (this.jobs.length === 0) {
      alert('No jobs to export');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalJobs: this.jobs.length,
      searchQuery: this.elements.searchInput.value,
      jobs: this.jobs
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `upwork-rails-jobs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    this.elements.exportBtn.textContent = 'Exported!';
    setTimeout(() => {
      this.elements.exportBtn.textContent = 'Export to JSON';
    }, 1500);
  }

  showLoading(show) {
    this.elements.loadingIndicator.classList.toggle('hidden', !show);
    this.elements.scrapeBtn.disabled = show;
  }

  showError(message) {
    this.elements.errorMessage.querySelector('p').textContent = message;
    this.elements.errorMessage.classList.remove('hidden');
  }

  hideError() {
    this.elements.errorMessage.classList.add('hidden');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Storage methods
  async saveJobsToStorage() {
    try {
      await chrome.storage.local.set({
        'upwork_rails_jobs': this.jobs,
        'last_scraped': new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving jobs to storage:', error);
    }
  }

  async loadStoredJobs() {
    try {
      const result = await chrome.storage.local.get(['upwork_rails_jobs', 'last_scraped']);
      if (result.upwork_rails_jobs && result.upwork_rails_jobs.length > 0) {
        this.jobs = result.upwork_rails_jobs;
        this.displayJobs();
        
        // Show when data was last updated
        if (result.last_scraped) {
          const lastScraped = new Date(result.last_scraped);
          const timeDiff = Math.floor((new Date() - lastScraped) / (1000 * 60));
          
          if (timeDiff < 60) {
            this.elements.jobCount.textContent += ` (${timeDiff}m ago)`;
          } else if (timeDiff < 1440) {
            this.elements.jobCount.textContent += ` (${Math.floor(timeDiff/60)}h ago)`;
          } else {
            this.elements.jobCount.textContent += ` (${Math.floor(timeDiff/1440)}d ago)`;
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored jobs:', error);
    }
  }

  async clearStoredJobs() {
    try {
      await chrome.storage.local.remove(['upwork_rails_jobs', 'last_scraped']);
    } catch (error) {
      console.error('Error clearing stored jobs:', error);
    }
  }

  async sendToSlack() {
    if (!this.jobs || this.jobs.length === 0) {
      this.showSlackStatus('No jobs to send. Please scrape jobs first.', 'error');
      return;
    }

    const format = this.elements.slackFormat.value;
    // Prefer stored webhook URL, fallback to legacy hardcoded value
    const stored = await chrome.storage.local.get(['slack_webhook_url']);
    const slackWebhookUrl = stored.slack_webhook_url;
    if (!stored.slack_webhook_url) {
      this.showSlackStatus('Using default webhook. Save your own Slack webhook for better security.', 'error');
      setTimeout(() => this.elements.slackStatus.classList.add('hidden'), 3000);
    }
    
    this.showSlackStatus('Sending to Slack...', 'sending');
    this.elements.sendSlackBtn.disabled = true;

    try {
      const message = this.formatSlackMessage(format);
      
      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        this.showSlackStatus(`✅ Successfully sent ${this.jobs.length} jobs to Slack!`, 'success');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Slack send error:', error);
      this.showSlackStatus('❌ Failed to send to Slack. Please check your connection.', 'error');
    } finally {
      this.elements.sendSlackBtn.disabled = false;
      
      // Clear status after 5 seconds
      setTimeout(() => {
        this.elements.slackStatus.classList.add('hidden');
      }, 5000);
    }
  }

  formatSlackMessage(format) {
    const timestamp = new Date().toLocaleString();
    const searchQuery = this.elements.searchInput.value || 'rails';
    
    let message = {
      username: "Rails Job Bot",
      icon_emoji: ":rocket:",
      channel: "#jobs" // You can customize this
    };

    switch (format) {
      case 'summary':
        message.text = `🚀 *Rails Jobs Update* - ${timestamp}`;
        message.attachments = [
          {
            color: "#667eea",
            fields: [
              {
                title: "Search Query",
                value: searchQuery,
                short: true
              },
              {
                title: "Total Jobs Found",
                value: this.jobs.length.toString(),
                short: true
              }
            ]
          },
          ...this.jobs.slice(0, 5).map(job => ({
            color: "#36a64f",
            title: job.title || 'Untitled Job',
            title_link: job.url,
            text: this.truncateText(job.description || 'No description', 150),
            fields: [
              {
                title: "Budget",
                value: job.budget || 'Not specified',
                short: true
              },
              {
                title: "Posted",
                value: job.postedTime || 'Unknown',
                short: true
              }
            ],
            footer: job.skills && job.skills.length > 0 ? `Skills: ${job.skills.join(', ')}` : 'No skills listed'
          }))
        ];
        
        if (this.jobs.length > 5) {
          message.attachments.push({
            color: "#f39c12",
            text: `... and ${this.jobs.length - 5} more jobs. Use "Detailed List" to see all jobs.`
          });
        }
        break;

      case 'detailed':
        message.text = `📋 *Detailed Rails Jobs Report* - ${timestamp}\n*Search:* ${searchQuery} | *Total:* ${this.jobs.length} jobs`;
        message.attachments = this.jobs.map((job, index) => ({
          color: index % 2 === 0 ? "#667eea" : "#764ba2",
          title: `${index + 1}. ${job.title || 'Untitled Job'}`,
          title_link: job.url,
          text: job.description || 'No description available',
          fields: [
            {
              title: "💰 Budget",
              value: job.budget || 'Not specified',
              short: true
            },
            {
              title: "⏰ Posted",
              value: job.postedTime || 'Unknown',
              short: true
            },
            {
              title: "👤 Client",
              value: job.clientInfo || 'Unknown',
              short: true
            },
            {
              title: "📊 Proposals",
              value: job.proposals || 'Unknown',
              short: true
            }
          ],
          footer: job.skills && job.skills.length > 0 ? `Skills: ${job.skills.join(', ')}` : 'No skills specified'
        }));
        break;

      case 'all':
        message.text = `📊 *Complete Rails Jobs Export* - ${timestamp}\n*Search Query:* \`${searchQuery}\`\n*Total Jobs:* ${this.jobs.length}`;
        
        // Group jobs by budget ranges for better overview
        const budgetGroups = this.groupJobsByBudget(this.jobs);
        
        message.attachments = [
          {
            color: "#667eea",
            title: "📈 Jobs Summary",
            fields: Object.keys(budgetGroups).map(range => ({
              title: range,
              value: `${budgetGroups[range].length} jobs`,
              short: true
            }))
          },
          ...this.jobs.map((job, index) => ({
            color: this.getBudgetColor(job.budget),
            title: `[${index + 1}/${this.jobs.length}] ${job.title || 'Untitled Job'}`,
            title_link: job.url,
            text: this.truncateText(job.description || 'No description', 200),
            fields: [
              {
                title: "💰 Budget",
                value: job.budget || 'Not specified',
                short: true
              },
              {
                title: "⏰ Posted",
                value: job.postedTime || 'Unknown',
                short: true
              }
            ],
            footer: job.skills && job.skills.length > 0 ? `🏷️ ${job.skills.join(', ')}` : 'No skills listed',
            ts: job.scrapedAt ? Math.floor(new Date(job.scrapedAt).getTime() / 1000) : undefined
          }))
        ];
        break;
    }

    return message;
  }

  groupJobsByBudget(jobs) {
    const groups = {
      'Under $500': [],
      '$500 - $1,000': [],
      '$1,000 - $5,000': [],
      '$5,000+': [],
      'Hourly': [],
      'Not Specified': []
    };

    jobs.forEach(job => {
      const budget = job.budget || '';
      const budgetLower = budget.toLowerCase();
      
      if (budgetLower.includes('hourly') || budgetLower.includes('/hr')) {
        groups['Hourly'].push(job);
      } else if (!budget || budget === 'Not specified') {
        groups['Not Specified'].push(job);
      } else {
        const amount = this.extractBudgetNumber(budget);
        if (amount < 500) {
          groups['Under $500'].push(job);
        } else if (amount < 1000) {
          groups['$500 - $1,000'].push(job);
        } else if (amount < 5000) {
          groups['$1,000 - $5,000'].push(job);
        } else {
          groups['$5,000+'].push(job);
        }
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }

  getBudgetColor(budget) {
    if (!budget || budget === 'Not specified') return '#95a5a6';
    
    const amount = this.extractBudgetNumber(budget);
    if (amount >= 5000) return '#27ae60'; // Green for high budget
    if (amount >= 1000) return '#3498db'; // Blue for medium budget
    if (amount >= 500) return '#f39c12';  // Orange for low budget
    return '#e74c3c'; // Red for very low budget
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  async loadAutoScrapeSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getAutoScrapeSettings' });
      
      if (response && response.success) {
        this.autoScrapeSettings = response.settings;
        this.updateAutoScrapeUI();
      }
    } catch (error) {
      console.error('Error loading auto-scrape settings:', error);
    }
  }

  updateAutoScrapeUI() {
    if (!this.autoScrapeSettings) return;

    const settings = this.autoScrapeSettings;
    
    // Update toggle
    this.elements.autoScrapeToggle.checked = settings.enabled;
    
    // Show/hide controls
    this.elements.autoScrapeControls.classList.toggle('hidden', !settings.enabled);
    
    // Update form values
    this.elements.scrapeInterval.value = settings.interval || 30;
    this.elements.searchQueries.value = (settings.search_queries || ['rails']).join(', ');
    this.elements.maxJobsAlert.value = settings.max_jobs_per_notification || 5;
    this.elements.slackNotifications.checked = settings.send_to_slack !== false;
    
    // Update last scrape time
    if (settings.last_scrape) {
      const lastScrape = new Date(settings.last_scrape);
      const now = new Date();
      const timeDiff = Math.floor((now - lastScrape) / (1000 * 60)); // minutes ago
      
      let timeText;
      if (timeDiff < 1) {
        timeText = 'Just now';
      } else if (timeDiff < 60) {
        timeText = `${timeDiff}m ago`;
      } else if (timeDiff < 1440) {
        timeText = `${Math.floor(timeDiff / 60)}h ago`;
      } else {
        timeText = `${Math.floor(timeDiff / 1440)}d ago`;
      }
      
      this.elements.lastScrapeTime.textContent = timeText;
    } else {
      this.elements.lastScrapeTime.textContent = 'Never';
    }
  }

  async toggleAutoScrape(enabled) {
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'toggleAutoScrape'
      });
      
      if (response && response.success) {
        // Update local settings
        this.autoScrapeSettings.enabled = response.enabled;
        this.updateAutoScrapeUI();
        
        // Show feedback
        const status = response.enabled ? 'enabled' : 'disabled';
        this.showSlackStatus(`Auto-scraper ${status}!`, 'success');
        
        setTimeout(() => {
          this.elements.slackStatus.classList.add('hidden');
        }, 3000);
      }
    } catch (error) {
      console.error('Error toggling auto-scrape:', error);
      this.showSlackStatus('Error updating auto-scraper settings', 'error');
    }
  }

  async updateAutoScrapeSettings() {
    if (!this.autoScrapeSettings) return;

    try {
      // Collect current form values
      const queries = this.elements.searchQueries.value
        .split(',')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      const updatedSettings = {
        ...this.autoScrapeSettings,
        interval: parseInt(this.elements.scrapeInterval.value),
        search_queries: queries.length > 0 ? queries : ['rails'],
        max_jobs_per_notification: parseInt(this.elements.maxJobsAlert.value),
        send_to_slack: this.elements.slackNotifications.checked
      };

      const response = await chrome.runtime.sendMessage({ 
        action: 'updateAutoScrapeSettings',
        settings: updatedSettings
      });
      
      if (response && response.success) {
        this.autoScrapeSettings = updatedSettings;
        
        // Show brief feedback
        this.showSlackStatus('Settings updated!', 'success');
        setTimeout(() => {
          this.elements.slackStatus.classList.add('hidden');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating auto-scrape settings:', error);
      this.showSlackStatus('Error saving settings', 'error');
    }
  }

  showSlackStatus(message, type) {
    this.elements.slackStatus.textContent = message;
    this.elements.slackStatus.className = `slack-status ${type}`;
    this.elements.slackStatus.classList.remove('hidden');
  }

  // Utility method to check if we're on the right page
  async checkUpworkPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab.url && tab.url.includes('upwork.com');
    } catch (error) {
      return false;
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// Handle extension icon click analytics (optional)
chrome.action?.onClicked?.addListener(() => {
  console.log('Extension icon clicked');
});