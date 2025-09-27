/**
 * 🪄 Magic Upwork Assistant - Version Switcher Utility
 * Development tool for testing different versions
 */

class VersionSwitcher {
  constructor() {
    this.currentVersion = VERSION_CONFIG.CURRENT_VERSION;
    this.availableVersions = Object.keys(VERSION_CONFIG.VERSIONS);
    this.isDevMode = true; // Set to false in production
  }

  /**
   * Switch to a specific version (development only)
   * @param {string} targetVersion - Version to switch to
   */
  async switchToVersion(targetVersion) {
    if (!this.isDevMode) {
      console.warn('⚠️ Version switching is only available in development mode');
      return false;
    }

    if (!VERSION_CONFIG.VERSIONS[targetVersion]) {
      console.error(`❌ Version ${targetVersion} not found`);
      return false;
    }

    try {
      console.log(`🔄 Switching from ${this.currentVersion} to ${targetVersion}...`);

      // Update manifest version (simulated)
      const versionData = VERSION_CONFIG.VERSIONS[targetVersion];
      
      // Update storage with new version
      await chrome.storage.local.set({
        version: targetVersion,
        versionSwitchDate: new Date().toISOString(),
        previousVersion: this.currentVersion
      });

      // Update current version
      VERSION_CONFIG.CURRENT_VERSION = targetVersion;
      this.currentVersion = targetVersion;

      // Update UI configuration
      this.updateUIForVersion(targetVersion);

      // Show version change notification
      this.showVersionChangeNotification(targetVersion, versionData);

      console.log(`✅ Successfully switched to version ${targetVersion}`);
      return true;

    } catch (error) {
      console.error('❌ Version switch failed:', error);
      return false;
    }
  }

  /**
   * Update UI elements for the new version
   * @param {string} version - Target version
   */
  updateUIForVersion(version) {
    const versionData = VERSION_CONFIG.VERSIONS[version];
    const body = document.body;

    // Remove old version classes
    this.availableVersions.forEach(v => {
      body.classList.remove(`version-${v.replace(/\./g, '-')}`);
    });

    // Add new version class
    body.classList.add(`version-${version.replace(/\./g, '-')}`);

    // Update CSS variables for version-specific theming
    const root = document.documentElement;
    if (version === '1.0.0') {
      root.style.setProperty('--primary-color', '#4a90e2');
      root.style.setProperty('--accent-color', '#357abd');
    } else if (version === '2.0.0') {
      root.style.setProperty('--primary-color', '#667eea');
      root.style.setProperty('--accent-color', '#764ba2');
    } else if (version === '3.0.0') {
      root.style.setProperty('--primary-color', '#ff6b6b');
      root.style.setProperty('--accent-color', '#ee5a24');
    }

    // Update feature visibility
    this.updateFeatureVisibility(version);
  }

  /**
   * Update feature visibility based on version
   * @param {string} version - Target version
   */
  updateFeatureVisibility(version) {
    const features = VERSION_CONFIG.VERSIONS[version].features;

    // Hide/show features based on availability
    Object.keys(features).forEach(feature => {
      const elements = document.querySelectorAll(`[data-feature="${feature}"]`);
      elements.forEach(element => {
        if (features[feature]) {
          element.style.display = '';
          element.classList.remove('feature-disabled');
        } else {
          element.style.display = 'none';
          element.classList.add('feature-disabled');
        }
      });
    });

    // Update feature indicators
    const indicators = document.querySelectorAll('.feature-indicator');
    indicators.forEach(indicator => {
      const feature = indicator.dataset.feature;
      if (feature && features[feature] !== undefined) {
        indicator.className = `feature-indicator ${features[feature] ? 'available' : 'unavailable'}`;
        indicator.innerHTML = features[feature] ? '✅' : '🔒';
      }
    });
  }

  /**
   * Show version change notification
   * @param {string} version - New version
   * @param {object} versionData - Version data
   */
  showVersionChangeNotification(version, versionData) {
    const notification = document.createElement('div');
    notification.className = 'version-switch-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">🔄</div>
        <div class="notification-text">
          <div class="notification-title">Version Switched!</div>
          <div class="notification-subtitle">Now running ${versionData.name} (v${version})</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideInRight 0.5s ease;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Create version switcher UI
   */
  createVersionSwitcherUI() {
    if (!this.isDevMode) return;

    const switcher = document.createElement('div');
    switcher.className = 'version-switcher-dev';
    switcher.innerHTML = `
      <div class="version-switcher-header">
        <span class="switcher-icon">🔧</span>
        <span class="switcher-title">Dev: Version Switcher</span>
        <button class="switcher-toggle" onclick="this.parentElement.parentElement.classList.toggle('collapsed')">−</button>
      </div>
      <div class="version-switcher-content">
        <div class="current-version">
          Current: <strong>${this.currentVersion}</strong>
        </div>
        <div class="version-buttons">
          ${this.availableVersions.map(version => `
            <button 
              class="version-btn ${version === this.currentVersion ? 'active' : ''}"
              onclick="versionSwitcher.switchToVersion('${version}')"
              ${version === this.currentVersion ? 'disabled' : ''}
            >
              ${version}
              <br>
              <small>${VERSION_CONFIG.VERSIONS[version].name}</small>
            </button>
          `).join('')}
        </div>
        <div class="switcher-actions">
          <button onclick="versionSwitcher.showVersionComparison()">Compare Versions</button>
          <button onclick="versionSwitcher.resetToDefault()">Reset to Default</button>
        </div>
      </div>
    `;

    // Add styles
    switcher.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 16px;
      border-radius: 12px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    document.body.appendChild(switcher);
    return switcher;
  }

  /**
   * Show version comparison modal
   */
  showVersionComparison() {
    const modal = document.createElement('div');
    modal.className = 'version-comparison-modal';
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Version Comparison</h3>
          <button onclick="this.closest('.version-comparison-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <table class="version-comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                ${this.availableVersions.map(v => `<th>v${v}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${this.generateComparisonRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Add styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(modal);
  }

  /**
   * Generate comparison table rows
   */
  generateComparisonRows() {
    const allFeatures = new Set();
    
    // Collect all features across versions
    this.availableVersions.forEach(version => {
      Object.keys(VERSION_CONFIG.VERSIONS[version].features).forEach(feature => {
        allFeatures.add(feature);
      });
    });

    return Array.from(allFeatures).map(feature => {
      const cells = this.availableVersions.map(version => {
        const available = VERSION_CONFIG.VERSIONS[version].features[feature];
        return `<td class="${available ? 'available' : 'unavailable'}">${available ? '✅' : '❌'}</td>`;
      }).join('');

      return `<tr><td class="feature-name">${this.formatFeatureName(feature)}</td>${cells}</tr>`;
    }).join('');
  }

  /**
   * Format feature name for display
   */
  formatFeatureName(featureName) {
    return featureName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Reset to default version
   */
  async resetToDefault() {
    const defaultVersion = '2.0.0'; // Current production version
    await this.switchToVersion(defaultVersion);
  }

  /**
   * Get version statistics
   */
  getVersionStats() {
    return this.availableVersions.map(version => {
      const versionData = VERSION_CONFIG.VERSIONS[version];
      const features = versionData.features;
      const enabledCount = Object.values(features).filter(Boolean).length;
      const totalCount = Object.keys(features).length;

      return {
        version,
        name: versionData.name,
        codename: versionData.codename,
        enabledFeatures: enabledCount,
        totalFeatures: totalCount,
        completionPercentage: Math.round((enabledCount / totalCount) * 100)
      };
    });
  }

  /**
   * Initialize version switcher (development only)
   */
  init() {
    if (!this.isDevMode) return;

    console.log('🔧 Development Mode: Version Switcher Enabled');
    
    // Create UI
    this.createVersionSwitcherUI();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
          case '1':
            this.switchToVersion('1.0.0');
            break;
          case '2':
            this.switchToVersion('2.0.0');
            break;
          case '3':
            this.switchToVersion('3.0.0');
            break;
          case 'C':
            this.showVersionComparison();
            break;
        }
      }
    });

    // Log version stats
    console.table(this.getVersionStats());
  }
}

// Create global instance for development
if (typeof window !== 'undefined') {
  window.versionSwitcher = new VersionSwitcher();
  
  // Auto-initialize in development
  if (VERSION_CONFIG?.FEATURE_FLAGS?.debugMode) {
    document.addEventListener('DOMContentLoaded', () => {
      window.versionSwitcher.init();
    });
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VersionSwitcher;
}
