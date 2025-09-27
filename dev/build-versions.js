/**
 * 🪄 Magic Upwork Assistant - Version Build Script
 * Builds version-specific distributions of the extension
 */

const fs = require('fs').promises;
const path = require('path');

class VersionBuilder {
  constructor() {
    this.baseDir = process.cwd();
    this.distDir = path.join(this.baseDir, 'dist');
    this.versionConfig = null;
  }

  /**
   * Initialize builder and load configuration
   */
  async initialize() {
    try {
      // Load version configuration
      const configPath = path.join(this.baseDir, 'version-config.js');
      const configContent = await fs.readFile(configPath, 'utf8');
      
      // Extract VERSION_CONFIG from the file (simplified)
      const configMatch = configContent.match(/const VERSION_CONFIG = ({[\s\S]*?});/);
      if (configMatch) {
        this.versionConfig = eval(`(${configMatch[1]})`);
      }
      
      console.log('🔧 Version Builder initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize builder:', error);
      return false;
    }
  }

  /**
   * Build specific version
   */
  async buildVersion(targetVersion) {
    if (!this.versionConfig) {
      throw new Error('Version configuration not loaded');
    }

    const versionData = this.versionConfig.VERSIONS[targetVersion];
    if (!versionData) {
      throw new Error(`Version ${targetVersion} not found in configuration`);
    }

    console.log(`🏗️  Building version ${targetVersion} - ${versionData.name}`);

    // Create version-specific directory
    const versionDir = path.join(this.distDir, `v${targetVersion}`);
    await this.ensureDirectory(versionDir);

    // Copy shared files
    await this.copySharedFiles(versionDir);

    // Copy version-specific files
    await this.copyVersionFiles(targetVersion, versionDir);

    // Generate version-specific manifest
    await this.generateManifest(targetVersion, versionDir);

    // Generate version-specific package info
    await this.generatePackageInfo(targetVersion, versionDir);

    console.log(`✅ Version ${targetVersion} built successfully in ${versionDir}`);
    return versionDir;
  }

  /**
   * Build all versions
   */
  async buildAllVersions() {
    if (!this.versionConfig) {
      await this.initialize();
    }

    const versions = Object.keys(this.versionConfig.VERSIONS);
    const results = [];

    for (const version of versions) {
      try {
        const buildPath = await this.buildVersion(version);
        results.push({ version, success: true, path: buildPath });
      } catch (error) {
        console.error(`❌ Failed to build version ${version}:`, error);
        results.push({ version, success: false, error: error.message });
      }
    }

    // Generate build report
    await this.generateBuildReport(results);

    return results;
  }

  /**
   * Copy shared files to version directory
   */
  async copySharedFiles(targetDir) {
    const sharedFiles = [
      'background.js',
      'content.js',
      'version-config.js',
      'version-manager.js',
      'version-display.js',
      'version-styles.css',
      'icons'
    ];

    for (const file of sharedFiles) {
      const sourcePath = path.join(this.baseDir, file);
      const targetPath = path.join(targetDir, file);

      try {
        const stats = await fs.stat(sourcePath);
        if (stats.isDirectory()) {
          await this.copyDirectory(sourcePath, targetPath);
        } else {
          await fs.copyFile(sourcePath, targetPath);
        }
        console.log(`📄 Copied shared file: ${file}`);
      } catch (error) {
        console.warn(`⚠️  Could not copy shared file ${file}:`, error.message);
      }
    }
  }

  /**
   * Copy version-specific files
   */
  async copyVersionFiles(version, targetDir) {
    const versionData = this.versionConfig.VERSIONS[version];
    const ui = versionData.ui;

    // Copy UI files
    const uiFiles = [ui.popup, ui.css, ui.js];
    
    for (const file of uiFiles) {
      if (file) {
        const sourcePath = path.join(this.baseDir, file);
        const targetPath = path.join(targetDir, file);

        try {
          await fs.copyFile(sourcePath, targetPath);
          console.log(`📄 Copied version file: ${file}`);
        } catch (error) {
          console.warn(`⚠️  Could not copy version file ${file}:`, error.message);
        }
      }
    }

    // Copy feature-specific files based on enabled features
    const features = versionData.features;
    const featureFiles = this.getFeatureFiles();

    for (const [feature, enabled] of Object.entries(features)) {
      if (enabled && featureFiles[feature]) {
        for (const file of featureFiles[feature]) {
          const sourcePath = path.join(this.baseDir, file);
          const targetPath = path.join(targetDir, file);

          try {
            await fs.copyFile(sourcePath, targetPath);
            console.log(`📄 Copied feature file: ${file} (${feature})`);
          } catch (error) {
            console.warn(`⚠️  Could not copy feature file ${file}:`, error.message);
          }
        }
      }
    }
  }

  /**
   * Get mapping of features to their required files
   */
  getFeatureFiles() {
    return {
      aiAnalysis: ['ai-engine.js'],
      autoApply: ['auto-apply-engine.js'],
      analytics: ['analytics-engine.js'],
      profileOptimization: ['profile-optimizer.js'],
      smartNotifications: ['notification-engine.js'],
      advancedExport: ['data-export.js'],
      gpt4Integration: ['gpt4-engine.js'],
      teamFeatures: ['team-manager.js'],
      mobileApp: ['mobile-sync.js']
    };
  }

  /**
   * Generate version-specific manifest.json
   */
  async generateManifest(version, targetDir) {
    const versionData = this.versionConfig.VERSIONS[version];
    
    const manifest = {
      manifest_version: 3,
      name: `🪄 Magic Upwork Assistant - ${versionData.name}`,
      version: version,
      version_name: versionData.name,
      description: versionData.description,
      permissions: [
        "activeTab",
        "scripting",
        "storage",
        "tabs",
        "alarms",
        "notifications",
        "background"
      ],
      host_permissions: [
        "https://www.upwork.com/*",
        "https://hooks.slack.com/*"
      ],
      action: {
        default_popup: versionData.ui.popup,
        default_title: `Magic Upwork Assistant - ${versionData.name}`
      },
      content_scripts: [
        {
          matches: ["https://www.upwork.com/nx/search/jobs*"],
          js: ["content.js"],
          run_at: "document_end"
        }
      ],
      background: {
        service_worker: "background.js"
      },
      icons: {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      }
    };

    const manifestPath = path.join(targetDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📄 Generated manifest.json for version ${version}`);
  }

  /**
   * Generate package information file
   */
  async generatePackageInfo(version, targetDir) {
    const versionData = this.versionConfig.VERSIONS[version];
    
    const packageInfo = {
      version: version,
      name: versionData.name,
      codename: versionData.codename,
      releaseDate: versionData.releaseDate,
      description: versionData.description,
      features: versionData.features,
      ui: versionData.ui,
      buildDate: new Date().toISOString(),
      buildId: this.generateBuildId()
    };

    const infoPath = path.join(targetDir, 'package-info.json');
    await fs.writeFile(infoPath, JSON.stringify(packageInfo, null, 2));
    console.log(`📄 Generated package-info.json for version ${version}`);
  }

  /**
   * Generate build report
   */
  async generateBuildReport(results) {
    const report = {
      buildDate: new Date().toISOString(),
      totalVersions: results.length,
      successfulBuilds: results.filter(r => r.success).length,
      failedBuilds: results.filter(r => !r.success).length,
      results: results,
      summary: {
        versions: results.map(r => ({
          version: r.version,
          status: r.success ? 'success' : 'failed',
          path: r.path || null,
          error: r.error || null
        }))
      }
    };

    const reportPath = path.join(this.distDir, 'build-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Also create a human-readable report
    const readableReport = this.generateReadableReport(report);
    const readableReportPath = path.join(this.distDir, 'BUILD-REPORT.md');
    await fs.writeFile(readableReportPath, readableReport);

    console.log(`📊 Build report generated: ${reportPath}`);
  }

  /**
   * Generate human-readable build report
   */
  generateReadableReport(report) {
    const { buildDate, totalVersions, successfulBuilds, failedBuilds, results } = report;
    
    let markdown = `# 🏗️ Build Report\n\n`;
    markdown += `**Build Date:** ${new Date(buildDate).toLocaleString()}\n`;
    markdown += `**Total Versions:** ${totalVersions}\n`;
    markdown += `**Successful Builds:** ${successfulBuilds}\n`;
    markdown += `**Failed Builds:** ${failedBuilds}\n\n`;

    markdown += `## 📋 Build Results\n\n`;
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      markdown += `### ${status} Version ${result.version}\n`;
      
      if (result.success) {
        markdown += `- **Status:** Success\n`;
        markdown += `- **Build Path:** \`${result.path}\`\n`;
      } else {
        markdown += `- **Status:** Failed\n`;
        markdown += `- **Error:** ${result.error}\n`;
      }
      markdown += `\n`;
    });

    markdown += `## 📁 Distribution Structure\n\n`;
    markdown += `\`\`\`\n`;
    markdown += `dist/\n`;
    results.filter(r => r.success).forEach(result => {
      markdown += `├── v${result.version}/\n`;
      markdown += `│   ├── manifest.json\n`;
      markdown += `│   ├── package-info.json\n`;
      markdown += `│   ├── background.js\n`;
      markdown += `│   ├── content.js\n`;
      markdown += `│   ├── popup files...\n`;
      markdown += `│   └── feature files...\n`;
    });
    markdown += `├── build-report.json\n`;
    markdown += `└── BUILD-REPORT.md\n`;
    markdown += `\`\`\`\n`;

    return markdown;
  }

  /**
   * Utility functions
   */
  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async copyDirectory(source, target) {
    await this.ensureDirectory(target);
    const files = await fs.readdir(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      const stats = await fs.stat(sourcePath);
      
      if (stats.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  generateBuildId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const builder = new VersionBuilder();
  
  await builder.initialize();

  if (args.includes('--version')) {
    const versionArg = args.find(arg => arg.startsWith('--version='));
    if (versionArg) {
      const version = versionArg.split('=')[1];
      await builder.buildVersion(version);
    } else {
      console.error('❌ Please specify version with --version=X.X.X');
      process.exit(1);
    }
  } else {
    console.log('🏗️  Building all versions...');
    await builder.buildAllVersions();
  }
}

// Export for use as module
module.exports = VersionBuilder;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
