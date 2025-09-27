# 🪄 Version-Wise Code Management Guide

## Overview

This guide shows you how to effectively manage your Upwork extension code across different versions, ensuring clean separation, easy maintenance, and smooth development workflow.

## 🗂️ Current Code Organization

### By Version

**Version 1.0.0 - "Foundation"**
```
📁 v1.0.0 Files:
├── popup-basic.html      # Simple UI
├── popup-basic.css       # Basic styling
├── popup-basic.js        # Core functionality
└── Features: Job scraping, filtering, Slack, export
```

**Version 2.0.0 - "Magic Stick Edition" (Current)**
```
📁 v2.0.0 Files:
├── popup-pro.html        # Advanced UI
├── popup-pro.css         # Modern styling
├── popup-pro.js          # Enhanced functionality
├── ai-engine.js          # AI analysis
├── auto-apply-engine.js  # Auto-apply system
├── profile-optimizer.js  # Profile optimization
├── notification-engine.js # Smart notifications
├── data-export.js        # Advanced export
└── Features: All v1 + AI, auto-apply, analytics, dark mode
```

**Version 3.0.0 - "AI Master Edition" (Planned)**
```
📁 v3.0.0 Files:
├── popup-ai.html         # Next-gen UI
├── popup-ai.css          # AI-first styling
├── popup-ai.js           # AI-enhanced functionality
├── gpt4-engine.js        # GPT-4 integration
├── team-manager.js       # Team features
├── mobile-sync.js        # Mobile app sync
└── Features: All v2 + GPT-4, teams, mobile
```

### Shared Across All Versions
```
📁 Shared Files:
├── manifest.json         # Extension manifest
├── background.js         # Service worker
├── content.js           # Content script
├── version-config.js    # Version configuration
├── version-manager.js   # Version management
├── version-display.js   # Version UI components
├── version-styles.css   # Version styling
└── icons/              # Extension icons
```

## 🔧 Development Workflow

### 1. Working on Version-Specific Features

**For v1.0.0 (Basic) features:**
```javascript
// Edit popup-basic.js
class BasicUpworkScraper {
  // Add basic functionality here
  scrapeJobs() {
    // Simple scraping logic
  }
}
```

**For v2.0.0 (Magic) features:**
```javascript
// Edit popup-pro.js or specific engine files
class MagicUpworkPro {
  constructor() {
    // Check if AI features are available
    if (this.versionManager.isFeatureAvailable('aiAnalysis')) {
      this.aiAnalyzer = new AIJobAnalyzer();
    }
  }
}
```

### 2. Adding New Features

**Step 1: Update version-config.js**
```javascript
"2.1.0": {
  name: "Magic Stick Enhanced",
  features: {
    // Existing features...
    newFeature: true  // Add your new feature
  }
}
```

**Step 2: Create feature-specific code**
```javascript
// Create new-feature-engine.js
class NewFeatureEngine {
  constructor() {
    // Feature implementation
  }
}
```

**Step 3: Integrate in main popup**
```javascript
// In popup-pro.js
if (this.versionManager.isFeatureAvailable('newFeature')) {
  this.newFeatureEngine = new NewFeatureEngine();
}
```

### 3. Version Switching for Testing

**Using the Version Switcher:**
```javascript
// In browser console
versionSwitcher.switchToVersion('1.0.0');  // Test basic version
versionSwitcher.switchToVersion('2.0.0');  // Test magic version
```

**Using keyboard shortcuts:**
- `Ctrl+Shift+1` - Switch to v1.0.0
- `Ctrl+Shift+2` - Switch to v2.0.0  
- `Ctrl+Shift+3` - Switch to v3.0.0

## 📦 Building Version-Specific Distributions

### Build Single Version
```bash
node build-versions.js --version=2.0.0
```

### Build All Versions
```bash
node build-versions.js
```

### Build Output Structure
```
dist/
├── v1.0.0/
│   ├── manifest.json (v1 specific)
│   ├── popup-basic.html
│   ├── popup-basic.css
│   ├── popup-basic.js
│   └── shared files...
├── v2.0.0/
│   ├── manifest.json (v2 specific)
│   ├── popup-pro.html
│   ├── popup-pro.css
│   ├── popup-pro.js
│   ├── ai-engine.js
│   └── shared files...
└── build-report.json
```

## 🎯 Feature Management

### Feature Flags
```javascript
// In version-config.js
FEATURE_FLAGS: {
  betaFeatures: false,      // Enable experimental features
  debugMode: true,          // Development tools
  newProposalEngine: false, // A/B test new features
}
```

### Conditional Code Loading
```javascript
// Feature-based code execution
if (versionManager.isFeatureAvailable('aiAnalysis')) {
  // Load AI-specific code
  await this.initializeAI();
}

if (VERSION_CONFIG.FEATURE_FLAGS.betaFeatures) {
  // Load experimental features
  await this.loadBetaFeatures();
}
```

### Version-Specific UI
```css
/* Version-specific styling */
.version-1-0-0 .advanced-features {
  display: none; /* Hide advanced features in basic version */
}

.version-2-0-0 .ai-section {
  display: block; /* Show AI features in magic version */
}
```

## 🔄 Migration Management

### Automatic Migrations
```javascript
// In version-manager.js
async migrateV1ToV2() {
  const data = await chrome.storage.local.get();
  
  // Transform v1 data to v2 format
  const enhancedData = {
    ...data,
    aiSettings: {
      enabled: true,
      minScore: 75
    }
  };
  
  await chrome.storage.local.set(enhancedData);
}
```

### Manual Migration Steps
1. **Backup current data**
2. **Update version configuration**
3. **Run migration scripts**
4. **Test functionality**
5. **Update UI components**

## 🧪 Testing Strategy

### Version-Specific Testing
```javascript
// Run tests for specific version
testVersionSystem();           // Test version management
testVersionDisplay();          // Test UI components
testMigrationScenarios();      // Test upgrades/downgrades
```

### Feature Testing
```javascript
// Test feature availability
console.log('AI Analysis:', versionManager.isFeatureAvailable('aiAnalysis'));
console.log('Auto Apply:', versionManager.isFeatureAvailable('autoApply'));
```

### Cross-Version Testing
1. **Test in v1.0.0**: Ensure basic features work
2. **Test in v2.0.0**: Verify advanced features
3. **Test migrations**: v1→v2, v2→v1
4. **Test UI adaptation**: Check responsive design

## 📋 Best Practices

### 1. Code Organization
- **Separate concerns**: Keep version-specific code in separate files
- **Share common code**: Use shared modules for universal functionality
- **Feature flags**: Use flags for gradual rollouts
- **Clear naming**: Use descriptive file names (popup-basic, popup-pro)

### 2. Version Management
- **Semantic versioning**: Follow MAJOR.MINOR.PATCH format
- **Feature documentation**: Document what each version includes
- **Migration paths**: Plan upgrade/downgrade scenarios
- **Backward compatibility**: Maintain data compatibility when possible

### 3. Development Workflow
- **Version switching**: Test features across versions
- **Incremental development**: Build features progressively
- **Code reviews**: Review version-specific changes
- **Documentation**: Keep version docs updated

### 4. Deployment Strategy
- **Staged rollouts**: Release to small groups first
- **Feature toggles**: Enable features gradually
- **Rollback plans**: Prepare for quick rollbacks
- **User communication**: Inform users about changes

## 🚀 Advanced Techniques

### Dynamic Feature Loading
```javascript
// Load features based on version
async loadVersionFeatures() {
  const features = this.versionManager.getCurrentVersionInfo().features;
  
  for (const [feature, enabled] of Object.entries(features)) {
    if (enabled) {
      await this.loadFeatureModule(feature);
    }
  }
}
```

### Version-Specific APIs
```javascript
// Different API endpoints for different versions
getAPIEndpoint(feature) {
  const version = this.currentVersion;
  const endpoints = {
    '1.0.0': 'https://api.example.com/v1/',
    '2.0.0': 'https://api.example.com/v2/',
    '3.0.0': 'https://api.example.com/v3/'
  };
  return endpoints[version] + feature;
}
```

### Performance Optimization
```javascript
// Load only necessary code for current version
if (this.currentVersion === '1.0.0') {
  // Load minimal code for basic version
  await this.loadBasicModules();
} else if (this.currentVersion === '2.0.0') {
  // Load full feature set for magic version
  await this.loadAdvancedModules();
}
```

## 📊 Monitoring and Analytics

### Version Usage Tracking
```javascript
// Track version adoption
analytics.track('version_usage', {
  version: this.currentVersion,
  features_enabled: this.getEnabledFeatures().length,
  user_type: this.getUserType()
});
```

### Performance Monitoring
```javascript
// Monitor version-specific performance
if (VERSION_CONFIG.FEATURE_FLAGS.performanceMetrics) {
  console.time(`${feature}_execution_time`);
  await this.executeFeature(feature);
  console.timeEnd(`${feature}_execution_time`);
}
```

## 🎯 Quick Commands

### Development
```bash
# Switch versions for testing
npm run switch:v1    # Switch to basic version
npm run switch:v2    # Switch to magic version
npm run switch:v3    # Switch to AI version

# Build specific version
npm run build:v1     # Build basic version
npm run build:v2     # Build magic version
npm run build:v3     # Build AI version

# Run tests
npm run test         # Run all version tests
```

### Browser Console
```javascript
// Quick version info
versionManager.getCurrentVersionInfo()

// Check feature availability
versionManager.isFeatureAvailable('aiAnalysis')

// Switch versions (dev mode)
versionSwitcher.switchToVersion('1.0.0')

// Run tests
runAllTests()
```

This version-wise code management system gives you complete control over your extension's evolution while maintaining clean, maintainable code across all versions! 🚀
