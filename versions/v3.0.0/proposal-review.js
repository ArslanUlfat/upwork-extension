/**
 * Upwork Extension v3.0.0 - Proposal Review JavaScript
 * Custom implementation for AI proposal generation and review
 */

class ProposalReview {
  constructor() {
    this.currentJobData = null;
    this.originalProposal = '';
    this.templates = {
      template1: {
        subject: "Professional Frontend Developer - Ready to Deliver Excellence",
        content: `Dear Hiring Manager,

I am excited to submit my proposal for your Senior Frontend Developer position. With [X] years of specialized experience in React and TypeScript, I have successfully delivered [number] projects that align perfectly with your requirements.

**What I bring to your project:**
• Expert-level proficiency in React, TypeScript, and modern frontend frameworks
• Strong understanding of responsive design and cross-browser compatibility
• Experience with state management (Redux, Context API) and testing frameworks
• Proven track record of delivering projects on time and within budget

**My approach:**
1. Thorough analysis of your project requirements
2. Clean, maintainable code following industry best practices
3. Regular communication and progress updates
4. Comprehensive testing and quality assurance

I would love to discuss how my expertise can contribute to your project's success. I'm available for a quick call to understand your specific needs better.

Best regards,
[Your Name]`
      },
      template2: {
        subject: "Quick Response - Frontend Developer Available",
        content: `Hi there!

I just saw your Senior Frontend Developer posting and I'm very interested! 

**Quick highlights:**
• [X] years React & TypeScript experience
• Available to start immediately
• Strong portfolio of similar projects
• Excellent communication & fast turnaround

I'd love to chat about your project requirements. When would be a good time for a brief call?

Looking forward to working together!

[Your Name]`
      },
      template3: {
        subject: "React Specialist - Perfect Match for Your Project",
        content: `Hello,

As a React specialist with deep expertise in TypeScript, I'm confident I'm the perfect fit for your Senior Frontend Developer role.

**My React expertise includes:**
• Advanced React patterns (Hooks, Context, HOCs)
• TypeScript integration and type safety
• Performance optimization and code splitting
• Modern tooling (Webpack, Vite, Next.js)
• Testing with Jest, React Testing Library

**Recent relevant work:**
• [Project 1]: Built scalable React application serving 10k+ users
• [Project 2]: Migrated legacy codebase to TypeScript
• [Project 3]: Implemented complex UI components with 99% test coverage

I'm excited about the opportunity to bring my React expertise to your team. Let's discuss how I can help achieve your project goals.

Best regards,
[Your Name]`
      }
    };
    this.init();
  }

  init() {
    this.loadJobData();
    this.updateWordCount();
    this.setupEventListeners();
    this.detectTheme();
  }

  loadJobData() {
    // Try to get job data from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const jobTitle = urlParams.get('job') || 'Unknown Job';
    const jobUrl = urlParams.get('url') || '#';
    
    // Try to get from localStorage if not in URL
    if (jobTitle === 'Unknown Job') {
      const savedJobData = localStorage.getItem('current_job_for_proposal');
      if (savedJobData) {
        try {
          this.currentJobData = JSON.parse(savedJobData);
          this.updateProposalForJob();
        } catch (error) {
          console.error('Error loading job data:', error);
        }
      }
    } else {
      this.currentJobData = { title: jobTitle, url: jobUrl };
      this.updateProposalForJob();
    }
  }

  updateProposalForJob() {
    if (!this.currentJobData) return;

    const subjectElement = document.getElementById('proposal-subject');
    const textArea = document.getElementById('proposal-text');
    
    if (subjectElement) {
      subjectElement.textContent = `Subject: Proposal for ${this.currentJobData.title}`;
    }

    // Generate personalized proposal based on job data
    if (textArea && !this.originalProposal) {
      const personalizedProposal = this.generatePersonalizedProposal();
      textArea.value = personalizedProposal;
      this.originalProposal = personalizedProposal;
      this.updateWordCount();
    }
  }

  generatePersonalizedProposal() {
    const jobTitle = this.currentJobData?.title || 'this position';
    const skills = this.extractSkillsFromTitle(jobTitle);
    
    return `Hello,

I am writing to express my strong interest in the "${jobTitle}" position. With extensive experience in ${skills.join(', ')}, I am confident I can deliver exceptional results for your project.

**Why I'm the right fit:**
• Proven expertise in ${skills[0] || 'frontend development'} with a track record of successful projects
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

  extractSkillsFromTitle(title) {
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

  setupEventListeners() {
    // Theme detection
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', () => this.detectTheme());
  }

  detectTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme-preference');
    
    if (savedTheme) {
      document.body.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }

  updateWordCount() {
    const textarea = document.getElementById('proposal-text');
    const wordCountElement = document.getElementById('word-count-text');
    const charCountElement = document.getElementById('char-count-text');
    
    if (!textarea || !wordCountElement || !charCountElement) return;
    
    const text = textarea.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    
    wordCountElement.textContent = `${words} Words`;
    charCountElement.textContent = `${characters} Characters`;
  }

  handleTemplateChange() {
    const select = document.getElementById('template-select');
    const textarea = document.getElementById('proposal-text');
    const subjectElement = document.getElementById('proposal-subject');
    
    if (!select || !textarea) return;
    
    const templateKey = select.value;
    
    if (templateKey && this.templates[templateKey]) {
      const template = this.templates[templateKey];
      
      // Update subject
      if (subjectElement) {
        subjectElement.textContent = `Subject: ${template.subject}`;
      }
      
      // Update content
      textarea.value = template.content;
      this.updateWordCount();
      
      this.showNotification('Template applied successfully!', 'success');
    } else {
      // Reset to original
      if (this.originalProposal) {
        textarea.value = this.originalProposal;
        this.updateWordCount();
      }
      
      // Reset subject
      if (subjectElement && this.currentJobData) {
        subjectElement.textContent = `Subject: Proposal for ${this.currentJobData.title}`;
      }
    }
  }

  async proofreadProposal() {
    const textarea = document.getElementById('proposal-text');
    if (!textarea) return;
    
    const text = textarea.value;
    if (!text.trim()) {
      this.showNotification('Please enter some text to proofread', 'warning');
      return;
    }
    
    // Simple proofreading suggestions
    const suggestions = this.getProofreadingSuggestions(text);
    
    if (suggestions.length === 0) {
      this.showNotification('✓ No obvious issues found!', 'success');
    } else {
      const message = `Proofreading suggestions:\n\n${suggestions.join('\n')}`;
      alert(message);
    }
  }

  getProofreadingSuggestions(text) {
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
    
    if (!text.toLowerCase().includes('experience')) {
      suggestions.push('• Consider mentioning your relevant experience');
    }
    
    return suggestions;
  }

  regenerateProposal() {
    const confirmRegenerate = confirm('Are you sure you want to regenerate the proposal?\n\nThis will replace your current text with a new AI-generated version.');
    
    if (confirmRegenerate) {
      this.showNotification('Regenerating proposal...', 'info');
      
      // Simulate AI regeneration delay
      setTimeout(() => {
        const textarea = document.getElementById('proposal-text');
        if (textarea) {
          const newProposal = this.generateAlternativeProposal();
          textarea.value = newProposal;
          this.updateWordCount();
          this.showNotification('New proposal generated!', 'success');
        }
      }, 2000);
    }
  }

  generateAlternativeProposal() {
    const alternatives = [
      `Dear Client,

I'm excited about your ${this.currentJobData?.title || 'project'} and believe I'm an excellent match for your requirements.

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

I'd be happy to discuss your project requirements in detail and provide examples of my relevant work.

Looking forward to collaborating with you!

Best regards,
[Your Name]`,

      `Hi there!

Your ${this.currentJobData?.title || 'project'} caught my attention, and I'm confident I can deliver exactly what you're looking for.

**Why choose me:**
• Proven track record with similar projects
• Fast turnaround without compromising quality
• Proactive communication throughout the project
• Competitive pricing with exceptional value

**My process:**
1. Detailed project analysis and planning
2. Regular milestone deliveries for your review
3. Iterative feedback and refinements
4. Final delivery with full documentation

I'm available to start immediately and would love to discuss your specific needs.

Best,
[Your Name]`
    ];
    
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  rejectProposal() {
    const confirmReject = confirm('Are you sure you want to reject this proposal?\n\nThis will close the proposal review and return to the job list.');
    
    if (confirmReject) {
      this.showNotification('Proposal rejected', 'info');
      setTimeout(() => {
        this.goBack();
      }, 1000);
    }
  }

  async acceptAndSend() {
    const textarea = document.getElementById('proposal-text');
    if (!textarea || !textarea.value.trim()) {
      this.showNotification('Please enter a proposal before sending', 'warning');
      return;
    }
    
    const confirmSend = confirm('Ready to send this proposal?\n\nThis will open Upwork in a new tab with your proposal ready to submit.');
    
    if (confirmSend) {
      // Save proposal to localStorage for potential reuse
      this.saveProposalDraft();
      
      // Open Upwork job page if available
      if (this.currentJobData?.url && this.currentJobData.url !== '#') {
        chrome.tabs.create({ url: this.currentJobData.url });
      }
      
      this.showNotification('Opening Upwork... Copy your proposal and submit!', 'success');
      
      // Copy proposal to clipboard if possible
      try {
        await navigator.clipboard.writeText(textarea.value);
        this.showNotification('Proposal copied to clipboard!', 'success');
      } catch (error) {
        console.log('Could not copy to clipboard:', error);
      }
      
      setTimeout(() => {
        this.goBack();
      }, 2000);
    }
  }

  saveProposalDraft() {
    const textarea = document.getElementById('proposal-text');
    if (!textarea) return;
    
    const draft = {
      jobTitle: this.currentJobData?.title || 'Unknown Job',
      proposal: textarea.value,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    const drafts = JSON.parse(localStorage.getItem('proposal_drafts') || '[]');
    drafts.unshift(draft);
    
    // Keep only last 10 drafts
    if (drafts.length > 10) {
      drafts.splice(10);
    }
    
    localStorage.setItem('proposal_drafts', JSON.stringify(drafts));
  }

  goBack() {
    // Try to go back in history, or close window if opened as popup
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'var(--primary-color)' : type === 'error' ? 'var(--red-500)' : type === 'warning' ? 'var(--warning)' : 'var(--blue-500)'};
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
function goBack() {
  if (window.proposalReview) {
    window.proposalReview.goBack();
  }
}

function handleTemplateChange() {
  if (window.proposalReview) {
    window.proposalReview.handleTemplateChange();
  }
}

function updateWordCount() {
  if (window.proposalReview) {
    window.proposalReview.updateWordCount();
  }
}

function proofreadProposal() {
  if (window.proposalReview) {
    window.proposalReview.proofreadProposal();
  }
}

function rejectProposal() {
  if (window.proposalReview) {
    window.proposalReview.rejectProposal();
  }
}

function regenerateProposal() {
  if (window.proposalReview) {
    window.proposalReview.regenerateProposal();
  }
}

function acceptAndSend() {
  if (window.proposalReview) {
    window.proposalReview.acceptAndSend();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.proposalReview = new ProposalReview();
  console.log('Proposal Review v3.0.0 initialized');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProposalReview;
}
