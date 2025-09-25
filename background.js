// Background service worker for Upwork Rails Job Scraper
class BackgroundService {
  constructor() {
    this.slackWebhookUrl = stored.slack_webhook_url;
    this.jobHistory = new Set(); // Track seen job URLs
    this.isAutoScraping = false;
    this.scrapeInterval = null;
    
    this.initializeExtension();
    this.setupEventListeners();
    this.initializeAutoScraper();
  }

  initializeExtension() {
    console.log('Upwork Rails Job Scraper background service initialized');
    
    // Set up extension icon and badge
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
    
    // Initialize storage if needed
    this.initializeStorage();
  }

  setupEventListeners() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.onInstall();
      } else if (details.reason === 'update') {
        this.onUpdate();
      }
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open
    });

    // Handle tab updates to show/hide page action
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        this.updateBadgeForTab(tab);
      }
    });

    // Handle tab activation
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      this.updateBadgeForTab(tab);
    });
  }

  async onInstall() {
    console.log('Extension installed');
    
    // Open welcome tab
    await chrome.tabs.create({
      url: 'https://www.upwork.com/nx/search/jobs/?q=rails'
    });

    // Set initial storage values
    await chrome.storage.local.set({
      'extension_installed': true,
      'install_date': new Date().toISOString(),
      'scrape_count': 0
    });
  }

  async onUpdate() {
    console.log('Extension updated');
    
    // Clear old cached data on update
    await chrome.storage.local.remove(['old_cached_jobs']);
  }

  async initializeStorage() {
    const result = await chrome.storage.local.get(['extension_installed', 'auto_scrape_settings', 'job_history']);
    
    if (!result.extension_installed) {
      await chrome.storage.local.set({
        'upwork_rails_jobs': [],
        'scrape_count': 0,
        'job_history': [],
        'auto_scrape_settings': {
          'enabled': false,
          'interval': 30, // minutes
          'search_queries': ['rails', 'ruby on rails'],
          'send_to_slack': true,
          'max_jobs_per_notification': 5,
          'last_scrape': null
        },
        'settings': {
          'auto_scrape': false,
          'notification_enabled': true,
          'max_jobs_to_store': 100
        }
      });
    }
    
    // Load job history into memory
    if (result.job_history) {
      this.jobHistory = new Set(result.job_history);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'incrementScrapeCount':
          await this.incrementScrapeCount();
          sendResponse({ success: true });
          break;

        case 'getStoredJobs':
          const jobs = await this.getStoredJobs();
          sendResponse({ success: true, jobs });
          break;

        case 'updateBadge':
          this.updateBadge(message.count);
          sendResponse({ success: true });
          break;

        case 'openUpworkSearch':
          await this.openUpworkSearch(message.query);
          sendResponse({ success: true });
          break;

        case 'toggleAutoScrape':
          const currentSettings = await this.getAutoScrapeSettings();
          const newSettings = { ...currentSettings, enabled: !currentSettings.enabled };
          await this.updateAutoScrapeSettings(newSettings);
          sendResponse({ success: true, enabled: newSettings.enabled });
          break;

        case 'getAutoScrapeSettings':
          const settings = await this.getAutoScrapeSettings();
          sendResponse({ success: true, settings });
          break;

        case 'updateAutoScrapeSettings':
          await this.updateAutoScrapeSettings(message.settings);
          sendResponse({ success: true });
          break;

        default:
          console.log('Unknown message action:', message.action);
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async updateBadgeForTab(tab) {
    if (!tab.url) return;

    if (tab.url.includes('upwork.com/nx/search/jobs')) {
      // We're on a job search page - show active badge
      chrome.action.setBadgeText({ 
        text: '●', 
        tabId: tab.id 
      });
      chrome.action.setBadgeBackgroundColor({ 
        color: '#27ae60',
        tabId: tab.id 
      });
      chrome.action.setTitle({
        title: 'Click to scrape Rails jobs from this page',
        tabId: tab.id
      });
    } else if (tab.url.includes('upwork.com')) {
      // We're on Upwork but not job search - show warning badge
      chrome.action.setBadgeText({ 
        text: '!', 
        tabId: tab.id 
      });
      chrome.action.setBadgeBackgroundColor({ 
        color: '#f39c12',
        tabId: tab.id 
      });
      chrome.action.setTitle({
        title: 'Navigate to job search to scrape Rails jobs',
        tabId: tab.id
      });
    } else {
      // Not on Upwork - clear badge
      chrome.action.setBadgeText({ 
        text: '', 
        tabId: tab.id 
      });
      chrome.action.setTitle({
        title: 'Upwork Rails Job Scraper - Go to Upwork.com',
        tabId: tab.id
      });
    }
  }

  async incrementScrapeCount() {
    const result = await chrome.storage.local.get(['scrape_count']);
    const newCount = (result.scrape_count || 0) + 1;
    await chrome.storage.local.set({ scrape_count: newCount });
    return newCount;
  }

  async getStoredJobs() {
    const result = await chrome.storage.local.get(['upwork_rails_jobs']);
    return result.upwork_rails_jobs || [];
  }

  async initializeAutoScraper() {
    const settings = await this.getAutoScrapeSettings();
    
    if (settings.enabled) {
      console.log('Auto-scraper enabled. Starting periodic scraping...');
      this.startAutoScraping(settings.interval);
    }
  }

  async getAutoScrapeSettings() {
    const result = await chrome.storage.local.get(['auto_scrape_settings']);
    return result.auto_scrape_settings || {
      enabled: false,
      interval: 30,
      search_queries: ['rails'],
      send_to_slack: true,
      max_jobs_per_notification: 5
    };
  }

  async updateAutoScrapeSettings(newSettings) {
    await chrome.storage.local.set({ auto_scrape_settings: newSettings });
    
    // Restart scraping with new settings
    this.stopAutoScraping();
    if (newSettings.enabled) {
      this.startAutoScraping(newSettings.interval);
    }
  }

  startAutoScraping(intervalMinutes) {
    if (this.scrapeInterval) {
      clearInterval(this.scrapeInterval);
    }
    
    console.log(`Starting auto-scraping every ${intervalMinutes} minutes`);
    this.isAutoScraping = true;
    
    // Initial scrape after 2 minutes
    setTimeout(() => this.performAutoScrape(), 2 * 60 * 1000);
    
    // Set up recurring scrapes
    this.scrapeInterval = setInterval(() => {
      this.performAutoScrape();
    }, intervalMinutes * 60 * 1000);
    
    // Update badge to show auto-scraping is active
    chrome.action.setBadgeText({ text: 'AUTO' });
    chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
  }

  stopAutoScraping() {
    if (this.scrapeInterval) {
      clearInterval(this.scrapeInterval);
      this.scrapeInterval = null;
    }
    
    this.isAutoScraping = false;
    console.log('Auto-scraping stopped');
    
    // Clear badge
    chrome.action.setBadgeText({ text: '' });
  }

  async performAutoScrape() {
    console.log('Performing auto-scrape...');
    
    try {
      const settings = await this.getAutoScrapeSettings();
      const newJobs = [];
      
      // Create or find Upwork tab
      const upworkTab = await this.ensureUpworkTab();
      if (!upworkTab) {
        console.error('Could not create/find Upwork tab for auto-scraping');
        return;
      }

      // Scrape for each search query
      for (const query of settings.search_queries) {
        console.log(`Auto-scraping for query: ${query}`);
        
        try {
          // Navigate to search page
          await chrome.tabs.update(upworkTab.id, {
            url: `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(query)}`
          });
          
          // Wait for page to load
          await this.waitForPageLoad(upworkTab.id);
          
          // Inject content script and scrape
          await chrome.scripting.executeScript({
            target: { tabId: upworkTab.id },
            files: ['content.js']
          });
          
          // Wait a bit more for content script to initialize
          await this.sleep(2000);
          
          const response = await chrome.tabs.sendMessage(upworkTab.id, {
            action: 'scrapeJobs',
            searchQuery: query
          });

          if (response && response.success && response.jobs) {
            const uniqueNewJobs = this.filterUniqueJobs(response.jobs);
            newJobs.push(...uniqueNewJobs);
            console.log(`Found ${uniqueNewJobs.length} new unique jobs for query: ${query}`);
          }
          
        } catch (error) {
          console.error(`Error scraping for query ${query}:`, error);
        }
        
        // Wait between queries to avoid rate limiting
        await this.sleep(3000);
      }

      // Process new jobs
      if (newJobs.length > 0) {
        await this.processNewJobs(newJobs, settings);
      } else {
        console.log('No new jobs found in auto-scrape');
      }
      
      // Update last scrape time
      settings.last_scrape = new Date().toISOString();
      await this.updateAutoScrapeSettings(settings);
      
    } catch (error) {
      console.error('Auto-scrape failed:', error);
      
      // Show error badge
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
      
      setTimeout(() => {
        if (this.isAutoScraping) {
          chrome.action.setBadgeText({ text: 'AUTO' });
          chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
        }
      }, 5000);
    }
  }

  async ensureUpworkTab() {
    try {
      // First, try to find existing Upwork tab
      const tabs = await chrome.tabs.query({ url: '*://www.upwork.com/*' });
      
      if (tabs.length > 0) {
        console.log('Found existing Upwork tab');
        return tabs[0];
      }
      
      // Create new tab in the background
      console.log('Creating new Upwork tab for auto-scraping');
      const tab = await chrome.tabs.create({
        url: 'https://www.upwork.com/nx/search/jobs',
        active: false // Don't switch to the tab
      });
      
      // Wait for tab to load
      await this.waitForPageLoad(tab.id);
      return tab;
      
    } catch (error) {
      console.error('Error ensuring Upwork tab:', error);
      return null;
    }
  }

  async waitForPageLoad(tabId, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkStatus = async () => {
        try {
          const tab = await chrome.tabs.get(tabId);
          
          if (tab.status === 'complete') {
            resolve();
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Page load timeout'));
          } else {
            setTimeout(checkStatus, 1000);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      checkStatus();
    });
  }

  filterUniqueJobs(jobs) {
    const uniqueJobs = jobs.filter(job => {
      const jobKey = this.generateJobKey(job);
      
      if (this.jobHistory.has(jobKey)) {
        return false; // Already seen this job
      }
      
      // Add to history
      this.jobHistory.add(jobKey);
      return true;
    });
    
    // Save updated history to storage (keep last 1000 entries)
    this.saveJobHistory();
    
    return uniqueJobs;
  }

  generateJobKey(job) {
    // Create a unique key based on job URL and title
    // This helps identify duplicate jobs even if scraped at different times
    return `${job.url || ''}|${(job.title || '').substring(0, 50)}`;
  }

  async saveJobHistory() {
    // Convert Set to Array and keep only recent entries to avoid storage bloat
    const historyArray = Array.from(this.jobHistory).slice(-1000);
    this.jobHistory = new Set(historyArray);
    
    try {
      await chrome.storage.local.set({ job_history: historyArray });
    } catch (error) {
      console.error('Error saving job history:', error);
    }
  }

  async processNewJobs(newJobs, settings) {
    console.log(`Processing ${newJobs.length} new jobs`);
    
    // Sort by most recent first
    newJobs.sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt));
    
    // Store new jobs
    await this.storeNewJobs(newJobs);
    
    // Send to Slack if enabled
    if (settings.send_to_slack) {
      const jobsToSend = newJobs.slice(0, settings.max_jobs_per_notification || 5);
      await this.sendNewJobsToSlack(jobsToSend);
    }
    
    // Update badge with count
    chrome.action.setBadgeText({ text: newJobs.length.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#f39c12' });
    
    // Reset badge after 10 seconds
    setTimeout(() => {
      if (this.isAutoScraping) {
        chrome.action.setBadgeText({ text: 'AUTO' });
        chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
      }
    }, 10000);
  }

  async storeNewJobs(newJobs) {
    try {
      const result = await chrome.storage.local.get(['upwork_rails_jobs']);
      const existingJobs = result.upwork_rails_jobs || [];
      
      // Add new jobs to the beginning
      const updatedJobs = [...newJobs, ...existingJobs];
      
      // Keep only the most recent 200 jobs to prevent storage bloat
      const trimmedJobs = updatedJobs.slice(0, 200);
      
      await chrome.storage.local.set({ upwork_rails_jobs: trimmedJobs });
      console.log(`Stored ${newJobs.length} new jobs. Total stored: ${trimmedJobs.length}`);
      
    } catch (error) {
      console.error('Error storing new jobs:', error);
    }
  }

  async sendNewJobsToSlack(jobs) {
    try {
      const timestamp = new Date().toLocaleString();
      
      const message = {
        username: "Rails Job Bot 🤖",
        icon_emoji: ":rocket:",
        text: `🚨 *New Rails Jobs Alert!* - ${timestamp}\n*Found ${jobs.length} new jobs*`,
        attachments: jobs.map((job, index) => ({
          color: "#36a64f",
          title: `🆕 ${job.title || 'New Job'}`,
          title_link: job.url,
          text: this.truncateText(job.description || 'No description', 150),
          fields: [
            {
              title: "💰 Budget",
              value: job.budget || 'Not specified',
              short: true
            },
            {
              title: "⏰ Posted",
              value: job.postedTime || 'Just now',
              short: true
            }
          ],
          footer: job.skills && job.skills.length > 0 ? `🏷️ ${job.skills.slice(0, 3).join(', ')}` : 'No skills listed',
          ts: Math.floor(new Date().getTime() / 1000)
        }))
      };
      // Resolve Slack Webhook URL from storage, fallback to constructor default
      const stored = await chrome.storage.local.get(['slack_webhook_url']);
      const webhookUrl = stored.slack_webhook_url || this.slackWebhookUrl;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        console.log(`Successfully sent ${jobs.length} new jobs to Slack`);
      } else {
        throw new Error(`Slack API error: ${response.status}`);
      }

    } catch (error) {
      console.error('Error sending new jobs to Slack:', error);
    }
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateBadge(count) {
    if (count > 0) {
      chrome.action.setBadgeText({ text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }

  async openUpworkSearch(query = 'rails') {
    const searchUrl = `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(query)}`;
    await chrome.tabs.create({ url: searchUrl });
  }

  // Cleanup old jobs to prevent storage bloat
  async cleanupOldJobs() {
    try {
      const result = await chrome.storage.local.get(['upwork_rails_jobs', 'settings']);
      const jobs = result.upwork_rails_jobs || [];
      const settings = result.settings || { max_jobs_to_store: 100 };

      if (jobs.length > settings.max_jobs_to_store) {
        // Keep only the most recent jobs
        const sortedJobs = jobs.sort((a, b) => 
          new Date(b.scrapedAt) - new Date(a.scrapedAt)
        );
        const trimmedJobs = sortedJobs.slice(0, settings.max_jobs_to_store);
        
        await chrome.storage.local.set({
          upwork_rails_jobs: trimmedJobs
        });

        console.log(`Cleaned up old jobs. Kept ${trimmedJobs.length} most recent jobs.`);
      }
    } catch (error) {
      console.error('Error cleaning up old jobs:', error);
    }
  }

  // Periodic cleanup (run every hour)
  scheduleCleanup() {
    setInterval(() => {
      this.cleanupOldJobs();
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Initialize background service
const backgroundService = new BackgroundService();

// Schedule periodic cleanup
backgroundService.scheduleCleanup();

// Handle direct extension icon clicks (when popup is disabled)
chrome.action.onClicked?.addListener(async (tab) => {
  // This will only fire if no popup is set
  if (tab.url && tab.url.includes('upwork.com/nx/search/jobs')) {
    // Inject and execute scraping directly
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (error) {
      console.error('Error injecting script:', error);
    }
  } else {
    // Open Upwork search page
    await backgroundService.openUpworkSearch();
  }
});

console.log('Upwork Rails Job Scraper background service loaded');