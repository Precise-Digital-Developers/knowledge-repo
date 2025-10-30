# CI/CD Pipeline Guide

## Purpose

This document describes the continuous integration and continuous deployment (CI/CD) pipeline for the knowledge repository. The pipeline ensures code quality, security, and consistency across all contributions.

## Overview

Our CI/CD pipeline consists of three main workflows:

1. **Code Quality** - Ensures all code meets formatting and linting standards
2. **Security Scan** - Detects secrets, credentials, and vulnerable dependencies
3. **Update README** - Automatically updates documentation links when articles are added or modified

## Workflows

### 1. Code Quality Workflow

**File**: `.github/workflows/code-quality.yml`

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

#### Markdown Linting

- **Tool**: `markdownlint-cli`
- **Configuration**: `.markdownlint.json`
- **Purpose**: Ensures consistent markdown formatting and style
- **Checks**:
  - Heading structure and hierarchy
  - List formatting and indentation
  - Line length limits
  - Proper link formatting
  - Code block syntax

#### HTML/CSS Linting

- **Tools**: `htmlhint` and `stylelint`
- **Configurations**: `.htmlhintrc` and `.stylelintrc.json`
- **Purpose**: Validates HTML structure and CSS style
- **Checks**:
  - Valid HTML5 syntax
  - Proper tag nesting and closure
  - Accessibility attributes (alt text, ARIA labels)
  - CSS formatting and best practices
  - Consistent naming conventions

#### Prettier Format Check

- **Tool**: `prettier`
- **Configuration**: `.prettierrc`
- **Purpose**: Enforces consistent code formatting
- **Formats**:
  - Markdown (`.md`)
  - HTML (`.html`)
  - CSS (`.css`)
  - JavaScript (`.js`)
  - JSON (`.json`)
  - YAML (`.yml`, `.yaml`)

#### Quarto Document Check

- **Tool**: `quarto`
- **Purpose**: Validates Quarto documents (`.qmd` files)
- **Checks**:
  - Valid YAML frontmatter
  - Proper code chunk syntax
  - Executable R/Python code blocks

### 2. Security Scan Workflow

**File**: `.github/workflows/security-scan.yml`

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Weekly schedule (Mondays at 9:00 AM UTC)

**Jobs**:

#### Secret Detection (TruffleHog)

- **Tool**: TruffleHog
- **Purpose**: Scans for leaked secrets and credentials
- **Detection**:
  - API keys and tokens
  - Database credentials
  - AWS access keys
  - Private keys
  - OAuth tokens

#### GitLeaks Scan

- **Tool**: GitLeaks
- **Purpose**: Additional secret detection with different pattern database
- **Features**:
  - Scans entire git history
  - Custom pattern matching
  - SAST (Static Application Security Testing)

#### Credential Pattern Scan

- **Tool**: Custom bash script with `grep`
- **Purpose**: Searches for common credential patterns
- **Patterns detected**:
  - `password=`
  - `api_key=`
  - `secret=`
  - `token=`
  - `aws_access_key_id`
  - `aws_secret_access_key`
  - `private_key`
  - `client_secret`
  - Bearer tokens

#### Sensitive File Type Check

- **Tool**: Custom bash script with `find`
- **Purpose**: Prevents committing sensitive file types and preview files
- **Blocked extensions**:
  - `.pem`, `.key` (Private keys)
  - `.p12`, `.pfx`, `.jks`, `.keystore` (Certificates)
  - `.env` files (Environment variables)
  - SSH keys (`id_rsa`, `id_dsa`)
  - Files containing `credentials` or `secret` in name
- **Preview files check**:
  - `*_files/` folders (Quarto/markdown preview assets)
  - `*.html` files in articles folder (preview output)

#### Dependency Security Check

- **Tool**: `npm audit`
- **Purpose**: Scans npm dependencies for known vulnerabilities
- **Action level**: Moderate severity and above
- **Only runs if**: `package.json` exists in repository

### 3. Update README Workflow

**File**: `.github/workflows/update-readme.yml`

**Triggers**:

- Push to `main` or `develop` branches with changes in `articles/` folder
- Manual trigger via workflow dispatch

**Jobs**:

#### Auto-update Documentation Links

- **Tool**: Custom Node.js script
- **Script**: `.github/scripts/update-readme.js`
- **Purpose**: Automatically scans articles and updates README with links
- **Features**:
  - Extracts article titles from YAML frontmatter or first heading
  - Extracts descriptions from YAML subtitle or first paragraph
  - Auto-categorizes articles based on filename and content
  - Organizes links into sections:
    - Process & Framework Documentation
    - API Integration Guides
    - Infrastructure & Development
    - Other
  - Commits changes back to repository if README was updated

#### How It Works

1. **Metadata Extraction**: Scans all `.md` and `.qmd` files in `articles/` folder
2. **Title Detection**:
   - Checks YAML frontmatter `title:` field first
   - Falls back to first `#` heading in document
   - Uses filename as last resort
3. **Description Extraction**:
   - Uses YAML frontmatter `subtitle:` if available
   - Otherwise extracts first paragraph (max 150 characters)
4. **Auto-categorization**:
   - Analyzes filename, title, and content
   - Assigns to appropriate category
   - Can be overridden with `category:` in YAML frontmatter
5. **README Update**:
   - Replaces `## Documentation` section
   - Preserves all other README content
   - Commits only if changes detected

#### Manual Category Override

Add to your article's YAML frontmatter:

```yaml
---
title: 'My Article Title'
category: 'Process & Framework Documentation'
---
```

## Pre-Commit Hooks

**File**: `.pre-commit-config.yaml`

Pre-commit hooks run locally before each commit to catch issues early.

### Installation

```bash
# Install pre-commit
pip install pre-commit

# Install the hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

### Enabled Hooks

1. **Trailing Whitespace** - Removes trailing spaces
2. **End of File Fixer** - Ensures files end with newline
3. **YAML Checker** - Validates YAML syntax
4. **JSON Checker** - Validates JSON syntax
5. **Large File Check** - Blocks files over 5MB
6. **Case Conflict** - Detects case sensitivity issues
7. **Merge Conflict** - Prevents committing merge markers
8. **Private Key Detection** - Blocks private key files
9. **GitLeaks** - Scans for secrets before commit
10. **Markdownlint** - Lints markdown files
11. **Prettier** - Auto-formats code
12. **Cleanup Preview Files** - Removes `*_files/` folders and `.html` files from articles

## Configuration Files

### `.markdownlint.json`

Markdown linting rules:

- ATX-style headings (using `#`)
- Dash-style lists (using `-`)
- 2-space indentation for nested lists
- 120 character line length for text
- Allows sibling headings with same name
- Permits specific HTML tags (`<br>`, `<details>`, `<img>`)

### `.htmlhintrc`

HTML validation rules:

- Lowercase tag and attribute names
- Double quotes for attribute values
- Unique IDs
- Required alt attributes on images
- HTML5 doctype enforcement
- Dash-style for IDs and classes

### `.stylelintrc.json`

CSS linting rules based on `stylelint-config-standard`:

- 2-space indentation
- Single quotes for strings
- Lowercase hex colors with short notation
- Consistent spacing around selectors and declarations
- Always require semicolons

### `.prettierrc`

Formatting preferences:

- Semicolons required
- Single quotes for strings
- 100 character print width (120 for markdown)
- 2-space tabs
- ES5 trailing commas
- LF line endings

### `.prettierignore`

Excluded from formatting:

- `node_modules/`
- Build output directories
- Git metadata
- OS-specific files (`.DS_Store`, `desktop.ini`)
- IDE configuration folders
- Log files

## Workflow Status Badges

Add these badges to your README to show workflow status:

```markdown
![Code Quality](https://github.com/precise-digital-developers/knowledge-repo/workflows/Code%20Quality/badge.svg)
![Security Scan](https://github.com/precise-digital-developers/knowledge-repo/workflows/Security%20Scan/badge.svg)
![Update README](https://github.com/precise-digital-developers/knowledge-repo/workflows/Update%20README/badge.svg)
```

## Best Practices

### For Contributors

1. **Install pre-commit hooks** to catch issues before pushing
2. **Run linters locally** before committing:

   ```bash
   # Markdown
   markdownlint '**/*.md' --config .markdownlint.json

   # HTML
   htmlhint '**/*.html' --config .htmlhintrc

   # CSS
   stylelint '**/*.css' --config .stylelintrc.json

   # Format all files
   prettier --write "**/*.{md,html,css,js,json,yml,yaml}"
   ```

3. **Never commit secrets** - Use environment variables or secret management tools
4. **Review workflow results** in pull requests before merging
5. **Fix linting errors** immediately - don't disable rules without justification
6. **Add metadata to articles** for better README organization:

   ```yaml
   ---
   title: 'Your Article Title'
   subtitle: 'Brief description for README'
   category: 'Process & Framework Documentation'
   ---
   ```

### For Maintainers

1. **Require passing checks** before merging pull requests
2. **Review security scan results** weekly
3. **Update dependencies** regularly to avoid vulnerabilities
4. **Customize rules** as needed for project-specific requirements
5. **Document exceptions** when rules must be disabled

## Troubleshooting

### Workflow Fails on Markdown Linting

**Issue**: `markdownlint` reports errors

**Solution**:

- Check the error message for specific rule violations
- Fix formatting issues manually or run `prettier --write`
- Review `.markdownlint.json` to understand rule requirements

### Secret Detected in Code

**Issue**: Security scan blocks commit/push

**Solution**:

1. Remove the secret from the file
2. If committed, remove from git history:

   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch <file-with-secret>" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. Rotate the exposed credential immediately
4. Use environment variables or secret management going forward

### Pre-Commit Hook Failures

**Issue**: Pre-commit hooks prevent commit

**Solution**:

- Review the error output
- Run `pre-commit run --all-files` to see all issues
- Fix issues manually or let auto-fixers correct them
- Re-attempt commit

**Emergency bypass** (use sparingly):

```bash
git commit --no-verify -m "message"
```

### HTML/CSS Linting False Positives

**Issue**: Linter flags valid code

**Solution**:

- Review if the code truly follows best practices
- If legitimate exception, add inline comment to disable rule:

  ```html
  <!-- htmlhint attr-lowercase: false -->
  <div dataAttribute="value"></div>
  ```

  ```css
  /* stylelint-disable-next-line color-named */
  color: red;
  ```

## Maintenance

### Updating Workflow Dependencies

Regularly update action versions in workflow files:

```yaml
- uses: actions/checkout@v4 # Check for newer versions
- uses: actions/setup-node@v4
```

### Updating Pre-Commit Hooks

```bash
pre-commit autoupdate
```

### Adding New Linters

1. Add job to `.github/workflows/code-quality.yml`
2. Add configuration file to repository root
3. Update this documentation
4. Test on sample files before enabling

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Pre-commit Hooks](https://pre-commit.com/)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [GitLeaks](https://github.com/gitleaks/gitleaks)
- [HTMLHint Rules](https://htmlhint.com/docs/user-guide/list-rules)
- [Stylelint Rules](https://stylelint.io/user-guide/rules/)

## Support

For issues with the CI/CD pipeline:

1. Check workflow logs in GitHub Actions tab
2. Review this documentation for troubleshooting steps
3. Contact the Office of the CTO at <ces@precise.digital>
