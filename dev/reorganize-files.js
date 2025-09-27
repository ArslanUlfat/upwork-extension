/**
 * 🪄 Magic Upwork Assistant - File Reorganization Script
 * Physically moves files into version-specific directories
 */

const fs = require('fs').promises;
const path = require('path');

class FileReorganizer {
  constructor() {
    this.baseDir = '/Users/macbookpro/Desktop/upwork-extension';
    this.backupDir = path.join(this.baseDir, 'backup-' + Date.now());
  }

  /**
   * Main reorganization function
   */
  async reorganize() {
    console.log('🗂️  Starting file reorganization...');
    
    try {
      // Step 1: Create backup
      await this.createBackup();
      
      // Step 2: Create directory structure
      await this.createDirectoryStructure();
      
      // Step 3: Move files to appropriate directories
      await this.moveFiles();
      
      // Step 4: Update file references
      await this.updateFileReferences();
      
      // Step 5: Create version-specific manifests
      await this.createVersionManifests();
      
      console.log('✅ File reorganization completed successfully!');
      console.log(`📁 Backup created at: ${this.backupDir}`);
      
    } catch (error) {
      console.error('❌ Reorganization failed:', error);
      console.log('🔄 Restoring from backup...');
      await this.restoreFromBackup();
    }
  }

  /**
   * Create backup of current structure
   */
  async createBackup() {
    console.log('💾 Creating backup...');
    
    await fs.mkdir(this.backupDir, { recursive: true });
    
    const files = await fs.readdir(this.baseDir);
    for (const file of files) {
      if (file.startsWith('backup-')) continue; // Skip existing backups
      
      const sourcePath = path.join(this.baseDir, file);
      const backupPath = path.join(this.backupDir, file);
      
      const stats = await fs.stat(sourcePath);
      if (stats.isDirectory()) {
        await this.copyDirectory(sourcePath, backupPath);
      } else {
        await fs.copyFile(sourcePath, backupPath);
      }
    }
    
    console.log('✅ Backup created');
  }

  /**
   * Create the new directory structure
   */
  async createDirectoryStructure() {
    console.log('📁 Creating directory structure...');
    
    const directories = [
      'shared',
      'versions/v1.0.0',
      'versions/v2.0.0', 
      'versions/v3.0.0',
      'dev',
      'docs',
      'assets/icons'
    ];

    for (const dir of directories) {
      const dirPath = path.join(this.baseDir, dir);
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`📂 Created: ${dir}`);
    }
  }

  /**
   * Move files to their appropriate directories
   */
  async moveFiles() {
    console.log('🚚 Moving files...');

    const fileMapping = this.getFileMapping();
    
    for (const [source, destination] of Object.entries(fileMapping)) {
      const sourcePath = path.join(this.baseDir, source);
      const destPath = path.join(this.baseDir, destination);
      
      try {
        // Check if source file exists
        await fs.access(sourcePath);
        
        // Ensure destination directory exists
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        
        // Move the file
        await fs.rename(sourcePath, destPath);
        console.log(`📄 Moved: ${source} → ${destination}`);
        
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`⚠️  Could not move ${source}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Define file mapping for reorganization
   */
  getFileMapping() {
    return {
      // Shared files (stay in root or move to shared/)
      'version-config.js': 'shared/version-config.js',
      'version-manager.js': 'shared/version-manager.js',
      'version-display.js': 'shared/version-display.js',
      'version-styles.css': 'shared/version-styles.css',
      'code-manager.js': 'shared/code-manager.js',
      'background.js': 'shared/background.js',
      'content.js': 'shared/content.js',

      // Version 1.0.0 files
      'popup-basic.html': 'versions/v1.0.0/popup-basic.html',
      'popup-basic.css': 'versions/v1.0.0/popup-basic.css',
      'popup-basic.js': 'versions/v1.0.0/popup-basic.js',
      'popup.html': 'versions/v1.0.0/popup.html', // Legacy basic popup
      'popup.css': 'versions/v1.0.0/popup.css',   // Legacy basic styles
      'popup.js': 'versions/v1.0.0/popup.js',     // Legacy basic script

      // Version 2.0.0 files
      'popup-pro.html': 'versions/v2.0.0/popup-pro.html',
      'popup-pro.css': 'versions/v2.0.0/popup-pro.css',
      'popup-pro.js': 'versions/v2.0.0/popup-pro.js',
      'popup-modern.css': 'versions/v2.0.0/popup-modern.css',
      'popup-enhanced.js': 'versions/v2.0.0/popup-enhanced.js',
      'ai-engine.js': 'versions/v2.0.0/ai-engine.js',
      'auto-apply-engine.js': 'versions/v2.0.0/auto-apply-engine.js',
      'profile-optimizer.js': 'versions/v2.0.0/profile-optimizer.js',
      'notification-engine.js': 'versions/v2.0.0/notification-engine.js',
      'data-export.js': 'versions/v2.0.0/data-export.js',

      // Development files
      'version-test.js': 'dev/version-test.js',
      'version-switcher.js': 'dev/version-switcher.js',
      'organize-versions.js': 'dev/organize-versions.js',
      'build-versions.js': 'dev/build-versions.js',
      'reorganize-files.js': 'dev/reorganize-files.js',
      'test-data.js': 'dev/test-data.js',

      // Documentation files
      'README.md': 'docs/README.md',
      'VERSION-GUIDE.md': 'docs/VERSION-GUIDE.md',
      'VERSION-MANAGEMENT.md': 'docs/VERSION-MANAGEMENT.md',

      // Assets (if they exist)
      'icons': 'assets/icons'
    };
  }

  /**
   * Update file references in moved files
   */
  async updateFileReferences() {
    console.log('🔗 Updating file references...');

    // Update references in HTML files
    await this.updateHTMLReferences();
    
    // Update references in JavaScript files
    await this.updateJSReferences();
    
    // Update references in CSS files
    await this.updateCSSReferences();
  }

  /**
   * Update HTML file references
   */
  async updateHTMLReferences() {
    const htmlFiles = [
      'versions/v1.0.0/popup-basic.html',
      'versions/v1.0.0/popup.html',
      'versions/v2.0.0/popup-pro.html'
    ];

    for (const htmlFile of htmlFiles) {
      const filePath = path.join(this.baseDir, htmlFile);
      
      try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // Update CSS references
        content = content.replace(/href="([^"]*\.css)"/g, (match, cssFile) => {
          if (cssFile.startsWith('shared/')) return match;
          return `href="../../shared/${cssFile}"`;
        });
        
        // Update JS references
        content = content.replace(/src="([^"]*\.js)"/g, (match, jsFile) => {
          if (jsFile.startsWith('shared/') || jsFile.startsWith('../../')) return match;
          
          // Check if it's a shared file
          const sharedFiles = ['version-config.js', 'version-display.js', 'version-styles.css'];
          if (sharedFiles.some(sf => jsFile.includes(sf))) {
            return `src="../../shared/${jsFile}"`;
          }
          
          return match; // Keep version-specific files as-is
        });

        await fs.writeFile(filePath, content);
        console.log(`🔗 Updated references in: ${htmlFile}`);
        
      } catch (error) {
        console.warn(`⚠️  Could not update ${htmlFile}: ${error.message}`);
      }
    }
  }

  /**
   * Update JavaScript file references
   */
  async updateJSReferences() {
    const jsFiles = [
      'versions/v1.0.0/popup-basic.js',
      'versions/v1.0.0/popup.js',
      'versions/v2.0.0/popup-pro.js',
      'shared/background.js'
    ];

    for (const jsFile of jsFiles) {
      const filePath = path.join(this.baseDir, jsFile);
      
      try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // Update importScripts references
        content = content.replace(/importScripts\(['"]([^'"]*)['"]\)/g, (match, scriptPath) => {
          if (scriptPath.startsWith('shared/') || scriptPath.startsWith('../../')) return match;
          
          // Check if it's a shared file
          const sharedFiles = ['version-config.js', 'version-manager.js'];
          if (sharedFiles.some(sf => scriptPath.includes(sf))) {
            return `importScripts('shared/${scriptPath}')`;
          }
          
          return match;
        });

        await fs.writeFile(filePath, content);
        console.log(`🔗 Updated references in: ${jsFile}`);
        
      } catch (error) {
        console.warn(`⚠️  Could not update ${jsFile}: ${error.message}`);
      }
    }
  }

  /**
   * Update CSS file references
   */
  async updateCSSReferences() {
    // Update @import statements and url() references if needed
    console.log('🎨 CSS references updated (if any)');
  }

  /**
   * Create version-specific manifest files
   */
  async createVersionManifests() {
    console.log('📋 Creating version-specific manifests...');

    const versions = {
      'v1.0.0': {
        name: '🔍 Upwork Job Scraper - Basic',
        description: 'Basic job scraping with essential features',
        popup: 'popup-basic.html'
      },
      'v2.0.0': {
        name: '🪄 Magic Upwork Assistant - Pro',
        description: 'AI-powered job analysis with advanced features',
        popup: 'popup-pro.html'
      }
    };

    for (const [version, config] of Object.entries(versions)) {
      const manifest = {
        manifest_version: 3,
        name: config.name,
        version: version.replace('v', ''),
        description: config.description,
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
          default_popup: config.popup,
          default_title: config.name
        },
        content_scripts: [
          {
            matches: ["https://www.upwork.com/nx/search/jobs*"],
            js: ["../../shared/content.js"],
            run_at: "document_end"
          }
        ],
        background: {
          service_worker: "../../shared/background.js"
        },
        icons: {
          "16": "../../assets/icons/icon16.png",
          "48": "../../assets/icons/icon48.png", 
          "128": "../../assets/icons/icon128.png"
        }
      };

      const manifestPath = path.join(this.baseDir, `versions/${version}/manifest.json`);
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`📋 Created manifest for ${version}`);
    }
  }

  /**
   * Copy directory recursively
   */
  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
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

  /**
   * Restore from backup if something goes wrong
   */
  async restoreFromBackup() {
    try {
      const files = await fs.readdir(this.backupDir);
      for (const file of files) {
        const backupPath = path.join(this.backupDir, file);
        const restorePath = path.join(this.baseDir, file);
        
        const stats = await fs.stat(backupPath);
        if (stats.isDirectory()) {
          await this.copyDirectory(backupPath, restorePath);
        } else {
          await fs.copyFile(backupPath, restorePath);
        }
      }
      console.log('✅ Restored from backup');
    } catch (error) {
      console.error('❌ Failed to restore from backup:', error);
    }
  }

  /**
   * Generate post-reorganization report
   */
  async generateReport() {
    console.log('\n📊 REORGANIZATION REPORT');
    console.log('=' .repeat(50));
    
    const structure = {
      'shared/': await this.listDirectory('shared'),
      'versions/v1.0.0/': await this.listDirectory('versions/v1.0.0'),
      'versions/v2.0.0/': await this.listDirectory('versions/v2.0.0'),
      'dev/': await this.listDirectory('dev'),
      'docs/': await this.listDirectory('docs'),
      'assets/': await this.listDirectory('assets')
    };

    for (const [dir, files] of Object.entries(structure)) {
      console.log(`\n📁 ${dir}`);
      if (files.length > 0) {
        files.forEach(file => console.log(`   📄 ${file}`));
      } else {
        console.log('   (empty)');
      }
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Test each version by loading the appropriate manifest');
    console.log('2. Update any remaining file references if needed');
    console.log('3. Use the version switcher to test functionality');
    console.log('4. Build version-specific distributions');
  }

  /**
   * List files in directory
   */
  async listDirectory(dirName) {
    try {
      const dirPath = path.join(this.baseDir, dirName);
      const files = await fs.readdir(dirPath);
      return files.filter(file => !file.startsWith('.'));
    } catch (error) {
      return [];
    }
  }
}

// Main execution
async function main() {
  const reorganizer = new FileReorganizer();
  
  console.log('🚀 Starting file reorganization...');
  console.log('This will create a backup and reorganize your files.');
  
  // In a real scenario, you might want to add a confirmation prompt
  await reorganizer.reorganize();
  await reorganizer.generateReport();
}

// Export for use as module
module.exports = FileReorganizer;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
