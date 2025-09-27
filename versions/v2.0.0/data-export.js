// 📊 Advanced Data Export & Reporting Engine
class DataExportEngine {
  constructor() {
    this.exportFormats = ['json', 'csv', 'excel', 'pdf'];
    this.reportTypes = ['jobs', 'analytics', 'performance', 'market_insights'];
  }

  // Main export function
  async exportData(type, format, options = {}) {
    const data = await this.gatherData(type, options);
    
    switch (format) {
      case 'json':
        return this.exportToJSON(data, type);
      case 'csv':
        return this.exportToCSV(data, type);
      case 'excel':
        return this.exportToExcel(data, type);
      case 'pdf':
        return this.exportToPDF(data, type);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Gather data based on type
  async gatherData(type, options) {
    switch (type) {
      case 'jobs':
        return this.gatherJobsData(options);
      case 'analytics':
        return this.gatherAnalyticsData(options);
      case 'performance':
        return this.gatherPerformanceData(options);
      case 'market_insights':
        return this.gatherMarketInsightsData(options);
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }

  async gatherJobsData(options) {
    const result = await chrome.storage.local.get(['upwork_rails_jobs', 'job_history']);
    const jobs = result.upwork_rails_jobs || [];
    const history = result.job_history || [];

    const data = {
      metadata: {
        export_date: new Date().toISOString(),
        total_jobs: jobs.length,
        date_range: this.getDateRange(jobs),
        filters_applied: options.filters || {}
      },
      jobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        url: job.url,
        budget: job.budget,
        description: job.description?.substring(0, 200) + '...',
        skills: job.skills || [],
        posted_time: job.postedTime,
        proposals: job.proposals,
        client_info: job.clientInfo,
        scraped_at: job.scrapedAt,
        search_query: job.searchQuery,
        
        // AI Analysis
        ai_score: job.ai_analysis?.overall_score || 0,
        skill_match_score: job.ai_analysis?.skill_match_score || 0,
        quality_score: job.ai_analysis?.quality_score || 0,
        budget_score: job.ai_analysis?.budget_score || 0,
        competition_score: job.ai_analysis?.competition_score || 0,
        success_probability: job.ai_analysis?.success_probability || 0,
        detected_skills: job.ai_analysis?.detected_skills?.map(s => s.name) || [],
        ai_tags: job.ai_analysis?.tags || [],
        ai_recommendation: job.ai_analysis?.ai_recommendation || '',
        red_flags: job.ai_analysis?.red_flags || [],
        green_flags: job.ai_analysis?.green_flags || [],
        estimated_hourly_rate: job.ai_analysis?.estimated_hourly_rate || null,
        project_complexity: job.ai_analysis?.project_complexity || 'unknown'
      })),
      
      summary: {
        avg_ai_score: this.calculateAverage(jobs, 'ai_analysis.overall_score'),
        top_skills: this.getTopSkills(jobs),
        budget_distribution: this.getBudgetDistribution(jobs),
        quality_distribution: this.getQualityDistribution(jobs),
        competition_analysis: this.getCompetitionAnalysis(jobs),
        trending_keywords: this.getTrendingKeywords(jobs)
      }
    };

    return this.applyFilters(data, options.filters);
  }

  async gatherAnalyticsData(options) {
    const jobs = await this.gatherJobsData(options);
    const result = await chrome.storage.local.get(['analytics_history', 'scrape_history']);
    
    return {
      metadata: {
        export_date: new Date().toISOString(),
        analysis_period: options.period || '30_days'
      },
      
      job_analytics: {
        total_analyzed: jobs.jobs.length,
        avg_score: jobs.summary.avg_ai_score,
        score_distribution: this.getScoreDistribution(jobs.jobs),
        skill_demand: this.analyzeSkillDemand(jobs.jobs),
        budget_trends: this.analyzeBudgetTrends(jobs.jobs),
        competition_trends: this.analyzeCompetitionTrends(jobs.jobs),
        quality_trends: this.analyzeQualityTrends(jobs.jobs)
      },
      
      market_analytics: {
        trending_skills: this.identifyTrendingSkills(jobs.jobs),
        declining_skills: this.identifyDecliningSkills(jobs.jobs),
        seasonal_patterns: this.analyzeSeasonalPatterns(jobs.jobs),
        rate_benchmarks: this.calculateRateBenchmarks(jobs.jobs),
        opportunity_score: this.calculateOpportunityScore(jobs.jobs)
      },
      
      performance_metrics: {
        scraping_efficiency: this.calculateScrapingEfficiency(),
        ai_accuracy: this.calculateAIAccuracy(),
        recommendation_success: this.calculateRecommendationSuccess()
      }
    };
  }

  async gatherPerformanceData(options) {
    const result = await chrome.storage.local.get([
      'application_history', 
      'success_metrics', 
      'auto_apply_stats'
    ]);

    return {
      metadata: {
        export_date: new Date().toISOString(),
        period: options.period || '30_days'
      },
      
      application_metrics: {
        total_applications: result.application_history?.length || 0,
        auto_applications: result.auto_apply_stats?.total || 0,
        success_rate: this.calculateSuccessRate(result.application_history),
        response_rate: this.calculateResponseRate(result.application_history),
        interview_rate: this.calculateInterviewRate(result.application_history),
        hire_rate: this.calculateHireRate(result.application_history)
      },
      
      proposal_analytics: {
        avg_proposal_length: this.calculateAvgProposalLength(result.application_history),
        most_successful_templates: this.analyzeMostSuccessfulTemplates(result.application_history),
        keyword_performance: this.analyzeKeywordPerformance(result.application_history),
        customization_impact: this.analyzeCustomizationImpact(result.application_history)
      },
      
      time_analytics: {
        best_application_times: this.analyzeBestApplicationTimes(result.application_history),
        response_time_analysis: this.analyzeResponseTimes(result.application_history),
        seasonal_performance: this.analyzeSeasonalPerformance(result.application_history)
      },
      
      recommendations: this.generatePerformanceRecommendations(result)
    };
  }

  async gatherMarketInsightsData(options) {
    const jobs = await this.gatherJobsData(options);
    
    return {
      metadata: {
        export_date: new Date().toISOString(),
        market_analysis_period: options.period || '90_days'
      },
      
      skill_market: {
        hot_skills: this.identifyHotSkills(jobs.jobs),
        emerging_skills: this.identifyEmergingSkills(jobs.jobs),
        declining_skills: this.identifyDecliningSkills(jobs.jobs),
        skill_combinations: this.analyzeSkillCombinations(jobs.jobs),
        niche_opportunities: this.identifyNicheOpportunities(jobs.jobs)
      },
      
      budget_insights: {
        rate_trends: this.analyzeRateTrends(jobs.jobs),
        budget_by_skill: this.analyzeBudgetBySkill(jobs.jobs),
        premium_opportunities: this.identifyPremiumOpportunities(jobs.jobs),
        budget_forecasts: this.generateBudgetForecasts(jobs.jobs)
      },
      
      competition_analysis: {
        competition_by_skill: this.analyzeCompetitionBySkill(jobs.jobs),
        low_competition_niches: this.identifyLowCompetitionNiches(jobs.jobs),
        competition_trends: this.analyzeCompetitionTrends(jobs.jobs)
      },
      
      market_opportunities: {
        underserved_markets: this.identifyUnderservedMarkets(jobs.jobs),
        growth_areas: this.identifyGrowthAreas(jobs.jobs),
        seasonal_opportunities: this.identifySeasonalOpportunities(jobs.jobs),
        geographic_insights: this.analyzeGeographicInsights(jobs.jobs)
      },
      
      strategic_recommendations: this.generateStrategicRecommendations(jobs.jobs)
    };
  }

  // Export format implementations
  exportToJSON(data, type) {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const filename = `${type}_export_${this.getTimestamp()}.json`;
    
    this.downloadBlob(blob, filename);
    return { success: true, filename, size: blob.size };
  }

  exportToCSV(data, type) {
    let csvContent = '';
    
    if (type === 'jobs' && data.jobs) {
      // Create CSV headers
      const headers = [
        'Title', 'Budget', 'AI Score', 'Quality Score', 'Competition Score',
        'Skills', 'Posted Time', 'Proposals', 'Success Probability',
        'Project Complexity', 'AI Recommendation', 'URL'
      ];
      
      csvContent = headers.join(',') + '\n';
      
      // Add job data
      data.jobs.forEach(job => {
        const row = [
          this.csvEscape(job.title),
          this.csvEscape(job.budget),
          job.ai_score,
          job.quality_score,
          job.competition_score,
          this.csvEscape(job.detected_skills.join('; ')),
          this.csvEscape(job.posted_time),
          this.csvEscape(job.proposals),
          job.success_probability,
          job.project_complexity,
          this.csvEscape(job.ai_recommendation?.substring(0, 100) + '...'),
          job.url
        ];
        csvContent += row.join(',') + '\n';
      });
    } else {
      // Generic CSV export for other data types
      csvContent = this.convertToCSV(data);
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const filename = `${type}_export_${this.getTimestamp()}.csv`;
    
    this.downloadBlob(blob, filename);
    return { success: true, filename, size: blob.size };
  }

  exportToExcel(data, type) {
    // For Excel export, we'll create a more structured format
    // This would typically use a library like SheetJS
    const workbookData = this.prepareExcelData(data, type);
    
    // Simplified Excel-like format (would use proper library in production)
    const csvContent = this.convertToCSV(workbookData);
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const filename = `${type}_export_${this.getTimestamp()}.xls`;
    
    this.downloadBlob(blob, filename);
    return { success: true, filename, size: blob.size };
  }

  exportToPDF(data, type) {
    // Generate HTML report for PDF conversion
    const htmlReport = this.generateHTMLReport(data, type);
    
    // In a real implementation, you'd use a PDF library like jsPDF or Puppeteer
    // For now, we'll create an HTML file that can be printed to PDF
    const blob = new Blob([htmlReport], { type: 'text/html' });
    const filename = `${type}_report_${this.getTimestamp()}.html`;
    
    this.downloadBlob(blob, filename);
    return { success: true, filename, size: blob.size };
  }

  // Utility functions
  csvEscape(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  convertToCSV(data) {
    // Flatten nested objects for CSV export
    const flattened = this.flattenObject(data);
    const headers = Object.keys(flattened);
    const values = Object.values(flattened);
    
    return headers.join(',') + '\n' + values.map(v => this.csvEscape(v)).join(',');
  }

  flattenObject(obj, prefix = '') {
    const flattened = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join('; ');
      } else {
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  }

  generateHTMLReport(data, type) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Magic Upwork Assistant - ${type.toUpperCase()} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .section { margin-bottom: 30px; }
          .metric { display: inline-block; margin: 10px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #667eea; color: white; }
          .chart { height: 200px; background: #f0f0f0; margin: 20px 0; display: flex; align-items: center; justify-content: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🪄 Magic Upwork Assistant</h1>
          <h2>${type.toUpperCase()} Report</h2>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        ${this.generateReportContent(data, type)}
        
        <div class="footer" style="margin-top: 50px; text-align: center; color: #666;">
          <p>Report generated by Magic Upwork Assistant v2.0</p>
        </div>
      </body>
      </html>
    `;
  }

  generateReportContent(data, type) {
    switch (type) {
      case 'jobs':
        return this.generateJobsReport(data);
      case 'analytics':
        return this.generateAnalyticsReport(data);
      case 'performance':
        return this.generatePerformanceReport(data);
      case 'market_insights':
        return this.generateMarketInsightsReport(data);
      default:
        return '<p>Report content not available</p>';
    }
  }

  generateJobsReport(data) {
    return `
      <div class="section">
        <h3>📊 Summary</h3>
        <div class="metric">Total Jobs: ${data.metadata.total_jobs}</div>
        <div class="metric">Avg AI Score: ${data.summary.avg_ai_score}%</div>
        <div class="metric">Date Range: ${data.metadata.date_range}</div>
      </div>
      
      <div class="section">
        <h3>🎯 Top Jobs</h3>
        <table>
          <tr>
            <th>Title</th>
            <th>AI Score</th>
            <th>Budget</th>
            <th>Skills</th>
          </tr>
          ${data.jobs.slice(0, 10).map(job => `
            <tr>
              <td>${job.title}</td>
              <td>${job.ai_score}%</td>
              <td>${job.budget}</td>
              <td>${job.detected_skills.slice(0, 3).join(', ')}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  }

  // Analytics helper functions
  calculateAverage(items, path) {
    const values = items.map(item => this.getNestedValue(item, path)).filter(v => v !== null);
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj) || 0;
  }

  getDateRange(jobs) {
    if (!jobs.length) return 'No data';
    const dates = jobs.map(job => new Date(job.scrapedAt)).sort();
    const start = dates[0].toLocaleDateString();
    const end = dates[dates.length - 1].toLocaleDateString();
    return start === end ? start : `${start} - ${end}`;
  }

  applyFilters(data, filters) {
    if (!filters) return data;
    
    // Apply date filter
    if (filters.dateFrom || filters.dateTo) {
      data.jobs = data.jobs.filter(job => {
        const jobDate = new Date(job.scraped_at);
        if (filters.dateFrom && jobDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && jobDate > new Date(filters.dateTo)) return false;
        return true;
      });
    }
    
    // Apply score filter
    if (filters.minScore) {
      data.jobs = data.jobs.filter(job => job.ai_score >= filters.minScore);
    }
    
    // Apply skill filter
    if (filters.skills?.length) {
      data.jobs = data.jobs.filter(job => 
        filters.skills.some(skill => 
          job.detected_skills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    return data;
  }

  // Placeholder implementations for complex analytics
  getTopSkills(jobs) {
    const skillCounts = {};
    jobs.forEach(job => {
      job.ai_analysis?.detected_skills?.forEach(skill => {
        skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
      });
    });
    
    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  }

  getBudgetDistribution(jobs) {
    const ranges = { low: 0, medium: 0, high: 0, unspecified: 0 };
    
    jobs.forEach(job => {
      const rate = job.ai_analysis?.estimated_hourly_rate;
      if (!rate) ranges.unspecified++;
      else if (rate < 30) ranges.low++;
      else if (rate < 75) ranges.medium++;
      else ranges.high++;
    });
    
    return ranges;
  }

  getQualityDistribution(jobs) {
    const ranges = { excellent: 0, good: 0, fair: 0, poor: 0 };
    
    jobs.forEach(job => {
      const score = job.ai_analysis?.overall_score || 0;
      if (score >= 85) ranges.excellent++;
      else if (score >= 70) ranges.good++;
      else if (score >= 50) ranges.fair++;
      else ranges.poor++;
    });
    
    return ranges;
  }

  getCompetitionAnalysis(jobs) {
    // Placeholder implementation
    return {
      low_competition: jobs.filter(job => (job.ai_analysis?.competition_score || 0) >= 70).length,
      medium_competition: jobs.filter(job => {
        const score = job.ai_analysis?.competition_score || 0;
        return score >= 40 && score < 70;
      }).length,
      high_competition: jobs.filter(job => (job.ai_analysis?.competition_score || 0) < 40).length
    };
  }

  getTrendingKeywords(jobs) {
    // Placeholder implementation
    const keywords = {};
    jobs.forEach(job => {
      const text = `${job.title} ${job.description}`.toLowerCase();
      const words = text.match(/\b\w{4,}\b/g) || [];
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });
    
    return Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataExportEngine;
} else {
  window.DataExportEngine = DataExportEngine;
}
