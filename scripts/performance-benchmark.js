const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

/**
 * Performance Benchmark Suite
 * Measures bundle size, build time, and runtime performance
 */

class PerformanceBenchmark {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      buildTime: 0,
      bundleSize: {},
      metrics: {},
    };
  }

  // Measure build performance
  async measureBuildTime() {
    const startTime = performance.now();
    
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      console.log('🔨 Running production build...');
      const { stdout } = await execAsync('npm run build');
      
      const buildTime = performance.now() - startTime;
      this.results.buildTime = Math.round(buildTime);
      
      console.log('✅ Build completed in ' + this.results.buildTime + 'ms');
      return buildTime;
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      throw error;
    }
  }

  // Analyze bundle sizes
  async analyzeBundleSize() {
    const buildDir = path.join(process.cwd(), '.next');
    const staticDir = path.join(buildDir, 'static');
    
    if (!fs.existsSync(staticDir)) {
      console.log('⚠️  No build directory found. Run npm run build first.');
      return;
    }

    console.log('📦 Analyzing bundle sizes...');
    
    const bundleInfo = {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      chunks: []
    };

    // Analyze JavaScript chunks
    const chunksDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(chunksDir)) {
      const chunks = fs.readdirSync(chunksDir, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
        .map(dirent => {
          const filePath = path.join(chunksDir, dirent.name);
          const stats = fs.statSync(filePath);
          return {
            name: dirent.name,
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024 * 100) / 100
          };
        })
        .sort((a, b) => b.size - a.size);

      bundleInfo.chunks = chunks;
      bundleInfo.jsSize = chunks.reduce((total, chunk) => total + chunk.size, 0);
    }

    // Analyze CSS files
    const cssDir = path.join(staticDir, 'css');
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.css'));

      bundleInfo.cssSize = cssFiles.reduce((total, file) => {
        const filePath = path.join(cssDir, file.name);
        const stats = fs.statSync(filePath);
        return total + stats.size;
      }, 0);
    }

    bundleInfo.totalSize = bundleInfo.jsSize + bundleInfo.cssSize;
    
    this.results.bundleSize = {
      total: Math.round(bundleInfo.totalSize / 1024 * 100) / 100,
      js: Math.round(bundleInfo.jsSize / 1024 * 100) / 100,
      css: Math.round(bundleInfo.cssSize / 1024 * 100) / 100,
      chunks: bundleInfo.chunks.slice(0, 10) // Top 10 largest chunks
    };

    console.log('📊 Total bundle size: ' + this.results.bundleSize.total + 'KB');
    console.log('   JavaScript: ' + this.results.bundleSize.js + 'KB');
    console.log('   CSS: ' + this.results.bundleSize.css + 'KB');
    
    return bundleInfo;
  }

  // Generate optimization recommendations
  generateRecommendations() {
    const recommendations = [];
    const { bundleSize, buildTime } = this.results;

    // Bundle size recommendations
    if (bundleSize.total > 500) {
      recommendations.push({
        type: 'Bundle Size',
        priority: 'High',
        issue: 'Total bundle size (' + bundleSize.total + 'KB) is large',
        suggestion: 'Consider code splitting, tree shaking, and dynamic imports'
      });
    }

    if (bundleSize.js > 300) {
      recommendations.push({
        type: 'JavaScript',
        priority: 'Medium',
        issue: 'JavaScript bundle (' + bundleSize.js + 'KB) could be optimized',
        suggestion: 'Use React.lazy() for code splitting and optimize imports'
      });
    }

    // Build time recommendations
    if (buildTime > 30000) { // 30 seconds
      recommendations.push({
        type: 'Build Performance',
        priority: 'Medium',
        issue: 'Build time (' + Math.round(buildTime/1000) + 's) is slow',
        suggestion: 'Consider using Turbopack and optimizing webpack configuration'
      });
    }

    // Add general recommendations
    recommendations.push(
      {
        type: 'Images',
        priority: 'Medium',
        issue: 'Ensure all images are optimized',
        suggestion: 'Use next/image with WebP/AVIF formats and proper sizing'
      },
      {
        type: 'Caching',
        priority: 'High',
        issue: 'Implement aggressive caching strategy',
        suggestion: 'Set proper Cache-Control headers and use CDN'
      },
      {
        type: 'Core Web Vitals',
        priority: 'High',
        issue: 'Monitor Core Web Vitals regularly',
        suggestion: 'Use Lighthouse CI and Performance Observer API'
      }
    );

    return recommendations;
  }

  // Generate performance report
  generateReport() {
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    const reportData = {
      ...this.results,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log('📋 Performance report saved to ' + reportPath);

    // Generate markdown report
    this.generateMarkdownReport(reportData);
    
    return reportData;
  }

  // Generate markdown report
  generateMarkdownReport(data) {
    const reportPath = path.join(process.cwd(), 'PERFORMANCE-REPORT.md');
    const buildTimeSeconds = Math.round(data.buildTime/1000);
    const buildStatus = data.buildTime < 15000 ? '✅' : data.buildTime < 30000 ? '⚠️' : '❌';
    const bundleStatus = data.bundleSize.total < 300 ? '✅' : data.bundleSize.total < 500 ? '⚠️' : '❌';
    const jsStatus = data.bundleSize.js < 200 ? '✅' : data.bundleSize.js < 300 ? '⚠️' : '❌';
    const cssStatus = data.bundleSize.css < 50 ? '✅' : data.bundleSize.css < 100 ? '⚠️' : '❌';
    
    const markdown = '# Performance Report - ' + data.timestamp.split('T')[0] + '\n\n' +
      '## Executive Summary\n' +
      '| Metric | Value | Status |\n' +
      '|--------|-------|--------|\n' +
      '| Build Time | ' + buildTimeSeconds + 's | ' + buildStatus + ' |\n' +
      '| Total Bundle | ' + data.bundleSize.total + 'KB | ' + bundleStatus + ' |\n' +
      '| JS Bundle | ' + data.bundleSize.js + 'KB | ' + jsStatus + ' |\n' +
      '| CSS Bundle | ' + data.bundleSize.css + 'KB | ' + cssStatus + ' |\n\n' +
      '## Bundle Analysis\n\n' +
      '### Largest JavaScript Chunks\n' +
      data.bundleSize.chunks.map((chunk, i) => 
        (i + 1) + '. **' + chunk.name + '** - ' + chunk.sizeKB + 'KB'
      ).join('\n') + '\n\n' +
      '## Recommendations\n\n' +
      '### Immediate Actions\n' +
      data.recommendations
        .filter(r => r.priority === 'High')
        .map(r => '- **' + r.type + '**: ' + r.issue + '\n  *Solution*: ' + r.suggestion)
        .join('\n\n') + '\n\n' +
      '### Next Sprint\n' +
      data.recommendations
        .filter(r => r.priority === 'Medium')
        .map(r => '- **' + r.type + '**: ' + r.issue + '\n  *Solution*: ' + r.suggestion)
        .join('\n\n') + '\n\n' +
      '## Build Details\n' +
      '- **Timestamp**: ' + data.timestamp + '\n' +
      '- **Build Time**: ' + buildTimeSeconds + 's\n' +
      '- **Node.js Version**: ' + process.version + '\n' +
      '- **Environment**: ' + (process.env.NODE_ENV || 'development') + '\n\n' +
      '---\n\n' +
      '*Generated by Performance Benchmark Suite*\n';

    fs.writeFileSync(reportPath, markdown);
    console.log('📄 Markdown report saved to ' + reportPath);
  }

  // Run full benchmark suite
  async run() {
    console.log('🚀 Starting Performance Benchmark Suite\n');
    
    try {
      await this.measureBuildTime();
      await this.analyzeBundleSize();
      
      const report = this.generateReport();
      
      console.log('\n✅ Benchmark completed successfully!');
      console.log('📊 Total bundle size: ' + report.bundleSize.total + 'KB');
      console.log('⏱️  Build time: ' + Math.round(report.buildTime/1000) + 's');
      console.log('💡 ' + report.recommendations.length + ' recommendations generated');
      
    } catch (error) {
      console.error('❌ Benchmark failed:', error.message);
      process.exit(1);
    }
  }
}

// Run benchmark if called directly
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  benchmark.run();
}

module.exports = PerformanceBenchmark;
END < /dev/null