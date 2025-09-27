// 🔔 Advanced Smart Notification Engine
class NotificationEngine {
  constructor() {
    this.channels = ['browser', 'slack', 'email', 'webhook'];
    this.notificationHistory = [];
    this.settings = {
      enabled: true,
      channels: {
        browser: { enabled: true, priority: 'all' },
        slack: { enabled: false, priority: 'high', webhook_url: '' },
        email: { enabled: false, priority: 'high', email: '' },
        webhook: { enabled: false, priority: 'medium', url: '' }
      },
      filters: {
        min_score: 70,
        max_per_hour: 5,
        keywords: [],
        exclude_keywords: [],
        budget_min: 0
      },
      quiet_hours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
    
    this.templates = this.initializeTemplates();
    this.loadSettings();
  }

  initializeTemplates() {
    return {
      browser: {
        new_jobs: {
          title: '🎯 {count} New High-Quality Jobs Found!',
          body: 'AI Score: {avg_score}% | Budget: {budget_range}',
          icon: '/icons/icon48.png'
        },
        perfect_match: {
          title: '⭐ Perfect Job Match Found!',
          body: '{title} - AI Score: {score}% | {budget}',
          icon: '/icons/icon48.png'
        },
        auto_applied: {
          title: '🤖 Auto-Applied to Job',
          body: '{title} - Proposal sent successfully!',
          icon: '/icons/icon48.png'
        },
        market_alert: {
          title: '📈 Market Opportunity Alert',
          body: '{skill} demand increased by {growth}%',
          icon: '/icons/icon48.png'
        }
      },
      slack: {
        new_jobs: {
          text: ':dart: *{count} New High-Quality Jobs Found!*',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':rocket: *Magic Upwork Assistant found {count} new opportunities!*\n\n:chart_with_upwards_trend: *Average AI Score:* {avg_score}%\n:moneybag: *Budget Range:* {budget_range}\n:clock1: *Found at:* {timestamp}'
              }
            },
            {
              type: 'divider'
            }
          ]
        },
        perfect_match: {
          text: ':star: Perfect Job Match Found!',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':star2: *PERFECT MATCH ALERT!*\n\n*Job:* {title}\n*AI Score:* {score}%\n*Budget:* {budget}\n*Competition:* {competition}\n*Skills:* {skills}'
              },
              accessory: {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Job'
                },
                url: '{url}'
              }
            }
          ]
        },
        auto_applied: {
          text: ':robot_face: Auto-Applied to Job',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':robot_face: *Auto-Application Sent!*\n\n*Job:* {title}\n*Confidence:* {confidence}%\n*Proposal Length:* {proposal_length} words\n*Applied at:* {timestamp}'
              }
            }
          ]
        },
        daily_summary: {
          text: ':bar_chart: Daily Job Market Summary',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':bar_chart: *Daily Summary - {date}*\n\n:mag: *Jobs Analyzed:* {total_jobs}\n:dart: *High-Quality Matches:* {quality_matches}\n:robot_face: *Auto-Applications:* {auto_applications}\n:chart_with_upwards_trend: *Top Trending Skill:* {trending_skill}\n:moneybag: *Average Budget:* ${avg_budget}/hr'
              }
            }
          ]
        }
      },
      email: {
        subject_templates: {
          new_jobs: '🎯 {count} New High-Quality Jobs - Magic Upwork Assistant',
          perfect_match: '⭐ Perfect Job Match Found - {title}',
          daily_summary: '📊 Daily Job Market Summary - {date}',
          weekly_report: '📈 Weekly Performance Report - Magic Upwork Assistant'
        },
        body_templates: {
          new_jobs: `
            <h2>🎯 New High-Quality Jobs Found!</h2>
            <p>Your Magic Upwork Assistant has discovered <strong>{count} new opportunities</strong> that match your criteria.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📊 Quick Stats</h3>
              <ul>
                <li><strong>Average AI Score:</strong> {avg_score}%</li>
                <li><strong>Budget Range:</strong> {budget_range}</li>
                <li><strong>Competition Level:</strong> {competition_level}</li>
                <li><strong>Top Skills:</strong> {top_skills}</li>
              </ul>
            </div>
            
            <h3>🔥 Top Matches</h3>
            {job_list}
            
            <p><a href="https://www.upwork.com" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View All Jobs on Upwork</a></p>
          `,
          perfect_match: `
            <h2>⭐ Perfect Job Match Found!</h2>
            <p>This job is an excellent match for your skills and preferences.</p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0;">
              <h3>{title}</h3>
              <p><strong>AI Score:</strong> {score}%</p>
              <p><strong>Budget:</strong> {budget}</p>
              <p><strong>Skills Required:</strong> {skills}</p>
              <p><strong>Competition:</strong> {competition}</p>
            </div>
            
            <h3>🤖 AI Recommendation</h3>
            <p>{ai_recommendation}</p>
            
            <p><a href="{url}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Apply Now</a></p>
          `
        }
      }
    };
  }

  // Main notification dispatch function
  async sendNotification(type, data, priority = 'medium') {
    if (!this.settings.enabled) return;

    // Check quiet hours
    if (this.isQuietHours()) {
      this.queueNotification(type, data, priority);
      return;
    }

    // Check rate limiting
    if (this.isRateLimited()) {
      console.log('Notification rate limited');
      return;
    }

    // Send to enabled channels based on priority
    const promises = [];
    
    Object.entries(this.settings.channels).forEach(([channel, config]) => {
      if (config.enabled && this.shouldSendToChannel(priority, config.priority)) {
        promises.push(this.sendToChannel(channel, type, data));
      }
    });

    try {
      await Promise.all(promises);
      this.logNotification(type, data, priority);
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  // Send to specific channels
  async sendToChannel(channel, type, data) {
    switch (channel) {
      case 'browser':
        return this.sendBrowserNotification(type, data);
      case 'slack':
        return this.sendSlackNotification(type, data);
      case 'email':
        return this.sendEmailNotification(type, data);
      case 'webhook':
        return this.sendWebhookNotification(type, data);
      default:
        console.warn(`Unknown notification channel: ${channel}`);
    }
  }

  async sendBrowserNotification(type, data) {
    const template = this.templates.browser[type];
    if (!template) return;

    const title = this.processTemplate(template.title, data);
    const body = this.processTemplate(template.body, data);

    // Request permission if needed
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: template.icon,
        badge: template.icon,
        tag: type,
        requireInteraction: data.priority === 'high',
        actions: this.getBrowserActions(type, data)
      });

      // Auto-close after 10 seconds unless high priority
      if (data.priority !== 'high') {
        setTimeout(() => notification.close(), 10000);
      }

      // Handle clicks
      notification.onclick = () => {
        this.handleNotificationClick(type, data);
        notification.close();
      };

      return notification;
    }
  }

  async sendSlackNotification(type, data) {
    const webhookUrl = this.settings.channels.slack.webhook_url;
    if (!webhookUrl) return;

    const template = this.templates.slack[type];
    if (!template) return;

    const payload = {
      text: this.processTemplate(template.text, data),
      blocks: template.blocks?.map(block => ({
        ...block,
        text: block.text ? {
          ...block.text,
          text: this.processTemplate(block.text.text, data)
        } : block.text
      }))
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Slack notification error:', error);
      throw error;
    }
  }

  async sendEmailNotification(type, data) {
    // This would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll just log the email content
    const subject = this.processTemplate(
      this.templates.email.subject_templates[type], 
      data
    );
    const body = this.processTemplate(
      this.templates.email.body_templates[type], 
      data
    );

    console.log('Email notification (would be sent):', { subject, body });
    
    // In a real implementation, you'd send via email API:
    // return this.emailService.send(this.settings.channels.email.email, subject, body);
  }

  async sendWebhookNotification(type, data) {
    const webhookUrl = this.settings.channels.webhook.url;
    if (!webhookUrl) return;

    const payload = {
      type: type,
      data: data,
      timestamp: new Date().toISOString(),
      source: 'magic-upwork-assistant'
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook notification failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Webhook notification error:', error);
      throw error;
    }
  }

  // Smart notification triggers
  async notifyNewJobs(jobs) {
    if (!jobs.length) return;

    // Filter jobs based on criteria
    const qualityJobs = jobs.filter(job => 
      (job.ai_analysis?.overall_score || 0) >= this.settings.filters.min_score
    );

    if (qualityJobs.length === 0) return;

    const data = {
      count: qualityJobs.length,
      avg_score: Math.round(
        qualityJobs.reduce((sum, job) => sum + (job.ai_analysis?.overall_score || 0), 0) / qualityJobs.length
      ),
      budget_range: this.getBudgetRange(qualityJobs),
      competition_level: this.getCompetitionLevel(qualityJobs),
      top_skills: this.getTopSkills(qualityJobs),
      timestamp: new Date().toLocaleString(),
      job_list: this.formatJobList(qualityJobs.slice(0, 3))
    };

    await this.sendNotification('new_jobs', data, 'medium');

    // Send perfect match notifications for exceptional jobs
    const perfectMatches = qualityJobs.filter(job => 
      (job.ai_analysis?.overall_score || 0) >= 90
    );

    for (const job of perfectMatches) {
      await this.notifyPerfectMatch(job);
    }
  }

  async notifyPerfectMatch(job) {
    const analysis = job.ai_analysis || {};
    
    const data = {
      title: job.title,
      score: analysis.overall_score || 0,
      budget: job.budget || 'Not specified',
      competition: job.proposals || 'Unknown',
      skills: analysis.detected_skills?.slice(0, 3).map(s => s.name).join(', ') || 'N/A',
      ai_recommendation: analysis.ai_recommendation || 'Excellent match!',
      url: job.url,
      confidence: analysis.success_probability || 0
    };

    await this.sendNotification('perfect_match', data, 'high');
  }

  async notifyAutoApplied(job, proposal) {
    const data = {
      title: job.title,
      confidence: proposal.confidence_score || 0,
      proposal_length: proposal.proposal_text?.split(' ').length || 0,
      timestamp: new Date().toLocaleString()
    };

    await this.sendNotification('auto_applied', data, 'medium');
  }

  async sendDailySummary(stats) {
    const data = {
      date: new Date().toLocaleDateString(),
      total_jobs: stats.total_jobs || 0,
      quality_matches: stats.quality_matches || 0,
      auto_applications: stats.auto_applications || 0,
      trending_skill: stats.trending_skill || 'N/A',
      avg_budget: stats.avg_budget || 0
    };

    await this.sendNotification('daily_summary', data, 'low');
  }

  // Utility functions
  processTemplate(template, data) {
    if (!template) return '';
    
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  getBudgetRange(jobs) {
    const budgets = jobs
      .map(job => this.extractBudgetNumber(job.budget))
      .filter(budget => budget > 0);
    
    if (budgets.length === 0) return 'Various';
    
    const min = Math.min(...budgets);
    const max = Math.max(...budgets);
    
    return min === max ? `$${min}/hr` : `$${min}-${max}/hr`;
  }

  getCompetitionLevel(jobs) {
    const avgProposals = jobs.reduce((sum, job) => {
      const proposals = parseInt(job.proposals?.match(/\d+/)?.[0] || '0');
      return sum + proposals;
    }, 0) / jobs.length;

    if (avgProposals <= 10) return 'Low';
    if (avgProposals <= 25) return 'Medium';
    return 'High';
  }

  getTopSkills(jobs) {
    const skillCounts = {};
    
    jobs.forEach(job => {
      job.ai_analysis?.detected_skills?.forEach(skill => {
        skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([skill]) => skill)
      .join(', ');
  }

  formatJobList(jobs) {
    return jobs.map(job => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0;">
        <h4>${job.title}</h4>
        <p><strong>AI Score:</strong> ${job.ai_analysis?.overall_score || 0}%</p>
        <p><strong>Budget:</strong> ${job.budget || 'Not specified'}</p>
        <p><a href="${job.url}" target="_blank">View Job →</a></p>
      </div>
    `).join('');
  }

  extractBudgetNumber(budgetStr) {
    if (!budgetStr) return 0;
    const match = budgetStr.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  getBrowserActions(type, data) {
    switch (type) {
      case 'perfect_match':
        return [
          { action: 'view', title: 'View Job' },
          { action: 'apply', title: 'Quick Apply' }
        ];
      case 'new_jobs':
        return [
          { action: 'view_all', title: 'View All' },
          { action: 'dismiss', title: 'Dismiss' }
        ];
      default:
        return [];
    }
  }

  handleNotificationClick(type, data) {
    switch (type) {
      case 'perfect_match':
        chrome.tabs.create({ url: data.url });
        break;
      case 'new_jobs':
        chrome.tabs.create({ url: 'https://www.upwork.com/nx/search/jobs' });
        break;
      default:
        // Open extension popup
        chrome.action.openPopup();
    }
  }

  // Rate limiting and quiet hours
  isRateLimited() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentNotifications = this.notificationHistory.filter(
      notification => now - notification.timestamp < oneHour
    );
    
    return recentNotifications.length >= this.settings.filters.max_per_hour;
  }

  isQuietHours() {
    if (!this.settings.quiet_hours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = this.parseTime(this.settings.quiet_hours.start);
    const endTime = this.parseTime(this.settings.quiet_hours.end);
    
    if (startTime > endTime) {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      // Same day quiet hours
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 100 + minutes;
  }

  shouldSendToChannel(notificationPriority, channelPriority) {
    const priorities = { low: 1, medium: 2, high: 3, all: 0 };
    return priorities[channelPriority] === 0 || 
           priorities[notificationPriority] >= priorities[channelPriority];
  }

  queueNotification(type, data, priority) {
    // Store notification for later delivery
    const queuedNotification = {
      type,
      data,
      priority,
      queued_at: Date.now()
    };
    
    chrome.storage.local.get(['queued_notifications'], (result) => {
      const queue = result.queued_notifications || [];
      queue.push(queuedNotification);
      chrome.storage.local.set({ queued_notifications: queue });
    });
  }

  logNotification(type, data, priority) {
    this.notificationHistory.push({
      type,
      priority,
      timestamp: Date.now(),
      data: { ...data }
    });

    // Keep only last 100 notifications
    if (this.notificationHistory.length > 100) {
      this.notificationHistory = this.notificationHistory.slice(-100);
    }
  }

  // Settings management
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  async saveSettings() {
    await chrome.storage.local.set({ 'notification_settings': this.settings });
  }

  async loadSettings() {
    const result = await chrome.storage.local.get(['notification_settings']);
    if (result.notification_settings) {
      this.settings = { ...this.settings, ...result.notification_settings };
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationEngine;
} else {
  window.NotificationEngine = NotificationEngine;
}
