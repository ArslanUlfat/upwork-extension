/**
 * 🪄 Magic Upwork Assistant - Code Version Manager
 * Manages version-specific code loading and organization
 */

class CodeVersionManager {
  constructor() {
    this.currentVersion = VERSION_CONFIG.CURRENT_VERSION;
    this.loadedModules = new Map();
    this.versionSpecificCode = new Map();
    this.sharedCode = new Map();
  }

  /**
   * Initialize version-specific code management
   */
  async initialize() {
    console.log(`🔧 Initializing Code Manager for version ${this.currentVersion}`);
    
    // Load version-specific configurations
    await this.loadVersionConfig();
    
    // Initialize shared modules
    await this.loadSharedModules();
    
    // Load version-specific modules
    await this.loadVersionSpecificModules();
    
    console.log(`✅ Code Manager initialized for ${this.currentVersion}`);
  }

  /**
   * Load version configuration and determine what code to load
   */
  async loadVersionConfig() {
    const versionData = VERSION_CONFIG.VERSIONS[this.currentVersion];
    
    if (!versionData) {
      throw new Error(`Version ${this.currentVersion} not found in configuration`);
    }

    // Store version-specific code requirements
    this.versionSpecificCode.set('ui', {
      popup: versionData.ui.popup,
      css: versionData.ui.css,
      js: versionData.ui.js,
      theme: versionData.ui.theme
    });

    this.versionSpecificCode.set('features', versionData.features);
    this.versionSpecificCode.set('name', versionData.name);
    this.versionSpecificCode.set('codename', versionData.codename);
  }

  /**
   * Load shared modules that work across all versions
   */
  async loadSharedModules() {
    const sharedModules = [
      'version-config.js',
      'version-manager.js',
      'version-display.js'
    ];

    for (const module of sharedModules) {
      try {
        this.sharedCode.set(module, {
          loaded: true,
          path: module,
          type: 'shared'
        });
        console.log(`📦 Loaded shared module: ${module}`);
      } catch (error) {
        console.error(`❌ Failed to load shared module ${module}:`, error);
      }
    }
  }

  /**
   * Load version-specific modules based on current version
   */
  async loadVersionSpecificModules() {
    const features = this.versionSpecificCode.get('features');
    const moduleMap = this.getVersionModuleMap();

    // Load core modules for this version
    const coreModules = moduleMap.core[this.currentVersion] || [];
    for (const module of coreModules) {
      await this.loadModule(module, 'core');
    }

    // Load feature-specific modules
    for (const [feature, enabled] of Object.entries(features)) {
      if (enabled && moduleMap.features[feature]) {
        await this.loadModule(moduleMap.features[feature], 'feature', feature);
      }
    }
  }

  /**
   * Get mapping of versions to their required modules
   */
  getVersionModuleMap() {
    return {
      core: {
        '1.0.0': [
          'popup-basic.js',
          'basic-scraper.js'
        ],
        '2.0.0': [
          'popup-pro.js',
          'ai-engine.js',
          'auto-apply-engine.js',
          'profile-optimizer.js',
          'notification-engine.js',
          'data-export.js'
        ],
        '3.0.0': [
          'popup-ai.js',
          'gpt4-engine.js',
          'team-manager.js',
          'mobile-sync.js'
        ]
      },
      features: {
        aiAnalysis: 'ai-engine.js',
        autoApply: 'auto-apply-engine.js',
        analytics: 'analytics-engine.js',
        profileOptimization: 'profile-optimizer.js',
        smartNotifications: 'notification-engine.js',
        advancedExport: 'data-export.js',
        gpt4Integration: 'gpt4-engine.js',
        teamFeatures: 'team-manager.js',
        mobileApp: 'mobile-sync.js'
      }
    };
  }

  /**
   * Load a specific module
   */
  async loadModule(modulePath, type, feature = null) {
    try {
      // Check if module exists for this version
      if (!this.moduleExistsForVersion(modulePath)) {
        console.warn(`⚠️ Module ${modulePath} not available for version ${this.currentVersion}`);
        return false;
      }

      this.loadedModules.set(modulePath, {
        loaded: true,
        type: type,
        feature: feature,
        version: this.currentVersion,
        loadTime: new Date().toISOString()
      });

      console.log(`📦 Loaded ${type} module: ${modulePath}${feature ? ` (${feature})` : ''}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to load module ${modulePath}:`, error);
      return false;
    }
  }

  /**
   * Check if a module exists for the current version
   */
  moduleExistsForVersion(modulePath) {
    // In a real implementation, this would check if the file exists
    // For now, we'll assume all modules exist
    return true;
  }

  /**
   * Get version-specific code structure
   */
  getCodeStructure() {
    return {
      version: this.currentVersion,
      name: this.versionSpecificCode.get('name'),
      codename: this.versionSpecificCode.get('codename'),
      ui: this.versionSpecificCode.get('ui'),
      features: this.versionSpecificCode.get('features'),
      loadedModules: Array.from(this.loadedModules.entries()).map(([path, info]) => ({
        path,
        ...info
      })),
      sharedModules: Array.from(this.sharedCode.keys())
    };
  }

  /**
   * Switch to a different version (development only)
   */
  async switchVersion(targetVersion) {
    if (!VERSION_CONFIG.VERSIONS[targetVersion]) {
      throw new Error(`Version ${targetVersion} not found`);
    }

    console.log(`🔄 Switching code from ${this.currentVersion} to ${targetVersion}`);

    // Clear current modules
    this.loadedModules.clear();
    this.versionSpecificCode.clear();

    // Update current version
    this.currentVersion = targetVersion;
    VERSION_CONFIG.CURRENT_VERSION = targetVersion;

    // Reinitialize with new version
    await this.initialize();

    console.log(`✅ Code switched to version ${targetVersion}`);
    return this.getCodeStructure();
  }

  /**
   * Get feature-specific code requirements
   */
  getFeatureCodeRequirements(featureName) {
    const moduleMap = this.getVersionModuleMap();
    const requiredModule = moduleMap.features[featureName];
    
    if (!requiredModule) {
      return null;
    }

    return {
      feature: featureName,
      module: requiredModule,
      available: this.isFeatureAvailable(featureName),
      loaded: this.loadedModules.has(requiredModule)
    };
  }

  /**
   * Check if a feature is available in current version
   */
  isFeatureAvailable(featureName) {
    const features = this.versionSpecificCode.get('features') || {};
    return features[featureName] === true;
  }

  /**
   * Get code organization report
   */
  generateCodeReport() {
    const structure = this.getCodeStructure();
    const features = structure.features;
    const enabledFeatures = Object.keys(features).filter(key => features[key]);
    const disabledFeatures = Object.keys(features).filter(key => !features[key]);

    return {
      version: structure.version,
      name: structure.name,
      codename: structure.codename,
      statistics: {
        totalFeatures: Object.keys(features).length,
        enabledFeatures: enabledFeatures.length,
        disabledFeatures: disabledFeatures.length,
        loadedModules: structure.loadedModules.length,
        sharedModules: structure.sharedModules.length
      },
      enabledFeatures,
      disabledFeatures,
      loadedModules: structure.loadedModules,
      ui: structure.ui,
      recommendations: this.getCodeRecommendations()
    };
  }

  /**
   * Get code organization recommendations
   */
  getCodeRecommendations() {
    const recommendations = [];
    const features = this.versionSpecificCode.get('features') || {};
    const moduleMap = this.getVersionModuleMap();

    // Check for unused modules
    for (const [feature, enabled] of Object.entries(features)) {
      if (!enabled && moduleMap.features[feature]) {
        recommendations.push({
          type: 'optimization',
          message: `Consider removing ${moduleMap.features[feature]} as ${feature} is disabled`,
          severity: 'low'
        });
      }
    }

    // Check for missing modules
    for (const [feature, enabled] of Object.entries(features)) {
      if (enabled && moduleMap.features[feature] && !this.loadedModules.has(moduleMap.features[feature])) {
        recommendations.push({
          type: 'error',
          message: `Missing required module ${moduleMap.features[feature]} for feature ${feature}`,
          severity: 'high'
        });
      }
    }

    return recommendations;
  }

  /**
   * Export code structure for documentation
   */
  exportCodeStructure() {
    const structure = this.getCodeStructure();
    const report = this.generateCodeReport();

    return {
      timestamp: new Date().toISOString(),
      version: structure.version,
      structure,
      report,
      moduleGraph: this.generateModuleGraph()
    };
  }

  /**
   * Generate module dependency graph
   */
  generateModuleGraph() {
    const graph = {
      nodes: [],
      edges: []
    };

    // Add shared modules
    this.sharedCode.forEach((info, module) => {
      graph.nodes.push({
        id: module,
        type: 'shared',
        version: 'all'
      });
    });

    // Add version-specific modules
    this.loadedModules.forEach((info, module) => {
      graph.nodes.push({
        id: module,
        type: info.type,
        feature: info.feature,
        version: info.version
      });

      // Add dependency edges (simplified)
      if (info.type === 'feature') {
        graph.edges.push({
          from: 'version-config.js',
          to: module,
          type: 'dependency'
        });
      }
    });

    return graph;
  }
}

// Create global instance
const codeVersionManager = new CodeVersionManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeVersionManager;
} else if (typeof window !== 'undefined') {
  // Browser context
  window.codeVersionManager = codeVersionManager;
} else if (typeof self !== 'undefined') {
  // Service worker context
  self.codeVersionManager = codeVersionManager;
} else {
  // Fallback for other contexts
  globalThis.codeVersionManager = codeVersionManager;
}
