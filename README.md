# SafePI - Security Scanner

A command-line tool for scanning websites using the Mozilla Observatory API to assess their security posture and HTTP security headers.

**Author:** Olivier Reuland

## Features

- 🔍 **Multiple Domain Support**: Scan multiple domains in a single command
- 📊 **Multiple Output Formats**: Choose between text, pretty (colored), or HTML reports
- 🎯 **Configurable Scoring**: Set minimum passing scores for your security requirements
- 📁 **HTML Report Generation**: Generate professional HTML reports with timestamps
- 🎨 **Colored Output**: Easy-to-read colored terminal output
- ⚡ **Fast & Reliable**: Built on Node.js with robust error handling
- 🔒 **Privacy Options**: Control scan visibility and caching behavior

## Installation

1. Clone this repository or download the `safepi.js` file
2. Ensure you have Node.js installed (version 12 or higher recommended)
3. Make the script executable (optional):
   ```bash
   chmod +x safepi.js
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

# Multiple domains with custom settings
node safepi.js -d domain1.com,domain2.com -s 85 -r html -o reports/ --hidden false
```

## Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--domain` | `-d` | Domain(s) to scan (comma-separated) | **Required** |
| `--score` | `-s` | Minimum score required | `100` |
| `--report` | `-r` | Output format: `text`, `pretty`, or `html` | `pretty` |
| `--output` | `-o` | Path for HTML reports | `./` |
| `--hidden` | | Hide scan from public results (`true`/`false`) | `true` |
| `--rescan` | | Force rescan of site (`true`/`false`) | `true` |
| `--help` | `-h` | Show help message | |

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

## Sample Output

### Console Output (Pretty Format)
```
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

## Exit Codes

- `0`: All scans passed the minimum score requirement
- `1`: One or more scans failed or encountered errors

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

## Requirements

- Node.js 12.x or higher
- Internet connection for API access
- Write permissions (for HTML report generation)

## API Information

This tool uses the [Mozilla Observatory API](https://observatory.mozilla.org/), which is a free service provided by Mozilla to help website owners assess their security posture.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025 Olivier Reuland

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Changelog

### v1.0.0
- Initial release
- Single domain scanning
- Multiple output formats
- HTML report generation

### v1.1.0
- Added multiple domain support
- Improved error handling
- Enhanced summary reporting
- Better visual separators

## Support

For issues, questions, or contributions, please create an issue in the repository.

---

**Note**: This tool is for educational and security assessment purposes. Always ensure you have permission to scan domains that you don't own.
