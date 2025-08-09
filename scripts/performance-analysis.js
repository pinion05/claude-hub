#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function analyzeBundle() {
  log('\n📦 BUNDLE SIZE ANALYSIS', colors.bright + colors.blue);
  log('=' .repeat(50));

  const buildDir = path.join(__dirname, '../.next');
  
  if (!fs.existsSync(buildDir)) {
    log('Build directory not found. Running build...', colors.yellow);
    execSync('npm run build', { stdio: 'inherit' });
  }

  // Analyze static chunks
  const chunksDir = path.join(buildDir, 'static/chunks');
  if (fs.existsSync(chunksDir)) {
    const chunks = fs.readdirSync(chunksDir);
    let totalSize = 0;
    
    log('\n📊 Static Chunks:', colors.cyan);
    chunks.forEach(chunk => {
      const filePath = path.join(chunksDir, chunk);
      const stats = fs.statSync(filePath);
      const sizeInKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      
      if (stats.size > 50 * 1024) { // Files larger than 50KB
        log(`  ⚠️  ${chunk}: ${sizeInKB} KB`, colors.yellow);
      } else {
        log(`  ✓  ${chunk}: ${sizeInKB} KB`, colors.green);
      }
    });
    
    log(`\n  Total chunks size: ${(totalSize / 1024).toFixed(2)} KB`, colors.bright);
  }
}

function analyzeDependencies() {
  log('\n📚 DEPENDENCY ANALYSIS', colors.bright + colors.blue);
  log('=' .repeat(50));

  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  log('\nProduction Dependencies:', colors.cyan);
  Object.entries(dependencies).forEach(([name, version]) => {
    log(`  • ${name}: ${version}`);
  });

  // Check for potentially heavy dependencies
  const heavyDeps = ['moment', 'lodash', 'jquery'];
  const foundHeavy = Object.keys(dependencies).filter(dep => 
    heavyDeps.some(heavy => dep.includes(heavy))
  );
  
  if (foundHeavy.length > 0) {
    log('\n⚠️  Heavy dependencies detected:', colors.yellow);
    foundHeavy.forEach(dep => log(`  • ${dep}`, colors.yellow));
  } else {
    log('\n✅ No heavy dependencies detected', colors.green);
  }
}

function analyzeComponents() {
  log('\n🧩 COMPONENT ANALYSIS', colors.bright + colors.blue);
  log('=' .repeat(50));

  const componentsDir = path.join(__dirname, '../src/components');
  let componentStats = {
    total: 0,
    withMemo: 0,
    withLazy: 0,
    largeComponents: []
  };

  function analyzeDirectory(dir, level = 0) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        analyzeDirectory(fullPath, level + 1);
      } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
        componentStats.total++;
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for React.memo
        if (content.includes('React.memo') || content.includes('memo(')) {
          componentStats.withMemo++;
        }
        
        // Check for lazy loading
        if (content.includes('lazy(') || content.includes('React.lazy')) {
          componentStats.withLazy++;
        }
        
        // Check component size
        const lines = content.split('\n').length;
        if (lines > 200) {
          componentStats.largeComponents.push({
            file: path.relative(componentsDir, fullPath),
            lines
          });
        }
      }
    });
  }

  analyzeDirectory(componentsDir);
  
  log(`\n📊 Component Statistics:`, colors.cyan);
  log(`  Total components: ${componentStats.total}`);
  log(`  Components with memo: ${componentStats.withMemo} (${((componentStats.withMemo/componentStats.total)*100).toFixed(1)}%)`);
  log(`  Components with lazy loading: ${componentStats.withLazy}`);
  
  if (componentStats.largeComponents.length > 0) {
    log(`\n⚠️  Large components (>200 lines):`, colors.yellow);
    componentStats.largeComponents.forEach(comp => {
      log(`  • ${comp.file}: ${comp.lines} lines`, colors.yellow);
    });
  }
}

function analyzePerformancePatterns() {
  log('\n⚡ PERFORMANCE PATTERNS', colors.bright + colors.blue);
  log('=' .repeat(50));

  const srcDir = path.join(__dirname, '../src');
  let patterns = {
    useCallback: 0,
    useMemo: 0,
    debounce: 0,
    throttle: 0,
    virtualList: 0,
    intersection: 0
  };

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory() && !item.startsWith('.')) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        if (content.includes('useCallback')) patterns.useCallback++;
        if (content.includes('useMemo')) patterns.useMemo++;
        if (content.includes('debounce')) patterns.debounce++;
        if (content.includes('throttle')) patterns.throttle++;
        if (content.includes('virtual') || content.includes('Virtual')) patterns.virtualList++;
        if (content.includes('IntersectionObserver')) patterns.intersection++;
      }
    });
  }

  scanDirectory(srcDir);
  
  log('\n📊 Performance Optimizations Found:', colors.cyan);
  log(`  useCallback hooks: ${patterns.useCallback}`);
  log(`  useMemo hooks: ${patterns.useMemo}`);
  log(`  Debounce usage: ${patterns.debounce}`);
  log(`  Throttle usage: ${patterns.throttle}`);
  log(`  Virtual lists: ${patterns.virtualList}`);
  log(`  Intersection Observer: ${patterns.intersection}`);
}

function analyzeImages() {
  log('\n🖼️  IMAGE OPTIMIZATION', colors.bright + colors.blue);
  log('=' .repeat(50));

  const publicDir = path.join(__dirname, '../public');
  const srcDir = path.join(__dirname, '../src');
  
  let imageUsage = {
    nextImage: 0,
    imgTag: 0,
    totalImages: 0
  };

  function scanForImages(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanForImages(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Count Next.js Image component usage
        const nextImageMatches = content.match(/<Image\s/g);
        if (nextImageMatches) {
          imageUsage.nextImage += nextImageMatches.length;
        }
        
        // Count regular img tags
        const imgTagMatches = content.match(/<img\s/g);
        if (imgTagMatches) {
          imageUsage.imgTag += imgTagMatches.length;
        }
      }
    });
  }

  // Count actual image files
  if (fs.existsSync(publicDir)) {
    const countImages = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          countImages(fullPath);
        } else if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(item)) {
          imageUsage.totalImages++;
        }
      });
    };
    countImages(publicDir);
  }

  scanForImages(srcDir);
  
  log('\n📊 Image Usage:', colors.cyan);
  log(`  Total image files: ${imageUsage.totalImages}`);
  log(`  Next.js <Image> components: ${imageUsage.nextImage}`);
  log(`  Regular <img> tags: ${imageUsage.imgTag}`);
  
  if (imageUsage.imgTag > 0) {
    log(`\n⚠️  Found ${imageUsage.imgTag} unoptimized <img> tags`, colors.yellow);
    log('  Consider using Next.js <Image> component for better performance', colors.yellow);
  }
}

function generateReport() {
  log('\n📋 PERFORMANCE RECOMMENDATIONS', colors.bright + colors.magenta);
  log('=' .repeat(50));

  const recommendations = [];

  // Read build output if available
  try {
    const buildOutput = execSync('npm run build 2>&1', { encoding: 'utf8' });
    const firstLoadMatch = buildOutput.match(/First Load JS shared by all\s+(\d+(?:\.\d+)?)\s*(KB|MB)/);
    
    if (firstLoadMatch) {
      const size = parseFloat(firstLoadMatch[1]);
      const unit = firstLoadMatch[2];
      const sizeInKB = unit === 'MB' ? size * 1024 : size;
      
      if (sizeInKB > 150) {
        recommendations.push({
          priority: 'HIGH',
          issue: `First Load JS is ${size} ${unit}`,
          suggestion: 'Consider code splitting and lazy loading to reduce initial bundle size'
        });
      }
    }
  } catch (error) {
    // Ignore build errors for analysis
  }

  // Add contextual recommendations
  recommendations.push({
    priority: 'MEDIUM',
    issue: 'Component optimization',
    suggestion: 'Use React.memo for components that receive stable props'
  });

  recommendations.push({
    priority: 'LOW',
    issue: 'Caching strategy',
    suggestion: 'Implement client-side caching for API responses'
  });

  log('\n🎯 Recommendations:', colors.cyan);
  recommendations.forEach(rec => {
    const priorityColor = rec.priority === 'HIGH' ? colors.red : 
                          rec.priority === 'MEDIUM' ? colors.yellow : 
                          colors.green;
    log(`\n  [${rec.priority}]`, priorityColor);
    log(`  Issue: ${rec.issue}`);
    log(`  Suggestion: ${rec.suggestion}`);
  });
}

// Main execution
function main() {
  log('\n🚀 CLAUDE HUB PERFORMANCE ANALYSIS', colors.bright + colors.magenta);
  log('=' .repeat(50));
  
  analyzeBundle();
  analyzeDependencies();
  analyzeComponents();
  analyzePerformancePatterns();
  analyzeImages();
  generateReport();
  
  log('\n✅ Analysis complete!', colors.bright + colors.green);
  log('=' .repeat(50));
}

main();