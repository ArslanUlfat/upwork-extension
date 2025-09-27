/**
 * 🪄 Magic Upwork Assistant - Extension Verification Script
 * Checks if all files are properly organized and accessible
 */

const fs = require('fs').promises;
const path = require('path');

class ExtensionVerifier {
  constructor() {
    this.baseDir = '/Users/macbookpro/Desktop/upwork-extension';
    this.errors = [];
    this.warnings = [];
  }

  async verify() {
    console.log('🔍 Verifying extension structure...\n');

    // Check manifest.json
    await this.checkManifest();

    // Check required directories
    await this.checkDirectories();

    // Check file references
    await this.checkFileReferences();

    // Check for service worker issues
    await this.checkServiceWorkerCompatibility();

    // Generate report
    this.generateReport();
  }

  async checkManifest() {
    console.log('📋 Checking manifest.json...');
    
    try {
      const manifestPath = path.join(this.baseDir, 'manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      // Check required files exist
      const filesToCheck = [
        manifest.action.default_popup,
        manifest.background.service_worker,
        ...manifest.content_scripts.flatMap(cs => cs.js),
        ...manifest.web_accessible_resources.flatMap(war => war.resources),
        ...Object.values(manifest.icons)
      ];

      for (const file of filesToCheck) {
        const filePath = path.join(this.baseDir, file);
        try {
          await fs.access(filePath);
          console.log(`  ✅ ${file}`);
        } catch (error) {
          this.errors.push(`Missing file: ${file}`);
          console.log(`  ❌ ${file} - NOT FOUND`);
        }
      }

    } catch (error) {
      this.errors.push(`Manifest.json error: ${error.message}`);
    }
  }

  async checkDirectories() {
    console.log('\n📁 Checking directory structure...');
    
    const requiredDirs = [
      'shared',
      'versions/v1.0.0',
      'versions/v2.0.0',
      'versions/v3.0.0',
      'dev',
      'docs',
      'assets/icons'
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.baseDir, dir);
      try {
        const stats = await fs.stat(dirPath);
        if (stats.isDirectory()) {
          console.log(`  ✅ ${dir}/`);
        } else {
          this.warnings.push(`${dir} exists but is not a directory`);
        }
      } catch (error) {
        this.warnings.push(`Directory missing: ${dir}`);
        console.log(`  ⚠️  ${dir}/ - NOT FOUND`);
      }
    }
  }

  async checkFileReferences() {
    console.log('\n🔗 Checking file references...');

    // Check HTML files for correct script/css references
    const htmlFiles = [
      'versions/v1.0.0/popup-basic.html',
      'versions/v2.0.0/popup-pro.html'
    ];

    for (const htmlFile of htmlFiles) {
      const filePath = path.join(this.baseDir, htmlFile);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Check for problematic references
        if (content.includes('href="../../shared/popup-')) {
          this.errors.push(`${htmlFile}: Incorrect CSS reference - should be local`);
        }
        
        if (content.includes('src="shared/')) {
          this.errors.push(`${htmlFile}: Incorrect script reference format`);
        }

        console.log(`  ✅ ${htmlFile} references checked`);
      } catch (error) {
        this.warnings.push(`Could not check ${htmlFile}: ${error.message}`);
      }
    }
  }

  async checkServiceWorkerCompatibility() {
    console.log('\n🔧 Checking service worker compatibility...');

    const jsFiles = [
      'shared/version-config.js',
      'shared/version-manager.js',
      'shared/version-display.js',
      'shared/code-manager.js'
    ];

    for (const jsFile of jsFiles) {
      const filePath = path.join(this.baseDir, jsFile);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Check for window object usage without proper context checking
        if (content.includes('window.') && !content.includes('typeof window !== \'undefined\'')) {
          this.errors.push(`${jsFile}: Uses window object without context check`);
        } else {
          console.log(`  ✅ ${jsFile} - Service worker compatible`);
        }
        
      } catch (error) {
        this.warnings.push(`Could not check ${jsFile}: ${error.message}`);
      }
    }
  }

  generateReport() {
    console.log('\n📊 VERIFICATION REPORT');
    console.log('=' .repeat(50));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 ALL CHECKS PASSED!');
      console.log('✅ Extension should load successfully');
    } else {
      if (this.errors.length > 0) {
        console.log(`\n❌ ERRORS (${this.errors.length}):`);
        this.errors.forEach(error => console.log(`  • ${error}`));
      }

      if (this.warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
        this.warnings.forEach(warning => console.log(`  • ${warning}`));
      }

      if (this.errors.length > 0) {
        console.log('\n🚨 Extension may fail to load due to errors above');
      } else {
        console.log('\n✅ Extension should load (warnings are non-critical)');
      }
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Fix any errors listed above');
    console.log('2. Reload the extension in Chrome');
    console.log('3. Check the Chrome extension console for any runtime errors');
    console.log('4. Test the extension functionality');
  }
}

// Run verification
async function main() {
  const verifier = new ExtensionVerifier();
  await verifier.verify();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ExtensionVerifier;
