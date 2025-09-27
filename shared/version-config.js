/**
 * 🪄 Magic Upwork Assistant - Version Configuration
 * Manages features and capabilities across different versions
 */

const VERSION_CONFIG = {
  // Current version info
  CURRENT_VERSION: "2.0.0",
  VERSION_NAME: "Magic Stick Edition",
  RELEASE_DATE: "2024-01-15",
  
  // Version definitions
  VERSIONS: {
    "1.0.0": {
      name: "Basic Scraper",
      codename: "Foundation",
      releaseDate: "2023-12-01",
      description: "Essential job scraping and basic filtering",
      features: {
        // Core features
        jobScraping: true,
        basicFiltering: true,
        slackIntegration: true,
        jsonExport: true,
        
        // Advanced features (disabled in v1.0.0)
        aiAnalysis: false,
        autoApply: false,
        analytics: false,
        darkMode: false,
        smartNotifications: false,
        profileOptimization: false,
        advancedExport: false,
        marketInsights: false,
        webhookIntegration: false,
        customProposals: false
      },
      ui: {
        theme: "basic",
        popup: "popup.html",
        css: "popup.css",
        js: "popup.js"
      }
    },
    
    "2.0.0": {
      name: "Magic Stick Edition",
      codename: "Transformation",
      releaseDate: "2024-01-15",
      description: "AI-powered analysis with auto-apply and advanced features",
      features: {
        // Core features (enhanced)
        jobScraping: true,
        basicFiltering: true,
        slackIntegration: true,
        jsonExport: true,
        
        // Advanced features (enabled in v2.0.0)
        aiAnalysis: true,
        autoApply: true,
        analytics: true,
        darkMode: true,
        smartNotifications: true,
        profileOptimization: true,
        advancedExport: true,
        marketInsights: true,
        webhookIntegration: true,
        customProposals: true
      },
      ui: {
        theme: "modern",
        popup: "popup-pro.html",
        css: "popup-pro.css",
        js: "popup-pro.js"
      }
    },
    
    "3.0.0": {
      name: "AI Master Edition",
      codename: "Evolution",
      releaseDate: "2024-06-01",
      description: "Next-gen AI with GPT-4, team features, and mobile app",
      features: {
        // All v2.0.0 features plus
        jobScraping: true,
        basicFiltering: true,
        slackIntegration: true,
        jsonExport: true,
        aiAnalysis: true,
        autoApply: true,
        analytics: true,
        darkMode: true,
        smartNotifications: true,
        profileOptimization: true,
        advancedExport: true,
        marketInsights: true,
        webhookIntegration: true,
        customProposals: true,
        
        // New v3.0.0 features
        gpt4Integration: true,
        teamFeatures: true,
        mobileApp: true,
        clientInsights: true,
        automatedFollowups: true,
        videoProposals: true,
        portfolioOptimization: true,
        rateNegotiation: true,
        projectManagement: true
      },
      ui: {
        theme: "next-gen",
        popup: "popup-ai.html",
        css: "popup-ai.css",
        js: "popup-ai.js"
      }
    }
  },
  
  // Feature flags for gradual rollout
  FEATURE_FLAGS: {
    // Experimental features
    betaFeatures: false,
    debugMode: false,
    performanceMetrics: true,
    
    // A/B testing flags
    newProposalEngine: false,
    enhancedAnalytics: true,
    improvedNotifications: true
  },
  
  // Migration settings
  MIGRATION: {
    autoMigrate: true,
    backupData: true,
    preserveSettings: true,
    migrationPrompt: true
  }
};

/**
 * Version Manager Class
 * Handles version checking, feature availability, and migrations
 */
class VersionManager {
  constructor() {
    this.currentVersion = VERSION_CONFIG.CURRENT_VERSION;
    this.versionData = VERSION_CONFIG.VERSIONS[this.currentVersion];
  }
  
  /**
   * Check if a feature is available in the current version
   * @param {string} featureName - Name of the feature to check
   * @returns {boolean} - Whether the feature is available
   */
  isFeatureAvailable(featureName) {
    return this.versionData?.features?.[featureName] || false;
  }
  
  /**
   * Get current version information
   * @returns {object} - Version information object
   */
  getCurrentVersionInfo() {
    return {
      version: this.currentVersion,
      name: this.versionData?.name || "Unknown",
      codename: this.versionData?.codename || "",
      description: this.versionData?.description || "",
      releaseDate: this.versionData?.releaseDate || "",
      features: this.versionData?.features || {}
    };
  }
  
  /**
   * Get UI configuration for current version
   * @returns {object} - UI configuration
   */
  getUIConfig() {
    return this.versionData?.ui || VERSION_CONFIG.VERSIONS["1.0.0"].ui;
  }
  
  /**
   * Compare two versions
   * @param {string} version1 - First version
   * @param {string} version2 - Second version
   * @returns {number} - -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }
  
  /**
   * Check if an upgrade is available
   * @returns {object|null} - Upgrade information or null
   */
  checkForUpgrade() {
    const availableVersions = Object.keys(VERSION_CONFIG.VERSIONS);
    const newerVersions = availableVersions.filter(version => 
      this.compareVersions(version, this.currentVersion) > 0
    );
    
    if (newerVersions.length > 0) {
      const latestVersion = newerVersions.sort((a, b) => 
        this.compareVersions(b, a)
      )[0];
      
      return {
        available: true,
        version: latestVersion,
        info: VERSION_CONFIG.VERSIONS[latestVersion]
      };
    }
    
    return null;
  }
  
  /**
   * Get version changelog
   * @param {string} fromVersion - Starting version
   * @param {string} toVersion - Target version
   * @returns {array} - Array of changes
   */
  getChangelog(fromVersion, toVersion) {
    const fromFeatures = VERSION_CONFIG.VERSIONS[fromVersion]?.features || {};
    const toFeatures = VERSION_CONFIG.VERSIONS[toVersion]?.features || {};
    
    const changes = [];
    
    // Find new features
    Object.keys(toFeatures).forEach(feature => {
      if (toFeatures[feature] && !fromFeatures[feature]) {
        changes.push({
          type: 'new',
          feature: feature,
          description: this.getFeatureDescription(feature)
        });
      }
    });
    
    // Find removed features
    Object.keys(fromFeatures).forEach(feature => {
      if (fromFeatures[feature] && !toFeatures[feature]) {
        changes.push({
          type: 'removed',
          feature: feature,
          description: this.getFeatureDescription(feature)
        });
      }
    });
    
    return changes;
  }
  
  /**
   * Get human-readable feature description
   * @param {string} featureName - Feature name
   * @returns {string} - Feature description
   */
  getFeatureDescription(featureName) {
    const descriptions = {
      jobScraping: "Extract job listings from Upwork search pages",
      basicFiltering: "Filter jobs by keywords and basic criteria",
      slackIntegration: "Send notifications to Slack channels",
      jsonExport: "Export job data in JSON format",
      aiAnalysis: "AI-powered job analysis and scoring",
      autoApply: "Automated job application system",
      analytics: "Advanced analytics and market insights",
      darkMode: "Dark theme support",
      smartNotifications: "Intelligent notification system",
      profileOptimization: "AI-powered profile optimization suggestions",
      advancedExport: "Export in multiple formats (CSV, Excel, PDF)",
      marketInsights: "Real-time market analysis and trends",
      webhookIntegration: "Custom webhook integrations",
      customProposals: "AI-generated custom proposals",
      gpt4Integration: "GPT-4 powered analysis and generation",
      teamFeatures: "Collaboration tools for agencies",
      mobileApp: "Native mobile application",
      clientInsights: "Analysis of client behavior and preferences",
      automatedFollowups: "Smart follow-up message generation",
      videoProposals: "AI-assisted video proposal creation",
      portfolioOptimization: "AI-powered portfolio suggestions",
      rateNegotiation: "Smart rate negotiation assistance",
      projectManagement: "Built-in project tracking tools"
    };
    
    return descriptions[featureName] || featureName;
  }
  
  /**
   * Migrate data between versions
   * @param {string} fromVersion - Source version
   * @param {string} toVersion - Target version
   * @returns {Promise<boolean>} - Migration success
   */
  async migrateData(fromVersion, toVersion) {
    try {
      console.log(`🔄 Migrating from ${fromVersion} to ${toVersion}`);
      
      // Backup current data
      if (VERSION_CONFIG.MIGRATION.backupData) {
        await this.backupUserData(fromVersion);
      }
      
      // Perform version-specific migrations
      if (fromVersion === "1.0.0" && toVersion === "2.0.0") {
        await this.migrateV1ToV2();
      }
      
      // Update version in storage
      await chrome.storage.local.set({
        version: toVersion,
        migrationDate: new Date().toISOString()
      });
      
      console.log(`✅ Migration completed successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Migration failed:`, error);
      return false;
    }
  }
  
  /**
   * Backup user data before migration
   * @param {string} version - Current version
   */
  async backupUserData(version) {
    const data = await chrome.storage.local.get();
    await chrome.storage.local.set({
      [`backup_${version}_${Date.now()}`]: data
    });
  }
  
  /**
   * Migrate from v1.0.0 to v2.0.0
   */
  async migrateV1ToV2() {
    const data = await chrome.storage.local.get();
    
    // Migrate settings structure
    if (data.settings) {
      const newSettings = {
        ...data.settings,
        ai: {
          enabled: true,
          minScore: 75,
          analysisDepth: 'standard'
        },
        autoApply: {
          enabled: false,
          minScore: 80,
          maxPerDay: 10,
          autoSubmit: false
        },
        ui: {
          theme: 'dark',
          animations: true,
          compactMode: false
        }
      };
      
      await chrome.storage.local.set({ settings: newSettings });
    }
    
    // Migrate job data format
    if (data.jobs) {
      const enhancedJobs = data.jobs.map(job => ({
        ...job,
        aiScore: null,
        analysis: null,
        version: '2.0.0'
      }));
      
      await chrome.storage.local.set({ jobs: enhancedJobs });
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VERSION_CONFIG, VersionManager };
} else if (typeof window !== 'undefined') {
  // Browser context
  window.VERSION_CONFIG = VERSION_CONFIG;
  window.VersionManager = VersionManager;
} else if (typeof self !== 'undefined') {
  // Service worker context
  self.VERSION_CONFIG = VERSION_CONFIG;
  self.VersionManager = VersionManager;
} else {
  // Fallback for other contexts
  globalThis.VERSION_CONFIG = VERSION_CONFIG;
  globalThis.VersionManager = VersionManager;
}
