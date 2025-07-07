#!/usr/bin/env node

/**
 * SafePI - Security Scanner
 * A command-line tool for scanning websites using the Mozilla Observatory API
 * 
 * @author Olivier Reuland
 * @license MIT
 * @version 1.1.0
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function printUsage() {
  console.log(`
Usage: node safepi.js [options]

Options:
  -d, --domain <domain>     Domain(s) to scan (e.g., jnctn.nz or domain1.com,domain2.com) [required]
  -s, --score <score>       Minimum score required (default: 100)
  -r, --report <format>     Output format: text, pretty, or html (default: pretty)
  -o, --output <path>       Path for HTML reports (default: ./)
  -f, --fail [true|false]   Exit with code 1 on failure (default: false)
  --hidden <true|false>     Hide scan from public results (default: true)
  --rescan <true|false>     Force rescan of site (default: true)
  -h, --help                Show this help message

Examples:
  node safepi.js -d jnctn.nz
  node safepi.js --domain jnctn.nz --score 90
  node safepi.js -d domain1.com,domain2.com,domain3.com
  node safepi.js -d jnctn.nz -r text --hidden false
  node safepi.js -d jnctn.nz -s 85 -r html -o reports/ --rescan false
  node safepi.js -d jnctn.nz --fail
`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'User-Agent': 'SafePI/1.0',
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

function getGradeColor(grade) {
  const gradeColors = {
    'A+': colors.green,
    'A': colors.green,
    'A-': colors.green,
    'B+': colors.yellow,
    'B': colors.yellow,
    'B-': colors.yellow,
    'C+': colors.red,
    'C': colors.red,
    'C-': colors.red,
    'D+': colors.red,
    'D': colors.red,
    'D-': colors.red,
    'F': colors.red
  };
  return gradeColors[grade] || colors.white;
}

function formatTextOutput(result, passingScore) {
  const passed = result.score >= passingScore;
  const status = passed ? 'PASS' : 'FAIL';
  
  return `Security Scan Results for ${result.host || 'Unknown'}
Status: ${status}
Grade: ${result.grade}
Score: ${result.score}/${passingScore}
Tests Passed: ${result.tests_passed}/${result.tests_quantity}
Tests Failed: ${result.tests_failed}
Scanned At: ${result.scanned_at}
Details URL: ${result.details_url || 'N/A'}`;
}

function formatPrettyOutput(result, passingScore) {
  const passed = result.score >= passingScore;
  const statusColor = passed ? colors.green : colors.red;
  const gradeColor = getGradeColor(result.grade);
  
  return `
${colors.bright}${colors.cyan}Security Scan Results${colors.reset}
${colors.bright}Domain:${colors.reset} ${result.host || 'Unknown'}
${colors.bright}Status:${colors.reset} ${statusColor}${passed ? 'PASS' : 'FAIL'}${colors.reset}
${colors.bright}Grade:${colors.reset} ${gradeColor}${colors.bright}${result.grade}${colors.reset}
${colors.bright}Score:${colors.reset} ${result.score >= passingScore ? colors.green : colors.red}${result.score}${colors.reset}/${passingScore}
${colors.bright}Tests:${colors.reset} ${colors.green}${result.tests_passed} passed${colors.reset}, ${result.tests_failed > 0 ? colors.red : colors.green}${result.tests_failed} failed${colors.reset} (${result.tests_quantity} total)
${colors.bright}Scanned:${colors.reset} ${new Date(result.scanned_at).toLocaleString()}
${colors.bright}Details:${colors.reset} ${colors.blue}${result.details_url || 'N/A'}${colors.reset}
`;
}

function formatHtmlOutput(result, passingScore) {
  const passed = result.score >= passingScore;
  const statusColor = passed ? '#28a745' : '#dc3545';
  const gradeColor = result.grade?.startsWith('A') ? '#28a745' : 
                     result.grade?.startsWith('B') ? '#ffc107' : '#dc3545';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Scan Report - ${result.host || 'Unknown'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #333;
            margin: 0;
        }
        .status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: bold;
            color: white;
            background-color: ${statusColor};
        }
        .grade {
            font-size: 2em;
            font-weight: bold;
            color: ${gradeColor};
            margin: 10px 0;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .metric:last-child {
            border-bottom: none;
        }
        .metric-label {
            font-weight: bold;
            color: #555;
        }
        .metric-value {
            color: #333;
        }
        .details-link {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .details-link:hover {
            background-color: #0056b3;
        }
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Security Scan Report</h1>
            <h2>${result.host || 'Unknown Domain'}</h2>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="status">${passed ? 'PASS' : 'FAIL'}</div>
            <div class="grade">${result.grade}</div>
        </div>
        
        <div class="metric">
            <span class="metric-label">Score:</span>
            <span class="metric-value" style="color: ${result.score >= passingScore ? '#28a745' : '#dc3545'};">
                ${result.score}/${passingScore}
            </span>
        </div>
        
        <div class="metric">
            <span class="metric-label">Tests Passed:</span>
            <span class="metric-value" style="color: #28a745;">${result.tests_passed}</span>
        </div>
        
        <div class="metric">
            <span class="metric-label">Tests Failed:</span>
            <span class="metric-value" style="color: ${result.tests_failed > 0 ? '#dc3545' : '#28a745'};">${result.tests_failed}</span>
        </div>
        
        <div class="metric">
            <span class="metric-label">Total Tests:</span>
            <span class="metric-value">${result.tests_quantity}</span>
        </div>
        
        <div class="metric">
            <span class="metric-label">Algorithm Version:</span>
            <span class="metric-value">${result.algorithm_version || 'N/A'}</span>
        </div>
        
        ${result.details_url ? `
        <div style="text-align: center;">
            <a href="${result.details_url}" class="details-link" target="_blank">
                View Detailed Report
            </a>
        </div>
        ` : ''}
        
        <div class="timestamp">
            Generated on ${new Date().toLocaleString()}<br>
            Scan performed on ${new Date(result.scanned_at).toLocaleString()}
        </div>
    </div>
</body>
</html>`;
}

function generateTimestamp() {
  const now = new Date();
  return now.getFullYear().toString() +
         (now.getMonth() + 1).toString().padStart(2, '0') +
         now.getDate().toString().padStart(2, '0') +
         now.getHours().toString().padStart(2, '0') +
         now.getMinutes().toString().padStart(2, '0') +
         now.getSeconds().toString().padStart(2, '0');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    domains: [],
    score: 100,
    fail: false,
    hidden: true,
    rescan: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-h' || arg === '--help') {
      printUsage();
      process.exit(0);
    } else if (arg === '-d' || arg === '--domain') {
      if (i + 1 >= args.length) {
        console.error('Error: --domain requires a value');
        process.exit(1);
      }
      const domainArg = args[++i];
      // Split by comma and trim whitespace
      options.domains = domainArg.split(',').map(d => d.trim()).filter(d => d.length > 0);
    } else if (arg === '-s' || arg === '--score') {
      if (i + 1 >= args.length) {
        console.error('Error: --score requires a value');
        process.exit(1);
      }
      options.score = parseInt(args[++i]);
      if (isNaN(options.score)) {
        console.error('Error: --score must be a number');
        process.exit(1);
      }
    } else if (arg === '-r' || arg === '--report') {
      if (i + 1 >= args.length) {
        console.error('Error: --report requires a value');
        process.exit(1);
      }
      options.report = args[++i];
      if (!['text', 'pretty', 'html'].includes(options.report)) {
        console.error('Error: --report must be one of: text, pretty, html');
        process.exit(1);
      }
    } else if (arg === '-o' || arg === '--output') {
      if (i + 1 >= args.length) {
        console.error('Error: --output requires a value');
        process.exit(1);
      }
      options.output = args[++i];
    } else if (arg === "-f" || arg === "--fail") {
      if (i + 1 >= args.length || args[i + 1].startsWith("-")) {
        options.fail = true;
      } else {
        const value = args[++i].toLowerCase();
        if (value === "true") {
          options.fail = true;
        } else if (value === "false") {
          options.fail = false;
        } else {
          console.error("Error: --fail must be either true or false");
          process.exit(1);
        }
      }
    } else if (arg === "--hidden") {
      if (i + 1 >= args.length) {
        console.error('Error: --hidden requires a value (true or false)');
        process.exit(1);
      }
      const value = args[++i].toLowerCase();
      if (value === 'true') {
        options.hidden = true;
      } else if (value === 'false') {
        options.hidden = false;
      } else {
        console.error('Error: --hidden must be either true or false');
        process.exit(1);
      }
    } else if (arg === '--rescan') {
      if (i + 1 >= args.length) {
        console.error('Error: --rescan requires a value (true or false)');
        process.exit(1);
      }
      const value = args[++i].toLowerCase();
      if (value === 'true') {
        options.rescan = true;
      } else if (value === 'false') {
        options.rescan = false;
      } else {
        console.error('Error: --rescan must be either true or false');
        process.exit(1);
      }
    } else {
      console.error(`Error: Unknown option '${arg}'`);
      printUsage();
      process.exit(1);
    }
  }

  // Validate required options
  if (!options.domains || options.domains.length === 0) {
    console.error('Error: --domain is required');
    printUsage();
    process.exit(1);
  }

  return options;
}

async function scanSingleDomain(hostDomain, options) {
  const { score: passingScore, report: reportFormat, output: reportPath, hidden, rescan } = options;
  
  try {
    console.log(`Scanning ${hostDomain}...`);
    
    const url = `https://observatory-api.mdn.mozilla.net/api/v2/scan?host=${encodeURIComponent(hostDomain)}`;
    const requestData = JSON.stringify({
      hidden: hidden,
      rescan: rescan
    });
    const response = await makeRequest(url, 'POST', requestData);
    
    if (response.statusCode !== 200) {
      console.error(`API Error for ${hostDomain}: HTTP ${response.statusCode}`);
      console.error(JSON.stringify(response.data, null, 2));
      return { domain: hostDomain, success: false, error: `HTTP ${response.statusCode}` };
    }

    const result = response.data;
    
    if (result.error) {
      console.error(`Scan Error for ${hostDomain}: ${result.error}`);
      return { domain: hostDomain, success: false, error: result.error };
    }

    // Add host to result for display purposes
    result.host = hostDomain;
    
    let output;
    switch (reportFormat) {
      case 'text':
        output = formatTextOutput(result, passingScore);
        console.log(output);
        break;
        
      case 'pretty':
        output = formatPrettyOutput(result, passingScore);
        console.log(output);
        break;
        
      case 'html':
        output = formatHtmlOutput(result, passingScore);
        
        // Ensure report directory exists
        if (!fs.existsSync(reportPath)) {
          fs.mkdirSync(reportPath, { recursive: true });
        }
        
        const timestamp = generateTimestamp();
        const filename = `safepi_${hostDomain.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.html`;
        const filepath = path.join(reportPath, filename);
        
        fs.writeFileSync(filepath, output);
        console.log(`HTML report saved to: ${filepath}`);
        break;
    }
    
    return { 
      domain: hostDomain, 
      success: true, 
      score: result.score, 
      passingScore: passingScore,
      passed: result.score >= passingScore
    };
    
  } catch (error) {
    console.error(`Error scanning ${hostDomain}: ${error.message}`);
    return { domain: hostDomain, success: false, error: error.message };
  }
}

async function main() {
  const options = parseArgs();
  const { domains, score: passingScore } = options;

  const results = [];
  let hasFailures = false;

  // Process each domain
  for (const domain of domains) {
    const result = await scanSingleDomain(domain, options);
    results.push(result);
    
    if (!result.success || (result.success && !result.passed)) {
      hasFailures = true;
    }
    
    // Add separator between domains if scanning multiple
    if (domains.length > 1 && domain !== domains[domains.length - 1]) {
      console.log('\n' + '='.repeat(50) + '\n');
    }
  }
  
  // Summary for multiple domains
  if (domains.length > 1) {
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.bright}${colors.cyan}SCAN SUMMARY${colors.reset}`);
    console.log('='.repeat(50));
    
    for (const result of results) {
      if (result.success) {
        const statusColor = result.passed ? colors.green : colors.red;
        const status = result.passed ? 'PASS' : 'FAIL';
        console.log(`${result.domain}: ${statusColor}${status}${colors.reset} (${result.score}/${result.passingScore})`);
      } else {
        console.log(`${result.domain}: ${colors.red}ERROR${colors.reset} (${result.error})`);
      }
    }
    
    const successfulScans = results.filter(r => r.success);
    const passedScans = results.filter(r => r.success && r.passed);
    const failedScans = results.filter(r => r.success && !r.passed);
    const errorScans = results.filter(r => !r.success);
    
    console.log('\n' + colors.bright + 'Results:' + colors.reset);
    console.log(`  ${colors.green}Passed: ${passedScans.length}${colors.reset}`);
    console.log(`  ${colors.red}Failed: ${failedScans.length}${colors.reset}`);
    console.log(`  ${colors.red}Errors: ${errorScans.length}${colors.reset}`);
    console.log(`  Total: ${domains.length}`);
  }
  
  // Exit with non-zero code only if --fail is true and there are failures
  if (shouldFailOnError && hasFailures) {
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

if (require.main === module) {
  main();
}
