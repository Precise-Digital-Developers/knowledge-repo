# Knowledge Repository

![Code Quality](https://github.com/precise-digital-developers/knowledge-repo/workflows/Code%20Quality/badge.svg)
![Security Scan](https://github.com/precise-digital-developers/knowledge-repo/workflows/Security%20Scan/badge.svg)
![Update README](https://github.com/precise-digital-developers/knowledge-repo/workflows/Update%20README/badge.svg)

A simple, automated knowledge repository for our team's documentation.

## How to Use

1. **Add Articles**: Place `.md` or `.qmd` files in the `articles/` folder
2. **Push to GitHub**: `git add . && git commit -m "Add article" && git push`
3. **View Online**: Articles automatically appear at
   <https://precise-digital-developers.github.io/knowledge-repo/>

## Features

- ✅ Automatic article discovery
- ✅ Markdown rendering with syntax highlighting
- ✅ Mermaid diagram support
- ✅ Search functionality
- ✅ Dark/light theme
- ✅ Print-friendly views
- ✅ No build process required

## Documentation

### Process & Framework Documentation

- [Change Control Guide](articles/change-control-guide.md) - This document establishes a structured change control process for the management...
- [Project Creation and Tracking Guide](articles/project-creation-tracking-guide.md) - This document establishes a standardised process for creating and tracking proje...
- [Software Development Lifecycle Framework](articles/software-development-lifecycle-framework.md) - **Characteristics:**

### API Integration Guides

- [AudioSalad API Postman Collection - Usage Guide](articles/audiosalad-api-postman-guide.md) - 1. [Overview](#overview) 2. [Initial Setup](#initial-setup) 3. [Authentication](...
- [Curve Royalty Systems API Using Postman Guide](articles/curve-royalty-api-postman-guide.md) - [Curve Royalty Systems](https://www.curveroyaltysystems.com/) is a platform desi...
- [Feature FM API Documentation - Sandbox Environment](articles/featurefm-api-postman-guide.md) - Feature FM is a comprehensive feature management platform that enables controlle...

### Infrastructure & Development

- [CI/CD Pipeline Guide](articles/ci-cd-guide.md) - This document describes the continuous integration and continuous deployment (CI...
- [Precise Digital Technology Stack](articles/tech-stack.qmd) - Infrastructure Documentation

## Adding New Articles

Simply create a new markdown file in the `articles/` folder:

```bash
echo "# My New Article" > articles/my-new-article.md
git add articles/my-new-article.md
git commit -m "Add new article"
git push
```

The article will automatically appear in the index!
