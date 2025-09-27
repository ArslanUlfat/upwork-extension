/**
 * 🪄 Magic Upwork Assistant - Version Manager
 * Handles version detection, feature flags, and migrations
 */

// Import version configuration
importScripts('version-config.js');

class ExtensionVersionManager {
  constructor() {
    this.versionManager = new VersionManager();
    this.initialized = false;
  }

  /**
   * Initialize version management system
   */
  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🚀 Initializing Version Manager...');
      
      // Check current installation
      const stored = await chrome.storage.local.get(['version', 'firstInstall']);
      const manifestVersion = chrome.runtime.getManifest().version;
      
      // Handle first installation
      if (!stored.firstInstall) {
        await this.handleFirstInstall(manifestVersion);
      }
      
      // Handle version changes
      if (stored.version && stored.version !== manifestVersion) {
        await this.handleVersionChange(stored.version, manifestVersion);
      }
      
      // Update current version
      await chrome.storage.local.set({
        version: manifestVersion,
        lastVersionCheck: new Date().toISOString()
      });
      
      this.initialized = true;
      console.log(`✅ Version Manager initialized - Current: ${manifestVersion}`);
      
    } catch (error) {
      console.error('❌ Version Manager initialization failed:', error);
    }
  }

  /**
   * Handle first installation
   */
  async handleFirstInstall(version) {
    console.log(`🎉 First installation detected - Version ${version}`);
    
    const versionInfo = this.versionManager.getCurrentVersionInfo();
    
    // Set default settings based on version
    const defaultSettings = this.getDefaultSettings(version);
    
    await chrome.storage.local.set({
      version: version,
      firstInstall: new Date().toISOString(),
      settings: defaultSettings,
      versionInfo: versionInfo
    });
    
    // Show welcome notification
    this.showWelcomeNotification(versionInfo);
  }

  /**
   * Handle version changes (upgrades/downgrades)
   */
  async handleVersionChange(oldVersion, newVersion) {
    console.log(`🔄 Version change detected: ${oldVersion} → ${newVersion}`);
    
    const comparison = this.versionManager.compareVersions(newVersion, oldVersion);
    
    if (comparison > 0) {
      // Upgrade
      await this.handleUpgrade(oldVersion, newVersion);
    } else if (comparison < 0) {
      // Downgrade
      await this.handleDowngrade(oldVersion, newVersion);
    }
  }

  /**
   * Handle version upgrade
   */
  async handleUpgrade(fromVersion, toVersion) {
    console.log(`⬆️ Upgrading from ${fromVersion} to ${toVersion}`);
    
    try {
      // Perform data migration
      const migrationSuccess = await this.versionManager.migrateData(fromVersion, toVersion);
      
      if (migrationSuccess) {
        // Get changelog
        const changelog = this.versionManager.getChangelog(fromVersion, toVersion);
        
        // Update version info
        const versionInfo = this.versionManager.getCurrentVersionInfo();
        await chrome.storage.local.set({
          versionInfo: versionInfo,
          lastUpgrade: {
            from: fromVersion,
            to: toVersion,
            date: new Date().toISOString(),
            changelog: changelog
          }
        });
        
        // Show upgrade notification
        this.showUpgradeNotification(fromVersion, toVersion, changelog);
        
        console.log(`✅ Upgrade completed successfully`);
      } else {
        console.error(`❌ Migration failed during upgrade`);
      }
      
    } catch (error) {
      console.error(`❌ Upgrade failed:`, error);
    }
  }

  /**
   * Handle version downgrade
   */
  async handleDowngrade(fromVersion, toVersion) {
    console.log(`⬇️ Downgrading from ${fromVersion} to ${toVersion}`);
    
    // Show downgrade warning
    this.showDowngradeWarning(fromVersion, toVersion);
    
    // Update version info
    const versionInfo = this.versionManager.getCurrentVersionInfo();
    await chrome.storage.local.set({
      versionInfo: versionInfo,
      lastDowngrade: {
        from: fromVersion,
        to: toVersion,
        date: new Date().toISOString()
      }
    });
  }

  /**
   * Get default settings for a version
   */
  getDefaultSettings(version) {
    const versionData = VERSION_CONFIG.VERSIONS[version];
    
    if (!versionData) {
      return this.getBasicSettings();
    }

    const settings = {
      // Basic settings (available in all versions)
      scraping: {
        enabled: true,
        autoScrape: false,
        interval: 300000, // 5 minutes
        maxJobs: 50
      },
      
      filtering: {
        enabled: true,
        keywords: [],
        minBudget: 0,
        maxBudget: 0,
        excludeKeywords: []
      },
      
      notifications: {
        browser: { enabled: true },
        slack: { enabled: false, webhook: '' }
      },
      
      export: {
        format: 'json',
        includeAnalysis: false
      }
    };

    // Add version-specific settings
    if (versionData.features.aiAnalysis) {
      settings.ai = {
        enabled: true,
        minScore: 75,
        analysisDepth: 'standard',
        skillWeighting: 'high',
        budgetFactor: 'medium',
        competitionWeight: 'high'
      };
    }

    if (versionData.features.autoApply) {
      settings.autoApply = {
        enabled: false,
        minScore: 80,
        maxPerDay: 10,
        autoSubmit: false,
        customizeProposals: true,
        reviewBeforeSend: true
      };
    }

    if (versionData.features.darkMode) {
      settings.ui = {
        theme: 'dark',
        animations: true,
        compactMode: false,
        glassmorphism: true
      };
    }

    if (versionData.features.analytics) {
      settings.analytics = {
        enabled: true,
        trackPerformance: true,
        marketInsights: true,
        exportReports: true
      };
    }

    return settings;
  }

  /**
   * Get basic settings for unknown versions
   */
  getBasicSettings() {
    return {
      scraping: { enabled: true, autoScrape: false, interval: 300000, maxJobs: 50 },
      filtering: { enabled: true, keywords: [], minBudget: 0, maxBudget: 0 },
      notifications: { browser: { enabled: true }, slack: { enabled: false } },
      export: { format: 'json' }
    };
  }

  /**
   * Show welcome notification for new installations
   */
  showWelcomeNotification(versionInfo) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon48.png',
      title: '🪄 Welcome to Magic Upwork Assistant!',
      message: `${versionInfo.name} (v${versionInfo.version}) is ready to transform your freelancing experience!`
    });
  }

  /**
   * Show upgrade notification
   */
  showUpgradeNotification(fromVersion, toVersion, changelog) {
    const newFeatures = changelog.filter(change => change.type === 'new').length;
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon48.png',
      title: '🎉 Magic Upwork Assistant Upgraded!',
      message: `Updated to v${toVersion} with ${newFeatures} new features! Click to see what's new.`
    });
  }

  /**
   * Show downgrade warning
   */
  showDowngradeWarning(fromVersion, toVersion) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon48.png',
      title: '⚠️ Version Downgrade Detected',
      message: `Downgraded from v${fromVersion} to v${toVersion}. Some features may be unavailable.`
    });
  }

  /**
   * Check if a feature is available in current version
   */
  isFeatureAvailable(featureName) {
    return this.versionManager.isFeatureAvailable(featureName);
  }

  /**
   * Get current version info
   */
  getCurrentVersionInfo() {
    return this.versionManager.getCurrentVersionInfo();
  }

  /**
   * Get UI configuration for current version
   */
  getUIConfig() {
    return this.versionManager.getUIConfig();
  }

  /**
   * Check for available upgrades
   */
  checkForUpgrade() {
    return this.versionManager.checkForUpgrade();
  }

  /**
   * Get feature flags
   */
  getFeatureFlags() {
    return VERSION_CONFIG.FEATURE_FLAGS;
  }
}

// Create global instance
const extensionVersionManager = new ExtensionVersionManager();

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  extensionVersionManager.initialize();
});

chrome.runtime.onInstalled.addListener(() => {
  extensionVersionManager.initialize();
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
  // Browser context
  window.extensionVersionManager = extensionVersionManager;
} else if (typeof self !== 'undefined') {
  // Service worker context
  self.extensionVersionManager = extensionVersionManager;
} else {
  // Fallback for other contexts
  globalThis.extensionVersionManager = extensionVersionManager;
}
