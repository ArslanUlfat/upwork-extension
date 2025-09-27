/**
 * Upwork Extension v3.0.0 - AI Master JavaScript
 * Custom implementation without external dependencies
 */

class UpworkExtensionAI {
  constructor() {
    this.currentTheme = 'light';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSettings();
    this.detectSystemTheme();
  }

  setupEventListeners() {
    // Theme toggle
    const darkModeToggle = document.getElementById('dark-mode');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', () => this.toggleTheme());
    }

    // Form submissions
    const findJobsBtn = document.querySelector('.btn-primary');
    if (findJobsBtn) {
      findJobsBtn.addEventListener('click', () => this.findJobs());
    }

    // Auto-apply button
    const autoApplyBtn = document.querySelector('.btn-blue');
    if (autoApplyBtn) {
      autoApplyBtn.addEventListener('click', () => this.showAutoApplyDialog());
    }

    // Generate proposal buttons
    const proposalBtns = document.querySelectorAll('.btn-primary');
    proposalBtns.forEach(btn => {
      if (btn.textContent.includes('Generate Proposal')) {
        btn.addEventListener('click', (e) => this.generateProposal(e));
      }
    });

    // Bookmark buttons
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    bookmarkBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.toggleBookmark(e));
    });

    // Save search button
    const saveSearchBtn = document.querySelector('.link-button');
    if (saveSearchBtn) {
      saveSearchBtn.addEventListener('click', () => this.saveSearch());
    }

    // Settings toggles
    this.setupSettingsToggles();

    // Navigation
    this.setupNavigation();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  setupSettingsToggles() {
    const toggles = document.querySelectorAll('.toggle-checkbox');
    toggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => this.handleSettingChange(e));
    });
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleNavigation(item);
      });
    });
  }

  handleNavigation(item) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    // Add active class to clicked item
    item.classList.add('active');

    // Handle navigation logic based on the nav item
    const navText = item.querySelector('.nav-text').textContent;
    
    switch (navText) {
      case 'Scraper':
        this.showScraperView();
        break;
      case 'Proposals':
        this.showProposalsView();
        break;
      case 'History':
        this.showHistoryView();
        break;
    }
  }

  showScraperView() {
    // Hide all screens and show main content
    this.hideAllScreens();
    console.log('Showing scraper view');
  }

  showProposalsView() {
    console.log('Showing proposals view');
    this.showNotification('Proposals feature coming soon!', 'info');
  }

  showHistoryView() {
    console.log('Showing history view');
    this.showNotification('History feature coming soon!', 'info');
  }

  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.currentTheme = 'dark';
      document.body.setAttribute('data-theme', 'dark');
      const darkModeToggle = document.getElementById('dark-mode');
      if (darkModeToggle) {
        darkModeToggle.checked = true;
      }
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme-preference')) {
          this.currentTheme = e.matches ? 'dark' : 'light';
          document.body.setAttribute('data-theme', this.currentTheme);
          const darkModeToggle = document.getElementById('dark-mode');
          if (darkModeToggle) {
            darkModeToggle.checked = e.matches;
          }
        }
      });
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('theme-preference', this.currentTheme);
    
    this.showNotification(`Switched to ${this.currentTheme} mode`, 'success');
  }

  loadSettings() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme) {
      this.currentTheme = savedTheme;
      document.body.setAttribute('data-theme', savedTheme);
      const darkModeToggle = document.getElementById('dark-mode');
      if (darkModeToggle) {
        darkModeToggle.checked = savedTheme === 'dark';
      }
    }

    // Load other settings
    const settings = this.getSettings();
    Object.keys(settings).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = settings[key];
        } else {
          element.value = settings[key];
        }
      }
    });
  }

  getSettings() {
    const defaultSettings = {
      'desktop-notifications': true,
      'sound-alerts': false,
      'notification-sound': 'Default'
    };

    const savedSettings = localStorage.getItem('extension-settings');
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  }

  saveSettings(settings) {
    localStorage.setItem('extension-settings', JSON.stringify(settings));
  }

  handleSettingChange(event) {
    const { id, type, checked, value } = event.target;
    const settings = this.getSettings();
    
    settings[id] = type === 'checkbox' ? checked : value;
    this.saveSettings(settings);
    
    this.showNotification('Settings saved', 'success');
  }

  async findJobs() {
    const keywords = document.getElementById('keywords').value;
    const blacklist = document.getElementById('blacklist').value;

    if (!keywords.trim()) {
      this.showNotification('Please enter keywords to search for jobs', 'error');
      return;
    }

    this.showNotification('Searching for jobs...', 'info');
    
    try {
      // Simulate API call
      await this.simulateJobSearch(keywords, blacklist);
      this.showNotification('Found 3 new jobs matching your criteria!', 'success');
      this.updateJobResults();
    } catch (error) {
      this.showNotification('Error searching for jobs. Please try again.', 'error');
      console.error('Job search error:', error);
    }
  }

  async simulateJobSearch(keywords, blacklist) {
    // Simulate network delay
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  updateJobResults() {
    // Update the new jobs indicator
    const indicator = document.querySelector('.new-jobs-indicator span:last-child');
    if (indicator) {
      const currentCount = parseInt(indicator.textContent.match(/\d+/)[0]);
      indicator.textContent = `${currentCount + 1} New Jobs`;
    }

    // Update nav badge
    const navBadge = document.querySelector('.nav-badge');
    if (navBadge) {
      const currentCount = parseInt(navBadge.textContent);
      navBadge.textContent = currentCount + 1;
    }
  }

  async generateProposal(event) {
    const jobCard = event.target.closest('.job-card');
    const jobTitle = jobCard ? jobCard.querySelector('.job-title').textContent : 'Unknown Job';
    
    this.showNotification('Generating AI proposal...', 'info');
    
    try {
      // Simulate AI proposal generation
      await this.simulateProposalGeneration();
      this.showNotification(`Proposal generated for "${jobTitle}"`, 'success');
      
      // Here you would typically open a proposal editor or send to proposals view
      this.showProposalModal(jobTitle);
    } catch (error) {
      this.showNotification('Error generating proposal. Please try again.', 'error');
      console.error('Proposal generation error:', error);
    }
  }

  async simulateProposalGeneration() {
    return new Promise(resolve => setTimeout(resolve, 3000));
  }

  showProposalModal(jobTitle) {
    // Create and show a modal with the generated proposal
    const modal = document.createElement('div');
    modal.className = 'dialog-overlay';
    modal.innerHTML = `
      <div class="dialog-content" style="max-width: 600px;">
        <div class="dialog-header">
          <span class="material-symbols-outlined dialog-icon">auto_awesome</span>
          <h2 class="dialog-title">AI Generated Proposal</h2>
        </div>
        <div style="margin-bottom: 1rem;">
          <h3 style="margin-bottom: 0.5rem; font-weight: 600;">For: ${jobTitle}</h3>
          <textarea 
            style="width: 100%; height: 200px; padding: 0.75rem; border: 1px solid var(--current-border); border-radius: 0.5rem; resize: vertical; font-family: inherit;"
            placeholder="AI-generated proposal will appear here..."
          >Dear Client,

I am excited to apply for the ${jobTitle} position. With my extensive experience in modern web development and a proven track record of delivering high-quality solutions, I am confident I can contribute significantly to your project.

Key qualifications:
• 5+ years of experience with React and TypeScript
• Strong understanding of modern frontend architecture
• Experience with performance optimization and scalability
• Excellent communication and project management skills

I would love to discuss how I can help bring your vision to life. I'm available for a quick call to discuss the project requirements in detail.

Best regards,
[Your Name]</textarea>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-secondary btn-full" onclick="this.closest('.dialog-overlay').remove()">
            Edit Proposal
          </button>
          <button class="btn btn-primary btn-full" onclick="this.closest('.dialog-overlay').remove()">
            Send Proposal
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 30000);
  }

  toggleBookmark(event) {
    const icon = event.target.closest('.bookmark-btn').querySelector('.material-symbols-outlined');
    const isBookmarked = icon.textContent === 'bookmark';
    
    icon.textContent = isBookmarked ? 'bookmark_border' : 'bookmark';
    
    const action = isBookmarked ? 'removed from' : 'added to';
    this.showNotification(`Job ${action} bookmarks`, 'success');
  }

  saveSearch() {
    const keywords = document.getElementById('keywords').value;
    
    if (!keywords.trim()) {
      this.showNotification('Please enter keywords to save search', 'error');
      return;
    }

    // Save to localStorage
    const savedSearches = JSON.parse(localStorage.getItem('saved-searches') || '[]');
    const newSearch = {
      id: Date.now(),
      keywords: keywords.trim(),
      notifications: true,
      created: new Date().toISOString()
    };
    
    savedSearches.push(newSearch);
    localStorage.setItem('saved-searches', JSON.stringify(savedSearches));
    
    this.showNotification(`Search "${keywords}" saved successfully`, 'success');
  }

  showAutoApplyDialog() {
    const dialog = document.getElementById('confirmation-dialog');
    if (dialog) {
      dialog.classList.remove('hidden');
    }
  }

  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + K for search focus
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const keywordsInput = document.getElementById('keywords');
      if (keywordsInput) {
        keywordsInput.focus();
      }
    }

    // Escape to close modals/screens
    if (event.key === 'Escape') {
      this.hideAllScreens();
      this.hideAllDialogs();
    }

    // Ctrl/Cmd + Enter to find jobs
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.id === 'keywords') {
        this.findJobs();
      }
    }
  }

  hideAllScreens() {
    const screens = document.querySelectorAll('.screen-overlay');
    screens.forEach(screen => screen.classList.add('hidden'));
  }

  hideAllDialogs() {
    const dialogs = document.querySelectorAll('.dialog-overlay');
    dialogs.forEach(dialog => dialog.classList.add('hidden'));
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'var(--primary-color)' : type === 'error' ? 'var(--red-500)' : 'var(--blue-500)'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Global functions for HTML onclick handlers
function showScreen(screenId) {
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
  }
}

function hideScreen(screenId) {
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('hidden');
  }
}

function showDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog) {
    dialog.classList.remove('hidden');
  }
}

function hideDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog) {
    dialog.classList.add('hidden');
  }
}

function toggleTheme() {
  if (window.upworkExtension) {
    window.upworkExtension.toggleTheme();
  }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.upworkExtension = new UpworkExtensionAI();
    console.log('Upwork Extension v3.0.0 - AI Master initialized successfully');
    
    // Add visual indicator that JS is working
    const header = document.querySelector('.header-title');
    if (header) {
      header.style.color = '#38e07b';
      setTimeout(() => {
        header.style.color = '';
      }, 1000);
    }
  } catch (error) {
    console.error('Failed to initialize Upwork Extension:', error);
    
    // Show error in UI
    const body = document.body;
    if (body) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        background: #ef4444;
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 9999;
      `;
      errorDiv.textContent = 'Extension initialization failed. Check console for details.';
      body.appendChild(errorDiv);
    }
  }
});

// Handle extension-specific events
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'newJobsFound') {
      if (window.upworkExtension) {
        window.upworkExtension.updateJobResults();
        window.upworkExtension.showNotification(`${request.count} new jobs found!`, 'success');
      }
    }
    
    if (request.action === 'autoApplyComplete') {
      if (window.upworkExtension) {
        window.upworkExtension.showNotification('Auto-apply completed successfully!', 'success');
      }
    }
    
    sendResponse({ status: 'received' });
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UpworkExtensionAI;
}
