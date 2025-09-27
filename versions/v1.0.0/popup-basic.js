/**
 * Basic Upwork Job Scraper - v1.0.0 Controller
 * Simple functionality for basic job scraping
 */

class BasicUpworkScraper {
  constructor() {
    this.jobs = [];
    this.settings = {
      maxJobs: 50,
      autoInterval: 15,
      keywords: [],
      excludeKeywords: [],
      browserNotifications: true,
      slackNotifications: false,
      slackWebhook: ''
    };
    this.isAutoScraping = false;
    this.autoScrapeInterval = null;
    
    // Initialize version management
    this.versionDisplay = new VersionDisplay();
    
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
        compact: true 
      });
    }
    
    // Add version-specific classes to body
    document.body.className += ' ' + this.versionDisplay.getVersionClasses();
    
    // Show upgrade section if not on latest version
    const upgradeInfo = this.versionDisplay.versionManager.checkForUpgrade();
    if (upgradeInfo) {
      document.getElementById('upgradeSection').style.display = 'block';
    }
    
    // Update UI with current data
    this.updateJobCount();
    this.updateLastScanTime();
    this.updateAutoScrapeButton();
  }

  bindEvents() {
    // Scrape button
    document.getElementById('scrapeBtn').addEventListener('click', () => {
      this.scrapeJobs();
    });
    
    // Auto scrape toggle
    document.getElementById('autoScrapeBtn').addEventListener('click', () => {
      this.toggleAutoScrape();
    });
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportJobs();
    });
    
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', () => {
      this.clearJobs();
    });
    
    // Settings modal
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.showSettings();
    });
    
    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
      this.hideSettings();
    });
    
    document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
      this.hideSettings();
    });
    
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      this.saveSettings();
    });
    
    // Slack notifications toggle
    document.getElementById('slackNotifications').addEventListener('change', (e) => {
      const webhookGroup = document.getElementById('slackWebhookGroup');
      webhookGroup.style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Upgrade button
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        window.open('https://github.com/yourusername/magic-upwork-assistant/releases', '_blank');
      });
    }
    
    // Modal backdrop click
    document.getElementById('settingsModal').addEventListener('click', (e) => {
      if (e.target.id === 'settingsModal') {
        this.hideSettings();
      }
    });
  }

  async loadStoredData() {
    try {
      const stored = await chrome.storage.local.get(['jobs', 'settings', 'lastScan']);
      
      if (stored.jobs) {
        this.jobs = stored.jobs;
        this.renderJobs();
      }
      
      if (stored.settings) {
        this.settings = { ...this.settings, ...stored.settings };
      }
      
      if (stored.lastScan) {
        this.updateLastScanTime(stored.lastScan);
      }
      
      this.updateJobCount();
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  }

  async scrapeJobs() {
    const scrapeBtn = document.getElementById('scrapeBtn');
    const originalText = scrapeBtn.innerHTML;
    
    try {
      // Update button to show loading
      scrapeBtn.innerHTML = '<span class="loading">Scraping...</span>';
      scrapeBtn.disabled = true;
      
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('upwork.com')) {
        this.showNotification('Please navigate to Upwork job search page first', 'error');
        return;
      }
      
      // Inject content script and scrape
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.scrapeJobsFromPage,
        args: [this.settings.maxJobs]
      });
      
      if (results && results[0] && results[0].result) {
        const newJobs = results[0].result;
        
        // Filter jobs based on keywords
        const filteredJobs = this.filterJobs(newJobs);
        
        // Add to existing jobs (avoid duplicates)
        const existingUrls = new Set(this.jobs.map(job => job.url));
        const uniqueNewJobs = filteredJobs.filter(job => !existingUrls.has(job.url));
        
        this.jobs = [...uniqueNewJobs, ...this.jobs].slice(0, this.settings.maxJobs);
        
        // Save to storage
        await chrome.storage.local.set({
          jobs: this.jobs,
          lastScan: new Date().toISOString()
        });
        
        // Update UI
        this.renderJobs();
        this.updateJobCount();
        this.updateLastScanTime();
        
        // Show notifications
        if (uniqueNewJobs.length > 0) {
          this.showNotification(`Found ${uniqueNewJobs.length} new jobs!`, 'success');
          
          if (this.settings.browserNotifications) {
            this.sendBrowserNotification(uniqueNewJobs.length);
          }
          
          if (this.settings.slackNotifications && this.settings.slackWebhook) {
            this.sendSlackNotification(uniqueNewJobs);
          }
        } else {
          this.showNotification('No new jobs found', 'info');
        }
      }
      
    } catch (error) {
      console.error('Scraping error:', error);
      this.showNotification('Error scraping jobs. Please try again.', 'error');
    } finally {
      // Reset button
      scrapeBtn.innerHTML = originalText;
      scrapeBtn.disabled = false;
    }
  }

  // Function to inject into page for scraping
  scrapeJobsFromPage(maxJobs) {
    const jobs = [];
    const jobElements = document.querySelectorAll('[data-test="JobTile"]');
    
    for (let i = 0; i < Math.min(jobElements.length, maxJobs); i++) {
      const element = jobElements[i];
      
      try {
        const titleElement = element.querySelector('[data-test="JobTileTitle"] a');
        const budgetElement = element.querySelector('[data-test="JobTileBudget"]');
        const descriptionElement = element.querySelector('[data-test="JobTileDescription"]');
        const skillsElements = element.querySelectorAll('[data-test="JobTileSkills"] span');
        const timeElement = element.querySelector('[data-test="JobTileTimePosted"]');
        
        if (titleElement) {
          const job = {
            title: titleElement.textContent.trim(),
            url: titleElement.href,
            budget: budgetElement ? budgetElement.textContent.trim() : 'Not specified',
            description: descriptionElement ? descriptionElement.textContent.trim().substring(0, 200) + '...' : '',
            skills: Array.from(skillsElements).map(el => el.textContent.trim()),
            timePosted: timeElement ? timeElement.textContent.trim() : 'Unknown',
            scrapedAt: new Date().toISOString()
          };
          
          jobs.push(job);
        }
      } catch (error) {
        console.error('Error parsing job element:', error);
      }
    }
    
    return jobs;
  }

  filterJobs(jobs) {
    return jobs.filter(job => {
      const text = `${job.title} ${job.description} ${job.skills.join(' ')}`.toLowerCase();
      
      // Check include keywords
      if (this.settings.keywords.length > 0) {
        const hasKeyword = this.settings.keywords.some(keyword => 
          text.includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }
      
      // Check exclude keywords
      if (this.settings.excludeKeywords.length > 0) {
        const hasExcludeKeyword = this.settings.excludeKeywords.some(keyword => 
          text.includes(keyword.toLowerCase())
        );
        if (hasExcludeKeyword) return false;
      }
      
      return true;
    });
  }

  renderJobs() {
    const container = document.getElementById('jobsContainer');
    
    if (this.jobs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">No jobs scraped yet</div>
          <div class="empty-subtext">Click "Scrape Jobs" to get started</div>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.jobs.map(job => `
      <div class="job-item">
        <div class="job-title">
          <a href="${job.url}" target="_blank">${job.title}</a>
        </div>
        <div class="job-meta">
          <span class="job-budget">${job.budget}</span>
          <span class="job-time">${job.timePosted}</span>
        </div>
      </div>
    `).join('');
  }

  updateJobCount() {
    document.getElementById('jobCount').textContent = this.jobs.length;
  }

  updateLastScanTime(timestamp = null) {
    const lastScanElement = document.getElementById('lastScan');
    if (timestamp) {
      const date = new Date(timestamp);
      lastScanElement.textContent = date.toLocaleTimeString();
    } else {
      lastScanElement.textContent = 'Never';
    }
  }

  toggleAutoScrape() {
    this.isAutoScraping = !this.isAutoScraping;
    
    if (this.isAutoScraping) {
      this.startAutoScrape();
    } else {
      this.stopAutoScrape();
    }
    
    this.updateAutoScrapeButton();
  }

  startAutoScrape() {
    const intervalMs = this.settings.autoInterval * 60 * 1000;
    this.autoScrapeInterval = setInterval(() => {
      this.scrapeJobs();
    }, intervalMs);
  }

  stopAutoScrape() {
    if (this.autoScrapeInterval) {
      clearInterval(this.autoScrapeInterval);
      this.autoScrapeInterval = null;
    }
  }

  updateAutoScrapeButton() {
    const btn = document.getElementById('autoScrapeBtn');
    const status = this.isAutoScraping ? 'ON' : 'OFF';
    btn.innerHTML = `
      <span class="btn-icon">⏰</span>
      <span class="btn-text">Auto Scrape: ${status}</span>
    `;
  }

  exportJobs() {
    if (this.jobs.length === 0) {
      this.showNotification('No jobs to export', 'warning');
      return;
    }
    
    const dataStr = JSON.stringify(this.jobs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `upwork-jobs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    this.showNotification('Jobs exported successfully!', 'success');
  }

  async clearJobs() {
    if (confirm('Are you sure you want to clear all jobs?')) {
      this.jobs = [];
      await chrome.storage.local.set({ jobs: [] });
      this.renderJobs();
      this.updateJobCount();
      this.showNotification('Jobs cleared', 'info');
    }
  }

  showSettings() {
    // Populate form with current settings
    document.getElementById('maxJobs').value = this.settings.maxJobs;
    document.getElementById('autoInterval').value = this.settings.autoInterval;
    document.getElementById('keywords').value = this.settings.keywords.join(', ');
    document.getElementById('excludeKeywords').value = this.settings.excludeKeywords.join(', ');
    document.getElementById('browserNotifications').checked = this.settings.browserNotifications;
    document.getElementById('slackNotifications').checked = this.settings.slackNotifications;
    document.getElementById('slackWebhook').value = this.settings.slackWebhook;
    
    // Show/hide slack webhook field
    const webhookGroup = document.getElementById('slackWebhookGroup');
    webhookGroup.style.display = this.settings.slackNotifications ? 'block' : 'none';
    
    document.getElementById('settingsModal').classList.add('show');
  }

  hideSettings() {
    document.getElementById('settingsModal').classList.remove('show');
  }

  async saveSettings() {
    try {
      // Get form values
      const newSettings = {
        maxJobs: parseInt(document.getElementById('maxJobs').value),
        autoInterval: parseInt(document.getElementById('autoInterval').value),
        keywords: document.getElementById('keywords').value
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0),
        excludeKeywords: document.getElementById('excludeKeywords').value
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0),
        browserNotifications: document.getElementById('browserNotifications').checked,
        slackNotifications: document.getElementById('slackNotifications').checked,
        slackWebhook: document.getElementById('slackWebhook').value.trim()
      };
      
      // Update settings
      this.settings = { ...this.settings, ...newSettings };
      
      // Save to storage
      await chrome.storage.local.set({ settings: this.settings });
      
      // Update auto scrape if running
      if (this.isAutoScraping) {
        this.stopAutoScrape();
        this.startAutoScrape();
      }
      
      this.hideSettings();
      this.showNotification('Settings saved!', 'success');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showNotification('Error saving settings', 'error');
    }
  }

  sendBrowserNotification(jobCount) {
    if (Notification.permission === 'granted') {
      new Notification('New Upwork Jobs Found!', {
        body: `Found ${jobCount} new job${jobCount > 1 ? 's' : ''} matching your criteria`,
        icon: 'icons/icon48.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.sendBrowserNotification(jobCount);
        }
      });
    }
  }

  async sendSlackNotification(jobs) {
    if (!this.settings.slackWebhook) return;
    
    try {
      const message = {
        text: `🔍 Found ${jobs.length} new Upwork job${jobs.length > 1 ? 's' : ''}!`,
        attachments: jobs.slice(0, 3).map(job => ({
          title: job.title,
          title_link: job.url,
          text: job.description,
          fields: [
            {
              title: 'Budget',
              value: job.budget,
              short: true
            },
            {
              title: 'Posted',
              value: job.timePosted,
              short: true
            }
          ],
          color: 'good'
        }))
      };
      
      await fetch(this.settings.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BasicUpworkScraper();
});
