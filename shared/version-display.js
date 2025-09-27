/**
 * 🪄 Magic Upwork Assistant - Version Display Component
 * Handles version information display in the UI
 */

class VersionDisplay {
  constructor() {
    this.versionManager = new VersionManager();
    this.currentVersion = null;
    this.versionInfo = null;
  }

  /**
   * Initialize version display
   */
  async initialize() {
    try {
      // Get current version info
      this.currentVersion = chrome.runtime.getManifest().version;
      this.versionInfo = this.versionManager.getCurrentVersionInfo();
      
      // Load stored version data
      const stored = await chrome.storage.local.get(['versionInfo', 'lastUpgrade']);
      if (stored.versionInfo) {
        this.versionInfo = stored.versionInfo;
      }
      
      console.log('📋 Version Display initialized:', this.versionInfo);
    } catch (error) {
      console.error('❌ Version Display initialization failed:', error);
    }
  }

  /**
   * Create version badge element
   */
  createVersionBadge() {
    const badge = document.createElement('div');
    badge.className = 'version-badge';
    badge.innerHTML = `
      <div class="version-info">
        <span class="version-number">v${this.currentVersion}</span>
        <span class="version-name">${this.versionInfo?.name || 'Unknown'}</span>
      </div>
    `;
    
    // Add click handler for version details
    badge.addEventListener('click', () => this.showVersionDetails());
    
    return badge;
  }

  /**
   * Create compact version indicator
   */
  createVersionIndicator() {
    const indicator = document.createElement('span');
    indicator.className = 'version-indicator';
    indicator.textContent = `v${this.currentVersion}`;
    indicator.title = `${this.versionInfo?.name} - ${this.versionInfo?.description}`;
    
    return indicator;
  }

  /**
   * Create feature availability indicator
   */
  createFeatureIndicator(featureName) {
    const isAvailable = this.versionManager.isFeatureAvailable(featureName);
    const indicator = document.createElement('span');
    indicator.className = `feature-indicator ${isAvailable ? 'available' : 'unavailable'}`;
    indicator.innerHTML = isAvailable ? '✅' : '🔒';
    indicator.title = isAvailable ? 
      `${featureName} is available in your version` : 
      `${featureName} requires a newer version`;
    
    return indicator;
  }

  /**
   * Show detailed version information modal
   */
  showVersionDetails() {
    const modal = this.createVersionModal();
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeVersionModal(modal);
      }
    });
  }

  /**
   * Create version information modal
   */
  createVersionModal() {
    const modal = document.createElement('div');
    modal.className = 'version-modal';
    
    const features = this.versionInfo?.features || {};
    const availableFeatures = Object.keys(features).filter(key => features[key]);
    const unavailableFeatures = Object.keys(features).filter(key => !features[key]);
    
    modal.innerHTML = `
      <div class="version-modal-content">
        <div class="version-modal-header">
          <h2>🪄 ${this.versionInfo?.name || 'Magic Upwork Assistant'}</h2>
          <button class="close-btn" onclick="this.closest('.version-modal').remove()">×</button>
        </div>
        
        <div class="version-modal-body">
          <div class="version-details">
            <div class="version-main-info">
              <div class="version-number-large">v${this.currentVersion}</div>
              <div class="version-codename">${this.versionInfo?.codename || ''}</div>
              <div class="version-description">${this.versionInfo?.description || ''}</div>
              <div class="version-release-date">Released: ${this.versionInfo?.releaseDate || 'Unknown'}</div>
            </div>
            
            <div class="features-section">
              <h3>✨ Available Features</h3>
              <div class="features-grid">
                ${availableFeatures.map(feature => `
                  <div class="feature-item available">
                    <span class="feature-icon">✅</span>
                    <span class="feature-name">${this.formatFeatureName(feature)}</span>
                    <span class="feature-description">${this.versionManager.getFeatureDescription(feature)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            
            ${unavailableFeatures.length > 0 ? `
              <div class="features-section">
                <h3>🔒 Upgrade Required</h3>
                <div class="features-grid">
                  ${unavailableFeatures.map(feature => `
                    <div class="feature-item unavailable">
                      <span class="feature-icon">🔒</span>
                      <span class="feature-name">${this.formatFeatureName(feature)}</span>
                      <span class="feature-description">${this.versionManager.getFeatureDescription(feature)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            ${this.createUpgradeSection()}
          </div>
        </div>
        
        <div class="version-modal-footer">
          <button class="btn-secondary" onclick="this.closest('.version-modal').remove()">Close</button>
          ${this.createUpgradeButton()}
        </div>
      </div>
    `;
    
    return modal;
  }

  /**
   * Create upgrade section if available
   */
  createUpgradeSection() {
    const upgradeInfo = this.versionManager.checkForUpgrade();
    
    if (!upgradeInfo) {
      return `
        <div class="upgrade-section">
          <div class="upgrade-status current">
            <span class="upgrade-icon">🎉</span>
            <span class="upgrade-text">You're running the latest version!</span>
          </div>
        </div>
      `;
    }
    
    const changelog = this.versionManager.getChangelog(this.currentVersion, upgradeInfo.version);
    const newFeatures = changelog.filter(change => change.type === 'new');
    
    return `
      <div class="upgrade-section">
        <div class="upgrade-available">
          <h3>🚀 Upgrade Available</h3>
          <div class="upgrade-info">
            <div class="upgrade-version">v${upgradeInfo.version} - ${upgradeInfo.info.name}</div>
            <div class="upgrade-description">${upgradeInfo.info.description}</div>
          </div>
          
          <div class="new-features">
            <h4>✨ New Features (${newFeatures.length})</h4>
            <ul>
              ${newFeatures.slice(0, 5).map(feature => `
                <li>${this.formatFeatureName(feature.feature)} - ${feature.description}</li>
              `).join('')}
              ${newFeatures.length > 5 ? `<li>...and ${newFeatures.length - 5} more!</li>` : ''}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create upgrade button if available
   */
  createUpgradeButton() {
    const upgradeInfo = this.versionManager.checkForUpgrade();
    
    if (!upgradeInfo) {
      return '';
    }
    
    return `<button class="btn-primary" onclick="window.open('https://github.com/yourusername/magic-upwork-assistant/releases', '_blank')">Upgrade Now</button>`;
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
   * Close version modal with animation
   */
  closeVersionModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }

  /**
   * Add version info to existing element
   */
  addVersionInfo(element, options = {}) {
    const { 
      showBadge = true, 
      showFeatures = false, 
      compact = false 
    } = options;
    
    if (compact) {
      const indicator = this.createVersionIndicator();
      element.appendChild(indicator);
    } else if (showBadge) {
      const badge = this.createVersionBadge();
      element.appendChild(badge);
    }
    
    if (showFeatures) {
      const featuresContainer = document.createElement('div');
      featuresContainer.className = 'features-container';
      
      const importantFeatures = ['aiAnalysis', 'autoApply', 'analytics', 'darkMode'];
      importantFeatures.forEach(feature => {
        const indicator = this.createFeatureIndicator(feature);
        featuresContainer.appendChild(indicator);
      });
      
      element.appendChild(featuresContainer);
    }
  }

  /**
   * Show upgrade notification
   */
  showUpgradeNotification() {
    const upgradeInfo = this.versionManager.checkForUpgrade();
    
    if (!upgradeInfo) return;
    
    const notification = document.createElement('div');
    notification.className = 'upgrade-notification';
    notification.innerHTML = `
      <div class="upgrade-notification-content">
        <span class="upgrade-icon">🚀</span>
        <div class="upgrade-text">
          <div class="upgrade-title">Upgrade Available!</div>
          <div class="upgrade-subtitle">v${upgradeInfo.version} - ${upgradeInfo.info.name}</div>
        </div>
        <button class="upgrade-btn" onclick="window.open('https://github.com/yourusername/magic-upwork-assistant/releases', '_blank')">
          Upgrade
        </button>
        <button class="close-notification" onclick="this.closest('.upgrade-notification').remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Get version-specific CSS classes
   */
  getVersionClasses() {
    const version = this.currentVersion.replace(/\./g, '-');
    const features = this.versionInfo?.features || {};
    
    const classes = [`version-${version}`];
    
    // Add feature-based classes
    Object.keys(features).forEach(feature => {
      if (features[feature]) {
        classes.push(`has-${feature.toLowerCase()}`);
      }
    });
    
    return classes.join(' ');
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VersionDisplay;
} else if (typeof window !== 'undefined') {
  // Browser context
  window.VersionDisplay = VersionDisplay;
} else if (typeof self !== 'undefined') {
  // Service worker context
  self.VersionDisplay = VersionDisplay;
} else {
  // Fallback for other contexts
  globalThis.VersionDisplay = VersionDisplay;
}
