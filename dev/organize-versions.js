/**
 * 🪄 Magic Upwork Assistant - Version Organization Script
 * Organizes code files by version for better management
 */

class VersionOrganizer {
  constructor() {
    this.baseDir = '/Users/macbookpro/Desktop/upwork-extension';
    this.versionStructure = this.defineVersionStructure();
  }

  /**
   * Define the ideal version-wise directory structure
   */
  defineVersionStructure() {
    return {
      // Shared/Core files (used across all versions)
      shared: [
        'manifest.json',
        'background.js',
        'content.js',
        'version-config.js',
        'version-manager.js',
        'version-display.js',
        'version-styles.css',
        'code-manager.js'
      ],

      // Version-specific files
      versions: {
        'v1.0.0': {
          name: 'Foundation',
          files: [
            'popup-basic.html',
            'popup-basic.css', 
            'popup-basic.js',
            'basic-scraper.js'
          ],
          features: ['jobScraping', 'basicFiltering', 'slackIntegration', 'jsonExport']
        },
        
        'v2.0.0': {
          name: 'Magic Stick Edition',
          files: [
            'popup-pro.html',
            'popup-pro.css',
            'popup-pro.js',
            'ai-engine.js',
            'auto-apply-engine.js',
            'profile-optimizer.js',
            'notification-engine.js',
            'data-export.js',
            'popup-enhanced.js',
            'popup-modern.css'
          ],
          features: ['aiAnalysis', 'autoApply', 'analytics', 'darkMode', 'smartNotifications']
        },

        'v3.0.0': {
          name: 'AI Master Edition',
          files: [
            'popup-ai.html',
            'popup-ai.css',
            'popup-ai.js',
            'gpt4-engine.js',
            'team-manager.js',
            'mobile-sync.js',
            'client-insights.js',
            'video-proposals.js'
          ],
          features: ['gpt4Integration', 'teamFeatures', 'mobileApp', 'clientInsights']
        }
      },

      // Development and testing files
      development: [
        'version-test.js',
        'version-switcher.js',
        'organize-versions.js',
        'test-data.js'
      ],

      // Documentation files
      documentation: [
        'README.md',
        'VERSION-GUIDE.md',
        'CHANGELOG.md'
      ],

      // Asset files
      assets: [
        'icons/',
        'images/',
        'fonts/'
      ]
    };
  }

  /**
   * Generate organized directory structure
   */
  generateDirectoryStructure() {
    return {
      // Root level - shared files and main structure
      '/': {
        files: this.versionStructure.shared,
        description: 'Core files used across all versions'
      },

      // Version-specific directories
      '/versions/': {
        description: 'Version-specific implementations',
        subdirectories: Object.keys(this.versionStructure.versions).reduce((acc, version) => {
          const versionData = this.versionStructure.versions[version];
          acc[version] = {
            files: versionData.files,
            description: `${versionData.name} - ${versionData.features.join(', ')}`,
            features: versionData.features
          };
          return acc;
        }, {})
      },

      // Development tools
      '/dev/': {
        files: this.versionStructure.development,
        description: 'Development and testing utilities'
      },

      // Documentation
      '/docs/': {
        files: this.versionStructure.documentation,
        description: 'Documentation and guides'
      },

      // Assets
      '/assets/': {
        files: this.versionStructure.assets,
        description: 'Images, icons, and other assets'
      }
    };
  }

  /**
   * Create version-specific build configurations
   */
  generateBuildConfigs() {
    const configs = {};

    Object.keys(this.versionStructure.versions).forEach(version => {
      const versionData = this.versionStructure.versions[version];
      
      configs[version] = {
        name: versionData.name,
        version: version.replace('v', ''),
        files: {
          shared: this.versionStructure.shared,
          specific: versionData.files
        },
        features: versionData.features,
        manifest: {
          name: `🪄 Magic Upwork Assistant - ${versionData.name}`,
          version: version.replace('v', ''),
          description: this.getVersionDescription(version)
        },
        build: {
          entry: this.getEntryPoint(version),
          output: `dist/${version}/`,
          include: [...this.versionStructure.shared, ...versionData.files],
          exclude: this.getExcludedFiles(version)
        }
      };
    });

    return configs;
  }

  /**
   * Get version-specific description
   */
  getVersionDescription(version) {
    const descriptions = {
      'v1.0.0': 'Basic job scraping with essential features',
      'v2.0.0': 'AI-powered job analysis with advanced features',
      'v3.0.0': 'Enterprise-grade AI assistant with team collaboration'
    };
    return descriptions[version] || 'Upwork job scraper extension';
  }

  /**
   * Get entry point for version
   */
  getEntryPoint(version) {
    const entryPoints = {
      'v1.0.0': 'popup-basic.js',
      'v2.0.0': 'popup-pro.js',
      'v3.0.0': 'popup-ai.js'
    };
    return entryPoints[version] || 'popup.js';
  }

  /**
   * Get files to exclude for specific version
   */
  getExcludedFiles(targetVersion) {
    const excluded = [];
    
    Object.keys(this.versionStructure.versions).forEach(version => {
      if (version !== targetVersion) {
        excluded.push(...this.versionStructure.versions[version].files);
      }
    });

    return excluded;
  }

  /**
   * Generate file mapping for current structure
   */
  analyzeCurrentStructure() {
    const currentFiles = [
      'manifest.json', 'background.js', 'content.js',
      'popup.html', 'popup.css', 'popup.js',
      'popup-pro.html', 'popup-pro.css', 'popup-pro.js',
      'popup-basic.html', 'popup-basic.css', 'popup-basic.js',
      'ai-engine.js', 'auto-apply-engine.js', 'profile-optimizer.js',
      'notification-engine.js', 'data-export.js', 'popup-enhanced.js',
      'version-config.js', 'version-manager.js', 'version-display.js',
      'version-styles.css', 'version-test.js', 'version-switcher.js',
      'README.md', 'VERSION-GUIDE.md', 'test-data.js'
    ];

    const analysis = {
      shared: [],
      v1: [],
      v2: [],
      v3: [],
      development: [],
      documentation: [],
      unclassified: []
    };

    currentFiles.forEach(file => {
      if (this.versionStructure.shared.includes(file)) {
        analysis.shared.push(file);
      } else if (this.versionStructure.versions['v1.0.0'].files.includes(file)) {
        analysis.v1.push(file);
      } else if (this.versionStructure.versions['v2.0.0'].files.includes(file)) {
        analysis.v2.push(file);
      } else if (this.versionStructure.versions['v3.0.0'].files.includes(file)) {
        analysis.v3.push(file);
      } else if (this.versionStructure.development.includes(file)) {
        analysis.development.push(file);
      } else if (this.versionStructure.documentation.includes(file)) {
        analysis.documentation.push(file);
      } else {
        analysis.unclassified.push(file);
      }
    });

    return analysis;
  }

  /**
   * Generate migration plan for organizing files
   */
  generateMigrationPlan() {
    const analysis = this.analyzeCurrentStructure();
    const plan = {
      actions: [],
      summary: {
        totalFiles: 0,
        filesToMove: 0,
        newDirectories: 0
      }
    };

    // Create version directories
    Object.keys(this.versionStructure.versions).forEach(version => {
      plan.actions.push({
        type: 'create_directory',
        path: `versions/${version}`,
        description: `Create directory for ${this.versionStructure.versions[version].name}`
      });
      plan.summary.newDirectories++;
    });

    // Create other directories
    ['dev', 'docs', 'assets'].forEach(dir => {
      plan.actions.push({
        type: 'create_directory',
        path: dir,
        description: `Create ${dir} directory`
      });
      plan.summary.newDirectories++;
    });

    // Move version-specific files
    Object.keys(this.versionStructure.versions).forEach(version => {
      const versionFiles = this.versionStructure.versions[version].files;
      versionFiles.forEach(file => {
        if (analysis.v1.includes(file) || analysis.v2.includes(file)) {
          plan.actions.push({
            type: 'move_file',
            from: file,
            to: `versions/${version}/${file}`,
            description: `Move ${file} to ${version} directory`
          });
          plan.summary.filesToMove++;
        }
      });
    });

    // Move development files
    this.versionStructure.development.forEach(file => {
      if (analysis.development.includes(file)) {
        plan.actions.push({
          type: 'move_file',
          from: file,
          to: `dev/${file}`,
          description: `Move ${file} to dev directory`
        });
        plan.summary.filesToMove++;
      }
    });

    // Move documentation files
    this.versionStructure.documentation.forEach(file => {
      if (analysis.documentation.includes(file)) {
        plan.actions.push({
          type: 'move_file',
          from: file,
          to: `docs/${file}`,
          description: `Move ${file} to docs directory`
        });
        plan.summary.filesToMove++;
      }
    });

    plan.summary.totalFiles = Object.values(analysis).flat().length;

    return plan;
  }

  /**
   * Generate package.json for version management
   */
  generatePackageJson() {
    return {
      name: "magic-upwork-assistant",
      version: "2.0.0",
      description: "AI-powered Upwork job scraper with version management",
      scripts: {
        "build": "node build-versions.js",
        "build:v1": "node build-versions.js --version=1.0.0",
        "build:v2": "node build-versions.js --version=2.0.0",
        "build:v3": "node build-versions.js --version=3.0.0",
        "test": "node dev/version-test.js",
        "organize": "node organize-versions.js",
        "switch:v1": "node dev/version-switcher.js --version=1.0.0",
        "switch:v2": "node dev/version-switcher.js --version=2.0.0",
        "switch:v3": "node dev/version-switcher.js --version=3.0.0"
      },
      devDependencies: {
        "fs-extra": "^11.0.0",
        "path": "^0.12.7"
      },
      repository: {
        type: "git",
        url: "https://github.com/yourusername/magic-upwork-assistant"
      },
      keywords: ["upwork", "scraper", "ai", "chrome-extension", "freelancing"],
      author: "Your Name",
      license: "MIT"
    };
  }

  /**
   * Print organization report
   */
  printReport() {
    console.log('🗂️  VERSION-WISE CODE ORGANIZATION REPORT');
    console.log('=' .repeat(50));
    
    const structure = this.generateDirectoryStructure();
    const analysis = this.analyzeCurrentStructure();
    const buildConfigs = this.generateBuildConfigs();
    
    console.log('\n📁 PROPOSED DIRECTORY STRUCTURE:');
    Object.keys(structure).forEach(dir => {
      console.log(`\n${dir}`);
      console.log(`  Description: ${structure[dir].description}`);
      
      if (structure[dir].files) {
        console.log(`  Files: ${structure[dir].files.length}`);
        structure[dir].files.forEach(file => {
          console.log(`    - ${file}`);
        });
      }
      
      if (structure[dir].subdirectories) {
        Object.keys(structure[dir].subdirectories).forEach(subdir => {
          const subdirData = structure[dir].subdirectories[subdir];
          console.log(`  \n  ${subdir}/`);
          console.log(`    Description: ${subdirData.description}`);
          console.log(`    Files: ${subdirData.files.length}`);
          subdirData.files.forEach(file => {
            console.log(`      - ${file}`);
          });
        });
      }
    });

    console.log('\n📊 CURRENT FILE ANALYSIS:');
    Object.keys(analysis).forEach(category => {
      if (analysis[category].length > 0) {
        console.log(`\n${category.toUpperCase()}: ${analysis[category].length} files`);
        analysis[category].forEach(file => {
          console.log(`  - ${file}`);
        });
      }
    });

    console.log('\n🔧 BUILD CONFIGURATIONS:');
    Object.keys(buildConfigs).forEach(version => {
      const config = buildConfigs[version];
      console.log(`\n${version} - ${config.name}`);
      console.log(`  Entry: ${config.build.entry}`);
      console.log(`  Output: ${config.build.output}`);
      console.log(`  Files: ${config.build.include.length} included, ${config.build.exclude.length} excluded`);
      console.log(`  Features: ${config.features.join(', ')}`);
    });

    const migrationPlan = this.generateMigrationPlan();
    console.log('\n📋 MIGRATION PLAN:');
    console.log(`  Total Actions: ${migrationPlan.actions.length}`);
    console.log(`  Files to Move: ${migrationPlan.summary.filesToMove}`);
    console.log(`  New Directories: ${migrationPlan.summary.newDirectories}`);
  }
}

// Create and run organizer
const organizer = new VersionOrganizer();

// Export for use
if (typeof window !== 'undefined') {
  window.versionOrganizer = organizer;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VersionOrganizer;
}

// Auto-run report if called directly
if (typeof require !== 'undefined' && require.main === module) {
  organizer.printReport();
}
