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
  const jobTitle = jobCard ? jobCard.querySelector('.job-title').textContent : 'Unknown Job';
  const jobUrl = jobCard ? jobCard.querySelector('.job-title').getAttribute('data-url') : '#';
  
  console.log('Generate proposal clicked for:', jobTitle);
  
  btn.textContent = 'Generating...';
  btn.disabled = true;
  
  // Save job data for proposal screen
  const jobData = {
    title: jobTitle,
    url: jobUrl,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('current_job_for_proposal', JSON.stringify(jobData));
  
  // Simulate AI generation delay
  setTimeout(() => {
    btn.textContent = 'Generate Proposal';
    btn.disabled = false;
    
    console.log('Opening proposal review for:', jobTitle);
    
    // Open proposal review screen
    openProposalReview(jobTitle, jobUrl);
    
    showNotification(`AI proposal generated for "${jobTitle}"!`, 'success');
  }, 2000);
}

// Open proposal review screen within the extension
function openProposalReview(jobTitle, jobUrl) {
  console.log('openProposalReview called with:', { jobTitle, jobUrl });
  
  try {
    // Create and show the proposal review overlay
    createProposalReviewOverlay(jobTitle, jobUrl);
  } catch (error) {
    console.error('Error creating proposal overlay:', error);
    alert('Error opening proposal review. Check console for details.');
  }
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
5. Test Proposal Overlay
6. View Extension Logs

Choose an option (1-6) or Cancel:
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
      testProposalOverlay();
      break;
    case '6':
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

// Test function for proposal overlay
function testProposalOverlay() {
  console.log('Testing proposal overlay...');
  createProposalReviewOverlay('Test Job - React Developer', 'https://www.upwork.com/test');
}

// Make test function available globally
window.testProposalOverlay = testProposalOverlay;

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
    console.log('You can test the proposal overlay by running: testProposalOverlay()');
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

// Create proposal review overlay within the extension
function createProposalReviewOverlay(jobTitle, jobUrl) {
  // Remove any existing overlay
  const existingOverlay = document.getElementById('proposal-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'proposal-overlay';
  overlay.className = 'screen-overlay hidden';
  
  // Generate personalized proposal
  const personalizedProposal = generatePersonalizedProposal(jobTitle);
  
  overlay.innerHTML = `
    <header class="header">
      <div class="header-content">
        <button class="header-button" id="proposal-back-btn">
          <span class="icon">←</span>
        </button>
        <h1 class="header-title">Proposal Review</h1>
        <div style="width: 2.25rem; height: 2.25rem;"></div>
      </div>
    </header>

    <main class="screen-content">
      <!-- AI Generated Section -->
      <section class="screen-section">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <div style="padding: 0.5rem; background-color: rgba(59, 130, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="color: var(--blue-500); font-size: 1.5rem;">🤖</span>
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--current-content);">AI Generated Proposal</h2>
        </div>
        <p style="font-size: 0.875rem; color: var(--current-subtle); margin-bottom: 1rem; line-height: 1.6;">
          Review the AI-generated proposal below for "${jobTitle}". You can make edits before sending.
        </p>
      </section>

      <!-- Template Selection -->
      <section class="screen-section">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: var(--current-content); margin-bottom: 0.5rem;">Use a template</label>
          <div style="position: relative;">
            <select id="proposal-template-select" style="width: 100%; padding: 0.5rem 2.5rem; background-color: var(--current-bg); border: 1px solid var(--current-border); border-radius: 0.5rem; font-size: 0.875rem; color: var(--current-content); cursor: pointer; appearance: none;">
              <option value="">No Template</option>
              <option value="template1">Standard Frontend Proposal</option>
              <option value="template2">Quick Intro Template</option>
              <option value="template3">React Specialist Template</option>
            </select>
            <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--current-subtle); pointer-events: none;">📄</span>
            <span style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); color: var(--current-content); pointer-events: none;">▼</span>
          </div>
        </div>
      </section>

      <!-- Proposal Content -->
      <section class="screen-section">
        <div style="background-color: var(--current-bg); border: 1px solid var(--current-border); border-radius: 0.5rem; padding: 1rem;">
          <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--current-content); margin-bottom: 0.5rem;">Subject: Proposal for ${jobTitle}</h3>
          <textarea 
            id="proposal-textarea" 
            style="width: 100%; background-color: var(--current-bg); border: 1px solid var(--current-border); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem; color: var(--current-content); line-height: 1.6; resize: vertical; min-height: 12rem; font-family: var(--font-family);"
            placeholder="Your proposal will appear here..."
          >${personalizedProposal}</textarea>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
            <button id="proposal-proofread-btn" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: var(--blue-500); background: none; border: none; cursor: pointer;">
              <span>✓</span>
              Proofread
            </button>
            <div style="font-size: 0.75rem; color: var(--current-subtle); text-align: right;" id="proposal-word-count">
              <span id="proposal-words">0 Words</span> / <span id="proposal-chars">0 Characters</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer" style="padding: 1rem;">
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; gap: 0.75rem;">
          <button id="proposal-reject-btn" class="btn btn-secondary btn-full" style="background-color: rgba(239, 68, 68, 0.1); color: var(--red-500);">
            <span>✕</span>
            Reject
          </button>
          <button id="proposal-regenerate-btn" class="btn btn-secondary btn-full" style="background-color: rgba(245, 158, 11, 0.1); color: var(--warning);">
            <span>🔄</span>
            Regenerate
          </button>
        </div>
        <button id="proposal-accept-btn" class="btn btn-primary btn-full">
          <span>📤</span>
          Accept & Send
        </button>
      </div>
    </footer>
  `;

  // Add initial styling for animation
  overlay.style.opacity = '0';
  overlay.style.transform = 'translateY(20px)';
  overlay.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  
  // Add to document
  document.body.appendChild(overlay);
  
  // Debug logging
  console.log('Proposal overlay created and added to DOM');
  
  // Update word count initially
  setTimeout(() => updateProposalWordCount(), 100);
  
  // Add event listeners to the overlay elements
  setupProposalOverlayEventListeners(overlay, jobTitle, jobUrl);
  
  // Show overlay with animation
  setTimeout(() => {
    overlay.classList.remove('hidden');
    overlay.style.opacity = '1';
    overlay.style.transform = 'translateY(0)';
    console.log('Proposal overlay should now be visible');
    
    // Add keyboard listener for Escape key
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        closeProposalOverlay();
        document.removeEventListener('keydown', handleKeyPress);
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    
    // Store the handler so we can remove it later
    overlay.keyHandler = handleKeyPress;
  }, 50);
}

// Generate personalized proposal based on job title
function generatePersonalizedProposal(jobTitle) {
  const skills = extractSkillsFromJobTitle(jobTitle);
  
  return `Hello,

I am writing to express my strong interest in the "${jobTitle}" position. With extensive experience in ${skills.join(', ')}, I am confident I can deliver exceptional results for your project.

**Why I'm the right fit:**
• Proven expertise in ${skills[0] || 'web development'} with a track record of successful projects
• Strong problem-solving skills and attention to detail
• Excellent communication and ability to work independently
• Committed to delivering high-quality code and meeting deadlines

**My approach:**
1. Thoroughly understand your project requirements and goals
2. Provide regular updates and maintain clear communication
3. Write clean, maintainable, and well-documented code
4. Ensure thorough testing and quality assurance

I would love to discuss your project in more detail and show you examples of my relevant work. I'm available for a quick call at your convenience.

Thank you for considering my proposal. I look forward to the opportunity to contribute to your project's success.

Best regards,
[Your Name]`;
}

// Extract skills from job title
function extractSkillsFromJobTitle(title) {
  const commonSkills = [
    'React', 'TypeScript', 'JavaScript', 'Vue.js', 'Angular',
    'Node.js', 'Python', 'PHP', 'Ruby', 'Rails',
    'HTML', 'CSS', 'SCSS', 'Tailwind', 'Bootstrap',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'AWS', 'Docker', 'Kubernetes', 'Git'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    title.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills.length > 0 ? foundSkills : ['web development'];
}

// Setup event listeners for proposal overlay
function setupProposalOverlayEventListeners(overlay, jobTitle, jobUrl) {
  // Back button
  const backBtn = overlay.querySelector('#proposal-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', closeProposalOverlay);
  }

  // Template select
  const templateSelect = overlay.querySelector('#proposal-template-select');
  if (templateSelect) {
    templateSelect.addEventListener('change', handleProposalTemplateChange);
  }

  // Textarea input for word count
  const textarea = overlay.querySelector('#proposal-textarea');
  if (textarea) {
    textarea.addEventListener('input', updateProposalWordCount);
  }

  // Proofread button
  const proofreadBtn = overlay.querySelector('#proposal-proofread-btn');
  if (proofreadBtn) {
    proofreadBtn.addEventListener('click', proofreadProposalText);
  }

  // Reject button
  const rejectBtn = overlay.querySelector('#proposal-reject-btn');
  if (rejectBtn) {
    rejectBtn.addEventListener('click', rejectProposalOverlay);
  }

  // Regenerate button
  const regenerateBtn = overlay.querySelector('#proposal-regenerate-btn');
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => regenerateProposalOverlay(jobTitle));
  }

  // Accept button
  const acceptBtn = overlay.querySelector('#proposal-accept-btn');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => acceptAndSendProposal(jobUrl));
  }

  console.log('Proposal overlay event listeners setup complete');
}

// Proposal overlay functions
function closeProposalOverlay() {
  const overlay = document.getElementById('proposal-overlay');
  if (overlay) {
    // Remove keyboard event listener if it exists
    if (overlay.keyHandler) {
      document.removeEventListener('keydown', overlay.keyHandler);
    }
    
    // Add fade out animation
    overlay.style.opacity = '0';
    overlay.style.transform = 'translateY(10px)';
    overlay.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
      overlay.remove();
      console.log('Proposal overlay closed');
    }, 300);
  }
}

function updateProposalWordCount() {
  const textarea = document.getElementById('proposal-textarea');
  const wordsElement = document.getElementById('proposal-words');
  const charsElement = document.getElementById('proposal-chars');
  
  if (!textarea || !wordsElement || !charsElement) return;
  
  const text = textarea.value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  
  wordsElement.textContent = `${words} Words`;
  charsElement.textContent = `${characters} Characters`;
}

function handleProposalTemplateChange() {
  const select = document.getElementById('proposal-template-select');
  const textarea = document.getElementById('proposal-textarea');
  
  if (!select || !textarea) return;
  
  const templates = {
    template1: `Dear Hiring Manager,

I am excited to submit my proposal for your project. With extensive experience in modern web development, I have successfully delivered numerous projects that align perfectly with your requirements.

**What I bring to your project:**
• Expert-level proficiency in the required technologies
• Strong understanding of best practices and industry standards
• Proven track record of delivering projects on time and within budget
• Excellent communication and project management skills

**My approach:**
1. Thorough analysis of your project requirements
2. Clean, maintainable code following industry best practices
3. Regular communication and progress updates
4. Comprehensive testing and quality assurance

I would love to discuss how my expertise can contribute to your project's success.

Best regards,
[Your Name]`,

    template2: `Hi there!

I just saw your posting and I'm very interested!

**Quick highlights:**
• Extensive experience in the required technologies
• Available to start immediately
• Strong portfolio of similar projects
• Excellent communication & fast turnaround

I'd love to chat about your project requirements. When would be a good time for a brief call?

Looking forward to working together!

[Your Name]`,

    template3: `Hello,

As a specialist with deep expertise in modern web development, I'm confident I'm the perfect fit for your project.

**My expertise includes:**
• Advanced development patterns and best practices
• Performance optimization and scalability
• Modern tooling and development workflows
• Comprehensive testing and quality assurance

**Recent relevant work:**
• Built scalable applications serving thousands of users
• Implemented complex features with high performance
• Delivered projects with 99% uptime and excellent user feedback

I'm excited about the opportunity to bring my expertise to your team.

Best regards,
[Your Name]`
  };
  
  const templateKey = select.value;
  
  if (templateKey && templates[templateKey]) {
    textarea.value = templates[templateKey];
    updateProposalWordCount();
    showNotification('Template applied successfully!', 'success');
  }
}

function proofreadProposalText() {
  const textarea = document.getElementById('proposal-textarea');
  if (!textarea) return;
  
  const text = textarea.value;
  if (!text.trim()) {
    showNotification('Please enter some text to proofread', 'warning');
    return;
  }
  
  const suggestions = [];
  
  // Check for common issues
  if (text.includes('[') && text.includes(']')) {
    suggestions.push('• Replace placeholder text in brackets [like this]');
  }
  
  if (!text.includes('Best regards') && !text.includes('Sincerely') && !text.includes('Thank you')) {
    suggestions.push('• Consider adding a professional closing');
  }
  
  if (text.length < 200) {
    suggestions.push('• Proposal might be too short - consider adding more details');
  }
  
  if (text.length > 2000) {
    suggestions.push('• Proposal might be too long - consider being more concise');
  }
  
  if (suggestions.length === 0) {
    showNotification('✓ No obvious issues found!', 'success');
  } else {
    alert(`Proofreading suggestions:\n\n${suggestions.join('\n')}`);
  }
}

function regenerateProposalOverlay(jobTitle) {
  const confirmRegenerate = confirm('Are you sure you want to regenerate the proposal?\n\nThis will replace your current text with a new AI-generated version.');
  
  if (confirmRegenerate) {
    const textarea = document.getElementById('proposal-textarea');
    if (textarea) {
      showNotification('Regenerating proposal...', 'info');
      
      setTimeout(() => {
        const newProposal = generateAlternativeProposal(jobTitle);
        textarea.value = newProposal;
        updateProposalWordCount();
        showNotification('New proposal generated!', 'success');
      }, 1500);
    }
  }
}

function generateAlternativeProposal(jobTitle) {
  const alternatives = [
    `Dear Client,

I'm excited about your ${jobTitle} position and believe I'm an excellent match for your requirements.

**My qualifications:**
• Extensive experience in modern web development
• Strong portfolio of successful projects
• Excellent communication and project management skills
• Commitment to quality and timely delivery

**What you can expect:**
- Professional, clean code following best practices
- Regular progress updates and transparent communication
- Thorough testing and quality assurance
- Post-delivery support and documentation

I'd be happy to discuss your project requirements in detail.

Looking forward to collaborating with you!

Best regards,
[Your Name]`,

    `Hi there!

Your ${jobTitle} position caught my attention, and I'm confident I can deliver exactly what you're looking for.

**Why choose me:**
• Proven track record with similar projects
• Fast turnaround without compromising quality
• Proactive communication throughout the project
• Competitive pricing with exceptional value

I'm available to start immediately and would love to discuss your specific needs.

Best,
[Your Name]`
  ];
  
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

function rejectProposalOverlay() {
  const confirmReject = confirm('Are you sure you want to reject this proposal?\n\nThis will close the proposal review and return to the job list.');
  
  if (confirmReject) {
    showNotification('Proposal rejected', 'info');
    closeProposalOverlay();
  }
}

async function acceptAndSendProposal(jobUrl) {
  const textarea = document.getElementById('proposal-textarea');
  if (!textarea || !textarea.value.trim()) {
    showNotification('Please enter a proposal before sending', 'warning');
    return;
  }
  
  const confirmSend = confirm('Ready to send this proposal?\n\nThis will open Upwork in a new tab with your proposal ready to submit.');
  
  if (confirmSend) {
    // Copy proposal to clipboard
    try {
      await navigator.clipboard.writeText(textarea.value);
      showNotification('Proposal copied to clipboard!', 'success');
    } catch (error) {
      console.log('Could not copy to clipboard:', error);
    }
    
    // Open Upwork job page if available
    if (jobUrl && jobUrl !== '#') {
      chrome.tabs.create({ url: jobUrl });
    }
    
    showNotification('Opening Upwork... Paste your proposal and submit!', 'success');
    closeProposalOverlay();
  }
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
