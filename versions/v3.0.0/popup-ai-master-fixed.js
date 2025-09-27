/**
 * Upwork Extension v3.0.0 - AI Master (Fixed) JavaScript
 * CSP-compliant version with external JavaScript
 */

// Simple JavaScript for basic functionality
async function findJobs() {
  const keywords = document.getElementById('keywords').value;
  if (!keywords.trim()) {
    alert('Please enter keywords to search for jobs');
    return;
  }
  
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = 'Searching...';
  btn.disabled = true;

  // Clear previous results
  clearJobResults();
  
  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('upwork.com')) {
      alert('Please navigate to Upwork job search page first');
      btn.textContent = originalText;
      btn.disabled = false;
      return;
    }

    // Try to send message to content script
    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: 'scrapeJobs',
        searchQuery: keywords,
        debug: true // Enable debug mode
      });
    } catch (connectionError) {
      console.log('Content script not found, injecting manually...');
      
      // Inject content script manually
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['shared/content.js']
        });
        
        // Wait a moment for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try sending the message again
        response = await chrome.tabs.sendMessage(tab.id, {
          action: 'scrapeJobs',
          searchQuery: keywords,
          debug: true
        });
      } catch (injectionError) {
        throw new Error('Could not inject content script. Please refresh the Upwork page and try again.');
      }
    }

    if (response.success) {
      const jobCount = response.jobs.length;
      const totalFound = response.totalFound;
      
      if (jobCount > 0) {
        // Save jobs to localStorage
        saveJobsToStorage(response.jobs, keywords);
        
        // Auto-save the search
        autoSaveSearch(keywords);
        
        // Update the job results in the popup
        displayJobResults(response.jobs, keywords);
        
        // Update the new jobs indicator
        const indicator = document.querySelector('.new-jobs-indicator span:last-child');
        if (indicator) {
          indicator.textContent = `${jobCount} New Jobs`;
        }

        // Update nav badge
        const navBadge = document.querySelector('.nav-badge');
        if (navBadge) {
          navBadge.textContent = jobCount;
        }

        // Show success message
        showNotification(`Found ${jobCount} jobs matching "${keywords}"!`, 'success');
        console.log('Jobs found:', response.jobs);
      } else {
        alert(`No jobs found for "${keywords}".\n\nTotal jobs on page: ${totalFound}\n\nTry:\n- Different keywords\n- Broader search terms\n- Check console for debug info`);
      }
    } else {
      console.error('Scraping failed:', response.error);
      alert(`Error scraping jobs: ${response.error}\n\nCheck the browser console for more details.`);
    }
  } catch (error) {
    console.error('Error communicating with content script:', error);
    alert('Error: Could not communicate with the page. Make sure you\'re on an Upwork job search page and try refreshing.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

function generateProposal(btn) {
  const jobCard = btn.closest('.job-card');
  const jobTitle = jobCard.querySelector('.job-title').textContent;
  
  btn.textContent = 'Generating...';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = 'Generate Proposal';
    btn.disabled = false;
    alert(`AI proposal generated for "${jobTitle}"!\n\nThis would normally open a proposal editor with AI-generated content.`);
  }, 3000);
}

function toggleBookmark(btn) {
  const icon = btn.querySelector('.icon');
  if (icon.textContent === '🔖') {
    icon.textContent = '📌';
    alert('Job bookmarked!');
  } else {
    icon.textContent = '🔖';
    alert('Bookmark removed!');
  }
}

function showSettings() {
  const settingsMenu = `
🔧 Extension Settings & Debug

1. Theme Settings
2. Notification Preferences  
3. Debug Upwork Page Structure
4. Test Content Script Connection
5. View Extension Logs

Choose an option (1-5) or Cancel:
  `;
  
  const choice = prompt(settingsMenu);
  
  switch(choice) {
    case '1':
      toggleTheme();
      alert('Theme toggled! (Feature in development)');
      break;
    case '2':
      alert('Notification settings coming soon!');
      break;
    case '3':
      debugUpworkPage();
      break;
    case '4':
      testContentScriptConnection();
      break;
    case '5':
      alert('Check the browser console (F12) for extension logs.');
      break;
    default:
      // User cancelled or invalid choice
      break;
  }
}

// Test content script connection
async function testContentScriptConnection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('upwork.com')) {
      alert('❌ Not on Upwork\n\nPlease navigate to an Upwork page first.');
      return;
    }

    alert('🔄 Testing connection...\n\nThis may take a moment.');

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'ping'
      });
      
      alert('✅ Content Script Connected!\n\nThe extension can communicate with the Upwork page.');
    } catch (error) {
      console.log('Connection failed, trying manual injection...');
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['shared/content.js']
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'ping'
        });
        
        alert('✅ Content Script Injected & Connected!\n\nThe extension is now ready to scrape jobs.');
      } catch (injectionError) {
        alert('❌ Connection Failed\n\nCould not establish connection with the page.\n\nTry:\n1. Refresh the Upwork page\n2. Reload the extension\n3. Check if you\'re on a supported Upwork URL');
      }
    }
  } catch (error) {
    console.error('Connection test error:', error);
    alert('❌ Test Failed\n\nError: ' + error.message);
  }
}

function saveSearch() {
  const savedSearches = loadSavedSearches();
  
  if (savedSearches.length === 0) {
    alert('No saved searches yet.\n\nSearches are automatically saved when you find jobs!');
    return;
  }
  
  // Show saved searches
  const searchList = savedSearches.slice(0, 5).map((search, index) => 
    `${index + 1}. "${search.keywords}" (used ${search.useCount || 1} times)`
  ).join('\n');
  
  const message = `📚 Your Recent Searches:\n\n${searchList}\n\n💡 Searches are auto-saved when you find jobs!\n\nClick a search term above to copy it to the search box.`;
  
  const choice = prompt(message + '\n\nEnter 1-5 to use a search, or Cancel:');
  
  if (choice && choice >= '1' && choice <= '5') {
    const selectedSearch = savedSearches[parseInt(choice) - 1];
    if (selectedSearch) {
      const keywordsInput = document.getElementById('keywords');
      if (keywordsInput) {
        keywordsInput.value = selectedSearch.keywords;
        showNotification(`Loaded search: "${selectedSearch.keywords}"`, 'success');
      }
    }
  }
}

function showAutoApply() {
  alert('Auto-apply feature coming soon!');
}

function showJobDetails(jobTitle, jobUrl) {
  if (jobUrl && jobUrl !== '#') {
    const openJob = confirm(`Open "${jobTitle}" on Upwork?\n\nThis will open the job in a new tab.`);
    if (openJob) {
      chrome.tabs.create({ url: jobUrl });
    }
  } else {
    alert(`Job details for "${jobTitle}"\n\nDetailed job view coming soon!`);
  }
}

function showProposals() {
  alert('Proposals feature coming soon!');
  return false;
}

function showHistory() {
  alert('History feature coming soon!');
  return false;
}

// Debug function to analyze Upwork page structure
async function debugUpworkPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('upwork.com')) {
      alert('Please navigate to Upwork first');
      return;
    }

    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: 'debugPage'
      });
    } catch (connectionError) {
      console.log('Content script not found for debug, injecting manually...');
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['shared/content.js']
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        response = await chrome.tabs.sendMessage(tab.id, {
          action: 'debugPage'
        });
      } catch (injectionError) {
        throw new Error('Could not inject content script for debugging.');
      }
    }

    if (response.success) {
      alert('Debug information logged to browser console.\n\nOpen Developer Tools (F12) and check the Console tab for detailed page structure analysis.');
    } else {
      alert('Debug failed: ' + response.error);
    }
  } catch (error) {
    console.error('Debug error:', error);
    alert('Could not run debug. Make sure you\'re on an Upwork page and try refreshing the page.');
  }
}

// Clear job results
function clearJobResults() {
  const jobListContainer = document.querySelector('.job-list');
  if (jobListContainer) {
    jobListContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--current-subtle);">🔍 Searching for jobs...</div>';
  }

  // Reset section title
  const sectionTitle = document.querySelector('.section-header .section-title');
  if (sectionTitle) {
    sectionTitle.textContent = 'Job Results';
  }

  // Reset indicators
  const indicator = document.querySelector('.new-jobs-indicator span:last-child');
  if (indicator) {
    indicator.textContent = 'Searching...';
  }
}

// Display job results in the popup
function displayJobResults(jobs, searchQuery) {
  const jobListContainer = document.querySelector('.job-list');
  if (!jobListContainer) {
    console.error('Job list container not found');
    return;
  }

  // Clear existing jobs
  jobListContainer.innerHTML = '';

  // Add each job to the list
  jobs.forEach((job, index) => {
    const jobCard = createJobCard(job, index);
    jobListContainer.appendChild(jobCard);
  });

  // Update section title
  const sectionTitle = document.querySelector('.section-header .section-title');
  if (sectionTitle) {
    sectionTitle.textContent = `Job Results for "${searchQuery}"`;
  }
}

// Create a job card element
function createJobCard(job, index) {
  const jobCard = document.createElement('div');
  jobCard.className = `job-card ${index === 0 ? 'featured' : ''}`;
  
  // Truncate description if too long
  const description = job.description && job.description.length > 150 
    ? job.description.substring(0, 150) + '...'
    : job.description || 'No description available';

  // Create skills tags
  const skillsHtml = job.skills && job.skills.length > 0
    ? job.skills.slice(0, 3).map(skill => 
        `<span class="job-tag ${index === 0 ? '' : 'subtle'}">${skill}</span>`
      ).join('')
    : '<span class="job-tag subtle">No skills listed</span>';

  jobCard.innerHTML = `
    <div class="job-header">
      <h3 class="job-title" data-job="${job.title || 'Untitled Job'}" data-url="${job.url || '#'}">
        ${job.title || 'Untitled Job'}
      </h3>
      <button class="bookmark-btn">
        <span class="icon icon-bookmark">🔖</span>
      </button>
    </div>
    <p class="job-description">
      ${description}
    </p>
    <div class="job-tags">
      ${skillsHtml}
    </div>
    <div class="job-meta" style="font-size: 0.75rem; color: var(--current-subtle); margin: 0.5rem 0;">
      <span>💰 ${job.budget || 'Budget not specified'}</span> • 
      <span>⏰ ${job.postedTime || 'Unknown'}</span> • 
      <span>📝 ${job.proposals || 'Unknown proposals'}</span>
    </div>
    <button class="btn btn-primary btn-full generate-proposal-btn">Generate Proposal</button>
  `;

  return jobCard;
}

// Show notification
function showNotification(message, type = 'info') {
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

// Save jobs to localStorage
function saveJobsToStorage(jobs, searchQuery) {
  try {
    const jobData = {
      jobs: jobs,
      searchQuery: searchQuery,
      timestamp: new Date().toISOString(),
      totalCount: jobs.length
    };
    
    // Save to upwork_rails_jobs key
    localStorage.setItem('upwork_rails_jobs', JSON.stringify(jobData));
    
    // Also save to a more general key for backward compatibility
    localStorage.setItem('upwork_jobs_data', JSON.stringify(jobData));
    
    console.log(`Saved ${jobs.length} jobs to localStorage`);
  } catch (error) {
    console.error('Error saving jobs to localStorage:', error);
  }
}

// Auto-save search query
function autoSaveSearch(keywords) {
  try {
    // Get existing saved searches
    const savedSearches = JSON.parse(localStorage.getItem('saved_searches') || '[]');
    
    // Check if this search already exists
    const existingSearch = savedSearches.find(search => 
      search.keywords.toLowerCase() === keywords.toLowerCase()
    );
    
    if (!existingSearch) {
      // Add new search
      const newSearch = {
        id: Date.now(),
        keywords: keywords.trim(),
        notifications: true,
        created: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        useCount: 1
      };
      
      savedSearches.unshift(newSearch); // Add to beginning
      
      // Keep only last 10 searches
      if (savedSearches.length > 10) {
        savedSearches.splice(10);
      }
      
      localStorage.setItem('saved_searches', JSON.stringify(savedSearches));
      console.log(`Auto-saved search: "${keywords}"`);
    } else {
      // Update existing search
      existingSearch.lastUsed = new Date().toISOString();
      existingSearch.useCount = (existingSearch.useCount || 1) + 1;
      
      // Move to front
      const index = savedSearches.indexOf(existingSearch);
      savedSearches.splice(index, 1);
      savedSearches.unshift(existingSearch);
      
      localStorage.setItem('saved_searches', JSON.stringify(savedSearches));
      console.log(`Updated search: "${keywords}" (used ${existingSearch.useCount} times)`);
    }
  } catch (error) {
    console.error('Error auto-saving search:', error);
  }
}

// Load jobs from localStorage
function loadJobsFromStorage() {
  try {
    const jobData = localStorage.getItem('upwork_rails_jobs');
    if (jobData) {
      const parsed = JSON.parse(jobData);
      console.log(`Loaded ${parsed.jobs?.length || 0} jobs from localStorage`);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading jobs from localStorage:', error);
  }
  return null;
}

// Load saved searches
function loadSavedSearches() {
  try {
    const searches = localStorage.getItem('saved_searches');
    return searches ? JSON.parse(searches) : [];
  } catch (error) {
    console.error('Error loading saved searches:', error);
    return [];
  }
}

// Theme toggle (for future use)
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', newTheme);
  console.log(`Theme switched to: ${newTheme}`);
}

// Event listeners setup
function setupEventListeners() {
  // Find Jobs button
  const findJobsBtn = document.getElementById('find-jobs-btn');
  if (findJobsBtn) {
    findJobsBtn.addEventListener('click', findJobs);
  }

  // Auto-apply button
  const autoApplyBtn = document.getElementById('auto-apply-btn');
  if (autoApplyBtn) {
    autoApplyBtn.addEventListener('click', showAutoApply);
  }

  // Use event delegation for dynamically created elements
  const jobListContainer = document.querySelector('.job-list');
  if (jobListContainer) {
    // Generate Proposal buttons
    jobListContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('generate-proposal-btn')) {
        e.preventDefault();
        generateProposal(e.target);
      }
      
      // Bookmark buttons
      if (e.target.closest('.bookmark-btn')) {
        e.preventDefault();
        toggleBookmark(e.target.closest('.bookmark-btn'));
      }
      
      // Job titles
      if (e.target.classList.contains('job-title')) {
        e.preventDefault();
        const jobTitle = e.target.getAttribute('data-job') || e.target.textContent;
        const jobUrl = e.target.getAttribute('data-url');
        showJobDetails(jobTitle, jobUrl);
      }
    });
  }

  // Also handle static elements (demo jobs)
  const staticProposalBtns = document.querySelectorAll('.generate-proposal-btn');
  staticProposalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => generateProposal(e.target));
  });

  const staticBookmarkBtns = document.querySelectorAll('.bookmark-btn');
  staticBookmarkBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleBookmark(e.currentTarget);
    });
  });

  const staticJobTitles = document.querySelectorAll('.job-title');
  staticJobTitles.forEach(title => {
    title.addEventListener('click', (e) => {
      e.preventDefault();
      const jobTitle = e.target.getAttribute('data-job') || e.target.textContent;
      const jobUrl = e.target.getAttribute('data-url');
      showJobDetails(jobTitle, jobUrl);
    });
  });

  // Settings button
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', showSettings);
  }

  // Save search button
  const saveSearchBtn = document.getElementById('save-search-btn');
  if (saveSearchBtn) {
    saveSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveSearch();
    });
  }

  // Navigation items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Handle navigation based on data attribute
      const navType = item.getAttribute('data-nav');
      switch (navType) {
        case 'scraper':
          console.log('Scraper view active');
          break;
        case 'proposals':
          showProposals();
          break;
        case 'history':
          showHistory();
          break;
      }
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const keywordsInput = document.getElementById('keywords');
      if (keywordsInput) {
        keywordsInput.focus();
      }
    }

    // Ctrl/Cmd + Enter to find jobs
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.id === 'keywords') {
        findJobs();
      }
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Upwork Extension v3.0.0 - AI Master (Fixed) initialized');
  
  // Setup all event listeners
  setupEventListeners();
  
  // Load saved jobs from localStorage
  loadSavedJobsOnStartup();
  
  // Load saved searches and populate suggestions
  loadSavedSearchesOnStartup();
  
  // Add visual indicator that the extension is working
  const header = document.querySelector('.header-title');
  if (header) {
    header.style.color = '#38e07b';
    setTimeout(() => {
      header.style.color = '';
    }, 1000);
  }

  // Show initialization success
  setTimeout(() => {
    console.log('Extension fully loaded and ready!');
  }, 500);
});

// Load saved jobs on startup
function loadSavedJobsOnStartup() {
  const savedJobData = loadJobsFromStorage();
  if (savedJobData && savedJobData.jobs && savedJobData.jobs.length > 0) {
    console.log(`Loading ${savedJobData.jobs.length} saved jobs from localStorage`);
    
    // Display the saved jobs
    displayJobResults(savedJobData.jobs, savedJobData.searchQuery);
    
    // Update indicators
    const indicator = document.querySelector('.new-jobs-indicator span:last-child');
    if (indicator) {
      indicator.textContent = `${savedJobData.jobs.length} Saved Jobs`;
    }
    
    const navBadge = document.querySelector('.nav-badge');
    if (navBadge) {
      navBadge.textContent = savedJobData.jobs.length;
    }
    
    // Update section title to show it's from storage
    const sectionTitle = document.querySelector('.section-header .section-title');
    if (sectionTitle) {
      const timeAgo = getTimeAgo(savedJobData.timestamp);
      sectionTitle.textContent = `Last Search: "${savedJobData.searchQuery}" (${timeAgo})`;
    }
    
    showNotification(`Loaded ${savedJobData.jobs.length} saved jobs`, 'info');
  }
}

// Load saved searches on startup
function loadSavedSearchesOnStartup() {
  const savedSearches = loadSavedSearches();
  if (savedSearches.length > 0) {
    console.log(`Loaded ${savedSearches.length} saved searches`);
    
    // Set the most recent search as default
    const keywordsInput = document.getElementById('keywords');
    if (keywordsInput && savedSearches[0]) {
      keywordsInput.value = savedSearches[0].keywords;
      keywordsInput.placeholder = `e.g., ${savedSearches.slice(0, 3).map(s => s.keywords).join(', ')}`;
    }
  }
}

// Helper function to get time ago
function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

// Handle extension-specific events
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'newJobsFound') {
      alert(`${request.count} new jobs found!`);
    }
    
    if (request.action === 'autoApplyComplete') {
      alert('Auto-apply completed successfully!');
    }
    
    sendResponse({ status: 'received' });
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    findJobs,
    generateProposal,
    toggleBookmark,
    toggleTheme
  };
}
