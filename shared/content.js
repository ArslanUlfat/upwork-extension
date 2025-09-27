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
    const jobElements = document.querySelectorAll('[data-test="job-tile"], [data-test="JobTile"], .job-tile, .up-card-section');
    
    console.log(`Found ${jobElements.length} potential job elements`);

    jobElements.forEach((element, index) => {
      try {
        const job = this.extractJobData(element, searchQuery);
        if (job && job.title) {
          jobs.push(job);
        }
      } catch (error) {
        console.error(`Error extracting job ${index}:`, error);
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

    // Extract title
    const titleSelectors = [
      'h4 a', 'h3 a', 'h2 a',
      '[data-test="job-title"] a',
      '.job-tile-title a',
      '.up-n-link',
      'a[href*="/jobs/"]'
    ];

    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement) {
        job.title = this.cleanText(titleElement.textContent);
        job.url = this.makeAbsoluteUrl(titleElement.href);
        break;
      }
    }

    // Extract budget/price
    const budgetSelectors = [
      '[data-test="budget"]',
      '.budget',
      '.up-card-label',
      'strong:contains("$")',
      '*[class*="budget"]',
      '*[class*="price"]'
    ];

    job.budget = this.extractBudgetFromElement(element);

    // Extract description
    const descriptionSelectors = [
      '[data-test="job-description"]',
      '.job-tile-description',
      '.up-card-body',
      'p',
      '.description'
    ];

    for (const selector of descriptionSelectors) {
      const descElement = element.querySelector(selector);
      if (descElement && descElement.textContent.length > 50) {
        job.description = this.cleanText(descElement.textContent).substring(0, 200) + '...';
        break;
      }
    }

    // Extract skills
    job.skills = this.extractSkills(element);

    // Extract posted time
    job.postedTime = this.extractPostedTime(element);

    // Extract proposals count
    job.proposals = this.extractProposals(element);

    // Extract client info
    job.clientInfo = this.extractClientInfo(element);

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
    return 'https://www.upwork.com' + url;
  }

  generateId() {
    return 'job_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
      const jobs = scraper.scrapeJobs(request.searchQuery || 'rails');
      const filteredJobs = scraper.filterJobs(jobs, request.searchQuery);
      
      console.log(`Returning ${filteredJobs.length} jobs to popup`);
      sendResponse({ 
        success: true, 
        jobs: filteredJobs,
        totalFound: jobs.length
      });
    } catch (error) {
      console.error('Error scraping jobs:', error);
      sendResponse({ 
        success: false, 
        error: error.message,
        jobs: []
      });
    }
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