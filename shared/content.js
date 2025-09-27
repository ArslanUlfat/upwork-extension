// Content script for scraping Upwork job listings
class UpworkScraper {
  constructor() {
    this.jobs = [];
    this.isAutoScraping = false;
  }

  // Main scraping function
  scrapeJobs(searchQuery = 'rails') {
    console.log('Starting to scrape Upwork jobs for:', searchQuery);
    
    const jobs = [];
    
    // Wait for page to be fully loaded
    if (document.readyState !== 'complete') {
      console.log('Page not fully loaded, waiting...');
      return [];
    }

    // Updated selectors for modern Upwork (2024/2025)
    const jobSelectors = [
      'article[data-ev-label="search_result_impression"]',
      'section[data-test="JobTile"]',
      'div[data-test="job-tile"]',
      'article[data-test="job-tile"]',
      '.job-tile',
      '.up-card-section',
      'article.job-tile',
      '[data-cy="job-tile"]',
      'div[data-cy="job-tile"]'
    ];

    let jobElements = [];
    
    // Try each selector until we find elements
    for (const selector of jobSelectors) {
      jobElements = document.querySelectorAll(selector);
      if (jobElements.length > 0) {
        console.log(`Found ${jobElements.length} job elements using selector: ${selector}`);
        break;
      }
    }
    
    if (jobElements.length === 0) {
      console.log('No job elements found with primary selectors, trying fallback...');
      // Fallback: look for any article or section that might contain job info
      jobElements = document.querySelectorAll('article, section[class*="job"], div[class*="job"]');
      console.log(`Fallback found ${jobElements.length} potential elements`);
    }

    jobElements.forEach((element, index) => {
      try {
        // Add safety check for element accessibility
        if (!element || !element.textContent) {
          console.log(`Skipping empty element ${index}`);
          return;
        }

        const job = this.extractJobData(element, searchQuery);
        if (job && job.title && job.title.length > 3) {
          jobs.push(job);
          console.log(`Successfully extracted job ${index}: ${job.title}`);
        } else {
          console.log(`Job ${index} failed validation:`, job?.title || 'No title');
        }
      } catch (error) {
        console.error(`Error extracting job ${index}:`, error.message || error);
        // Continue with next job instead of failing completely
      }
    });

    // Alternative scraping method if primary method doesn't work
    if (jobs.length === 0) {
      console.log('Trying alternative scraping method...');
      const alternativeElements = document.querySelectorAll('article, .job-tile-header, .up-card-list-section, [data-cy="job-tile"]');
      
      alternativeElements.forEach((element, index) => {
        try {
          const job = this.extractJobDataAlternative(element, searchQuery);
          if (job && job.title) {
            jobs.push(job);
          }
        } catch (error) {
          console.error(`Error in alternative extraction ${index}:`, error);
        }
      });
    }

    console.log(`Successfully scraped ${jobs.length} jobs`);
    this.jobs = jobs;
    return jobs;
  }

  // Primary job data extraction method
  extractJobData(element, searchQuery) {
    const job = {
      id: this.generateId(),
      scrapedAt: new Date().toISOString(),
      searchQuery: searchQuery
    };

    try {
      // Extract title with updated selectors for modern Upwork
      const titleSelectors = [
        'h2 a[data-test="job-title-link"]',
        'h3 a[data-test="job-title-link"]',
        'h4 a[data-test="job-title-link"]',
        'a[data-test="job-title-link"]',
        'h2 a', 'h3 a', 'h4 a', 'h5 a',
        '[data-test="job-title"] a',
        '.job-tile-title a',
        '.up-n-link',
        'a[href*="/jobs/"]',
        'a[href*="~"]' // Upwork job URLs often contain ~
      ];

      for (const selector of titleSelectors) {
        try {
          const titleElement = element.querySelector(selector);
          if (titleElement && titleElement.textContent && titleElement.textContent.trim()) {
            job.title = this.cleanText(titleElement.textContent);
            job.url = this.makeAbsoluteUrl(titleElement.getAttribute('href'));
            break;
          }
        } catch (e) {
          console.log(`Error with title selector ${selector}:`, e.message);
          continue;
        }
      }

      // If no title found with links, try text-only selectors
      if (!job.title) {
        const textTitleSelectors = [
          'h2[data-test="job-title"]',
          'h3[data-test="job-title"]',
          'h4[data-test="job-title"]',
          '.job-tile-title',
          'h2', 'h3', 'h4', 'h5'
        ];

        for (const selector of textTitleSelectors) {
          try {
            const titleElement = element.querySelector(selector);
            if (titleElement && titleElement.textContent && titleElement.textContent.trim().length > 5) {
              job.title = this.cleanText(titleElement.textContent);
              // Try to find URL separately
              const linkElement = element.querySelector('a[href*="/jobs/"], a[href*="~"]');
              if (linkElement) {
                job.url = this.makeAbsoluteUrl(linkElement.getAttribute('href'));
              }
              break;
            }
          } catch (e) {
            console.log(`Error with text title selector ${selector}:`, e.message);
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Error extracting title:', error.message);
    }

    // Extract budget/price safely
    try {
      job.budget = this.extractBudgetFromElement(element);
    } catch (error) {
      console.log('Error extracting budget:', error.message);
      job.budget = 'Not specified';
    }

    // Extract description safely
    try {
      const descriptionSelectors = [
        '[data-test="job-description"]',
        '[data-test="description"]',
        '.job-tile-description',
        '.up-card-body',
        'div[data-test="job-description-text"]',
        'p:not(:empty)',
        '.description'
      ];

      for (const selector of descriptionSelectors) {
        try {
          const descElement = element.querySelector(selector);
          if (descElement && descElement.textContent && descElement.textContent.trim().length > 30) {
            job.description = this.cleanText(descElement.textContent).substring(0, 200) + '...';
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // Fallback: get description from any substantial text block
      if (!job.description) {
        const allText = this.cleanText(element.textContent);
        if (allText.length > 100) {
          // Find the longest sentence that's not the title
          const sentences = allText.split('.').filter(s => 
            s.length > 30 && 
            !job.title || !s.includes(job.title)
          );
          if (sentences.length > 0) {
            job.description = sentences[0].substring(0, 200) + '...';
          }
        }
      }
    } catch (error) {
      console.log('Error extracting description:', error.message);
      job.description = 'Description not available';
    }

    // Extract other data safely
    try {
      job.skills = this.extractSkills(element);
    } catch (error) {
      console.log('Error extracting skills:', error.message);
      job.skills = [];
    }

    try {
      job.postedTime = this.extractPostedTime(element);
    } catch (error) {
      console.log('Error extracting posted time:', error.message);
      job.postedTime = 'Unknown';
    }

    try {
      job.proposals = this.extractProposals(element);
    } catch (error) {
      console.log('Error extracting proposals:', error.message);
      job.proposals = 'Unknown';
    }

    try {
      job.clientInfo = this.extractClientInfo(element);
    } catch (error) {
      console.log('Error extracting client info:', error.message);
      job.clientInfo = 'Unknown';
    }

    return job;
  }

  // Alternative extraction method
  extractJobDataAlternative(element, searchQuery) {
    const job = {
      id: this.generateId(),
      scrapedAt: new Date().toISOString(),
      searchQuery: searchQuery
    };

    // Get all links in the element
    const links = element.querySelectorAll('a[href*="/jobs/"]');
    if (links.length > 0) {
      const mainLink = links[0];
      job.title = this.cleanText(mainLink.textContent);
      job.url = this.makeAbsoluteUrl(mainLink.href);
    }

    // Extract any text that looks like a budget
    job.budget = this.extractBudgetFromText(element.textContent);

    // Get description from longest text block
    const textBlocks = Array.from(element.querySelectorAll('p, div'))
      .map(el => this.cleanText(el.textContent))
      .filter(text => text.length > 30)
      .sort((a, b) => b.length - a.length);

    if (textBlocks.length > 0) {
      job.description = textBlocks[0].substring(0, 200) + '...';
    }

    // Extract skills from spans or small elements
    job.skills = this.extractSkillsFromText(element.textContent);

    return job;
  }

  // Helper method to extract budget information
  extractBudgetFromElement(element) {
    const budgetText = element.textContent || '';
    return this.extractBudgetFromText(budgetText);
  }

  extractBudgetFromText(text) {
    // Look for various budget patterns
    const patterns = [
      /\$[\d,]+(?:\.\d{2})?(?:\s*-\s*\$[\d,]+(?:\.\d{2})?)?/g,
      /Budget:\s*\$[\d,]+/gi,
      /Fixed[:\s]+\$[\d,]+/gi,
      /Hourly[:\s]+\$[\d,]+-?\$?[\d,]*/gi
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        return matches[0];
      }
    }

    return 'Not specified';
  }

  // Extract skills from element
  extractSkills(element) {
    const skills = [];
    
    // Look for skill containers
    const skillSelectors = [
      '[data-test="skills"] span',
      '.skills span',
      '.up-skill-badge',
      '.skill-tag',
      'span[class*="skill"]'
    ];

    for (const selector of skillSelectors) {
      const skillElements = element.querySelectorAll(selector);
      skillElements.forEach(skill => {
        const skillText = this.cleanText(skill.textContent);
        if (skillText && skillText.length < 30) {
          skills.push(skillText);
        }
      });
    }

    return skills.slice(0, 5); // Limit to 5 skills
  }

  extractSkillsFromText(text) {
    const commonSkills = ['rails', 'ruby', 'javascript', 'react', 'vue', 'node', 'python', 'php', 'mysql', 'postgresql'];
    const foundSkills = [];
    
    const lowerText = text.toLowerCase();
    commonSkills.forEach(skill => {
      if (lowerText.includes(skill)) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  // Extract posted time
  extractPostedTime(element) {
    const timeSelectors = [
      '[data-test="posted-time"]',
      '.posted-time',
      'time',
      'small:contains("ago")',
      '*:contains("hours ago")',
      '*:contains("days ago")'
    ];

    for (const selector of timeSelectors) {
      const timeElement = element.querySelector(selector);
      if (timeElement) {
        return this.cleanText(timeElement.textContent);
      }
    }

    return 'Unknown';
  }

  // Extract proposals count
  extractProposals(element) {
    const text = element.textContent;
    const proposalMatch = text.match(/(\d+)\s*proposals?/i);
    return proposalMatch ? proposalMatch[1] + ' proposals' : 'Unknown';
  }

  // Extract client information
  extractClientInfo(element) {
    const clientSelectors = [
      '[data-test="client-info"]',
      '.client-info',
      '.up-card-footer'
    ];

    for (const selector of clientSelectors) {
      const clientElement = element.querySelector(selector);
      if (clientElement) {
        return this.cleanText(clientElement.textContent).substring(0, 100);
      }
    }

    return 'Unknown';
  }

  // Utility methods
  cleanText(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
  }

  makeAbsoluteUrl(url) {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return 'https://www.upwork.com' + url;
    return 'https://www.upwork.com/' + url;
  }

  generateId() {
    return 'job_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Debug method to analyze page structure
  debugPageStructure() {
    console.log('=== UPWORK PAGE STRUCTURE DEBUG ===');
    console.log('Page URL:', window.location.href);
    console.log('Page title:', document.title);
    console.log('Document ready state:', document.readyState);
    
    // Check for common job container patterns
    const patterns = [
      'article[data-ev-label="search_result_impression"]',
      'section[data-test="JobTile"]',
      'div[data-test="job-tile"]',
      'article[data-test="job-tile"]',
      '.job-tile',
      'article',
      'section'
    ];

    patterns.forEach(pattern => {
      const elements = document.querySelectorAll(pattern);
      console.log(`${pattern}: ${elements.length} elements`);
      if (elements.length > 0) {
        console.log('First element classes:', elements[0].className);
        console.log('First element data attributes:', Array.from(elements[0].attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .map(attr => `${attr.name}="${attr.value}"`)
        );
      }
    });

    // Check for title patterns
    const titlePatterns = [
      'h2 a', 'h3 a', 'h4 a',
      'a[data-test="job-title-link"]',
      'a[href*="/jobs/"]'
    ];

    titlePatterns.forEach(pattern => {
      const elements = document.querySelectorAll(pattern);
      console.log(`Title pattern ${pattern}: ${elements.length} elements`);
      if (elements.length > 0) {
        console.log('Sample title:', elements[0].textContent?.substring(0, 50));
      }
    });

    console.log('=== END DEBUG ===');
  }

  // Filter jobs based on search query
  filterJobs(jobs, query) {
    if (!query) return jobs;
    
    const lowerQuery = query.toLowerCase();
    return jobs.filter(job => {
      const titleMatch = job.title && job.title.toLowerCase().includes(lowerQuery);
      const descMatch = job.description && job.description.toLowerCase().includes(lowerQuery);
      const skillsMatch = job.skills && job.skills.some(skill => 
        skill.toLowerCase().includes(lowerQuery)
      );
      
      return titleMatch || descMatch || skillsMatch;
    });
  }
}

// Initialize scraper
const scraper = new UpworkScraper();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'scrapeJobs') {
    try {
      // Run debug if requested
      if (request.debug) {
        scraper.debugPageStructure();
      }

      const jobs = scraper.scrapeJobs(request.searchQuery || 'rails');
      const filteredJobs = scraper.filterJobs(jobs, request.searchQuery);
      
      console.log(`Returning ${filteredJobs.length} jobs to popup (${jobs.length} total found)`);
      
      // Send detailed response
      sendResponse({ 
        success: true, 
        jobs: filteredJobs,
        totalFound: jobs.length,
        pageUrl: window.location.href,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error scraping jobs:', error);
      sendResponse({ 
        success: false, 
        error: error.message || 'Unknown error',
        stack: error.stack,
        jobs: [],
        pageUrl: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  }

  if (request.action === 'debugPage') {
    try {
      scraper.debugPageStructure();
      sendResponse({ success: true, message: 'Debug info logged to console' });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  if (request.action === 'ping') {
    sendResponse({ 
      success: true, 
      message: 'Content script is active',
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }
  
  return true; // Keep message channel open for async response
});

// Auto-scrape when page loads (optional)
window.addEventListener('load', () => {
  console.log('Upwork Rails Scraper content script loaded');
  
  // Auto-scrape if we're on a job search page
  if (window.location.href.includes('/nx/search/jobs')) {
    setTimeout(() => {
      const jobs = scraper.scrapeJobs();
      console.log(`Auto-scraped ${jobs.length} jobs on page load`);
    }, 2000);
  }
});

console.log('Upwork Rails Scraper content script initialized');