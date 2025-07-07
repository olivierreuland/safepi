# SafePI - Security Scanner

A modern, comprehensive command-line tool for scanning websites using the Mozilla Observatory API to assess their security posture and HTTP security headers.

**Author:** Olivier Reuland  
**Version:** 1.3.0

## ✨ Features

- 🔍 **Multiple Domain Support**: Scan multiple domains in a single command
- 📊 **Multiple Output Formats**: Choose between text, pretty (colored), or HTML reports
- 🎯 **Configurable Scoring**: Set minimum passing scores for your security requirements
- 📁 **HTML Report Generation**: Generate professional HTML reports with timestamps
- 🎨 **Colored Output**: Easy-to-read colored terminal output
- ⚡ **Fast & Reliable**: Built on Node.js with robust error handling
- 🔒 **Privacy Options**: Control scan visibility and caching behavior
- 🚨 **Enhanced Exit Control**: Optional --fail flag for CI/CD integration
- 🧪 **Comprehensive Testing**: 87+ tests with excellent coverage
- 📚 **Professional Documentation**: Complete JSDoc documentation
- 🔄 **Modern ES Modules**: Future-proof architecture

## 🚀 Installation

1. Clone this repository or download the `safepi.js` file
2. Ensure you have Node.js installed (version 18.0.0 or higher required)
3. Install dependencies (for development/testing):

   ```bash
   npm install
   ```

## Usage

### Basic Usage

```bash
# Scan a single domain
node safepi.js -d example.com

# Scan multiple domains
node safepi.js -d google.com,github.com,stackoverflow.com
```

### Advanced Usage

```bash
# Set minimum score requirement
node safepi.js -d example.com -s 90

# Generate HTML reports
node safepi.js -d example.com -r html -o reports/

# Exit with error code on failure (great for CI/CD)
node safepi.js -d example.com --fail

# Multiple domains with custom settings
node safepi.js -d domain1.com,domain2.com -s 85 -r html -o reports/ --hidden false

# CI/CD pipeline integration
node safepi.js -d myapp.com -s 95 --fail --hidden false
```

## 📋 Command Line Options

| Option     | Short | Description                                    | Default      |
| ---------- | ----- | ---------------------------------------------- | ------------ |
| `--domain` | `-d`  | Domain(s) to scan (comma-separated)            | **Required** |
| `--score`  | `-s`  | Minimum score required                         | `100`        |
| `--report` | `-r`  | Output format: `text`, `pretty`, or `html`     | `pretty`     |
| `--output` | `-o`  | Path for HTML reports                          | `./`         |
| `--fail`   | `-f`  | Exit with code 1 on failure ([`true`/`false`]) | `false`      |
| `--hidden` |       | Hide scan from public results (`true`/`false`) | `true`       |
| `--rescan` |       | Force rescan of site (`true`/`false`)          | `true`       |
| `--help`   | `-h`  | Show help message                              |              |

### 🚨 New: Enhanced --fail Flag

The `--fail` flag now supports optional values for better usability:

```bash
# These are equivalent (both set fail to true):
node safepi.js -d example.com --fail
node safepi.js -d example.com --fail true

# Explicitly disable failure exit:
node safepi.js -d example.com --fail false
```

Perfect for CI/CD pipelines where you want the build to fail if security standards aren't met!

## Output Formats

### Pretty Format (Default)

Colored terminal output with clear pass/fail indicators and detailed metrics.

### Text Format

Plain text output suitable for parsing or logging.

### HTML Format

Professional HTML reports with:

- Responsive design
- Color-coded results
- Detailed metrics
- Links to full Mozilla Observatory reports
- Timestamp information

## Examples

### Single Domain Scan

```bash
node safepi.js -d github.com
```

### Multiple Domain Scan with Custom Score

```bash
node safepi.js -d google.com,github.com,stackoverflow.com -s 90
```

### Generate HTML Reports

```bash
node safepi.js -d example.com -r html -o reports/
```

### Public Scan with No Caching

```bash
node safepi.js -d example.com --hidden false --rescan false
```

### CI/CD Integration

```bash
# Fail the build if security score is below 90
node safepi.js -d myapp.com -s 90 --fail

# Generate HTML report and fail on issues
node safepi.js -d myapp.com -r html -o security-reports/ --fail
```

## Sample Output

### Console Output (Pretty Format)

```text
Scanning github.com...

Security Scan Results
Domain: github.com
Status: PASS
Grade: A+
Score: 115/90
Tests: 9 passed, 1 failed (10 total)
Scanned: 7/07/2025, 11:47:40 am
Details: https://developer.mozilla.org/en-US/observatory/analyze?host=github.com

==================================================
SCAN SUMMARY
==================================================
github.com: PASS (115/90)

Results:
  Passed: 1
  Failed: 0
  Errors: 0
  Total: 1
```

### HTML Report Features

- Clean, professional design
- Color-coded pass/fail status
- Detailed security metrics
- Link to full Mozilla Observatory analysis
- Responsive layout for mobile devices

## ⚡ Exit Codes

- `0`: All scans passed the minimum score requirement (or --fail is disabled)
- `1`: One or more scans failed or encountered errors (only when --fail is enabled)

### Exit Code Behavior

| Scenario          | --fail false | --fail true | --fail (no value) |
| ----------------- | ------------ | ----------- | ----------------- |
| All tests pass    | Exit 0       | Exit 0      | Exit 0            |
| Some tests fail   | Exit 0       | Exit 1      | Exit 1            |
| Network/API error | Exit 0       | Exit 1      | Exit 1            |

This makes SafePI perfect for CI/CD pipelines where you want builds to fail on security issues.

## Security Headers Tested

The Mozilla Observatory API tests for various security headers including:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- And more...

## Error Handling

The tool includes comprehensive error handling for:

- Network connectivity issues
- Invalid domain names
- API rate limiting
- Malformed responses
- File system errors (for HTML reports)

## 🛠 Development & Testing

### Running Tests

SafePI includes a comprehensive test suite with 87+ tests:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run tests with UI interface
npm run test:ui
```

## 📋 Requirements

- **Node.js 18.0.0 or higher** (ES modules support)
- Internet connection for API access
- Write permissions (for HTML report generation)
- Modern terminal with ANSI color support (for pretty output)

## API Information

This tool uses the [Mozilla Observatory API](https://observatory.mozilla.org/), which is a free service provided by Mozilla to help website owners assess their security posture.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. **Run the test suite**: `npm test`
5. **Ensure tests pass**: All tests must pass
6. **Check coverage**: `npm run test:coverage`
7. Test thoroughly with various domains
8. Submit a pull request

### Development Guidelines

- Maintain ES module compatibility
- Add tests for new features
- Update JSDoc documentation
- Follow existing code patterns
- Ensure zero security vulnerabilities

## 📝 Changelog

### v1.3.0 🔒 **Latest Release - Security Enhanced**

- 🛡️ **Enhanced XSS Protection**: Added HTML output sanitization to prevent XSS attacks in reports
- 🔐 **Improved Path Traversal Prevention**: Enhanced directory traversal protection with multiple encoding detection
- ✅ **Domain Input Validation**: Comprehensive domain validation to prevent injection attacks
- � **Network Security Hardening**: API endpoint validation, SSL certificate verification, and response size limits
- ⏱️ **Rate Limiting**: Added respectful API usage with configurable delays between requests
- 🧪 **Security Test Suite**: 17 new security tests covering XSS, path traversal, and input validation
- 📚 **Security Documentation**: Complete security policy and best practices documentation
- 🔧 **Request Timeouts**: 30-second timeout protection against hanging requests
- 🚀 **104+ Total Tests**: Comprehensive test coverage including security edge cases
- 📋 **Security Policy**: User-friendly security reporting and vulnerability disclosure process

### v1.2.0 🎉

- ✨ **Enhanced --fail flag**: Optional value support (--fail defaults to true)
- 🧪 **Comprehensive test suite**: 87 tests with excellent coverage
- 📚 **Complete JSDoc documentation**: Professional code documentation
- 🔄 **ES module migration**: Modern, future-proof architecture
- 📦 **Updated dependencies**: Vitest 3.2.4, zero vulnerabilities
- 🛡️ **Improved security**: Node.js 18+ requirement, better error handling
- 🎯 **CI/CD ready**: Perfect for automated security testing

### v1.1.0

- Added multiple domain support
- Improved error handling
- Enhanced summary reporting
- Better visual separators

### v1.0.0

- Initial release
- Single domain scanning
- Multiple output formats
- HTML report generation

## Support

For issues, questions, or contributions, please create an issue in the repository.

---

**Note**: This tool is for educational and security assessment purposes. Always ensure you have permission to scan domains that you don't own.
