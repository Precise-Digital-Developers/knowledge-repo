const fs = require('fs');
const path = require('path');

/**
 * Extracts metadata from markdown or qmd files
 */
function extractMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const extension = path.extname(filePath);

  let title = '';
  let description = '';
  let category = 'Other';

  // Try to extract YAML frontmatter (for .qmd files)
  const yamlMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (yamlMatch) {
    const yaml = yamlMatch[1];
    const titleMatch = yaml.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const subtitleMatch = yaml.match(/^subtitle:\s*["']?(.+?)["']?\s*$/m);
    const categoryMatch = yaml.match(/^category:\s*["']?(.+?)["']?\s*$/m);

    if (titleMatch) {
      title = titleMatch[1].replace(/^["']|["']$/g, '').trim();
    }
    if (subtitleMatch) {
      description = subtitleMatch[1].replace(/^["']|["']$/g, '').trim();
    }
    if (categoryMatch) {
      category = categoryMatch[1].replace(/^["']|["']$/g, '').trim();
    }
  }

  // If no title from frontmatter, get first heading
  if (!title) {
    // Remove frontmatter first
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
    const headingMatch = contentWithoutFrontmatter.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      title = headingMatch[1];
    } else {
      title = fileName.replace(extension, '').replace(/-/g, ' ');
    }
  }

  // If no description, get first paragraph or sentence
  if (!description) {
    // Remove frontmatter and get content after first heading
    let mainContent = content.replace(/^---[\s\S]*?---\n/, '');
    mainContent = mainContent.replace(/^#\s+.+$/m, '');

    // Find first meaningful paragraph
    const paragraphs = mainContent
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p && !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('-'));

    if (paragraphs.length > 0) {
      // Limit to 80 characters to avoid markdown lint line-length issues
      description = paragraphs[0].replace(/\n/g, ' ').substring(0, 80);
      if (paragraphs[0].length > 80) description += '...';
    }
  }

  // Auto-categorize based on filename or content if not specified
  if (category === 'Other') {
    const lowerName = fileName.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.substring(0, 1000).toLowerCase(); // Only check first 1000 chars

    // Check for Infrastructure/Development first (most specific)
    if (
      lowerName.includes('tech-stack') ||
      lowerName.includes('technology') ||
      lowerName.includes('ci-cd') ||
      lowerName.includes('cicd') ||
      lowerName.includes('infrastructure') ||
      lowerTitle.includes('technology stack') ||
      lowerTitle.includes('infrastructure') ||
      lowerTitle.includes('ci/cd') ||
      lowerTitle.includes('pipeline')
    ) {
      category = 'Infrastructure & Development';
    }
    // Check for Process/Framework docs
    else if (
      (lowerName.includes('guide') && !lowerName.includes('api')) ||
      lowerName.includes('process') ||
      lowerName.includes('framework') ||
      lowerName.includes('control') ||
      lowerName.includes('lifecycle') ||
      lowerName.includes('tracking') ||
      lowerTitle.includes('framework') ||
      lowerTitle.includes('process') ||
      lowerTitle.includes('control') ||
      (lowerContent.includes('process') && !lowerContent.includes('api'))
    ) {
      category = 'Process & Framework Documentation';
    }
    // Check for API guides (least specific, catch-all for API docs)
    else if (
      lowerName.includes('api') ||
      lowerName.includes('postman') ||
      lowerTitle.includes('api') ||
      lowerContent.includes('api endpoint')
    ) {
      category = 'API Integration Guides';
    }
  }

  return {
    fileName,
    filePath: filePath.replace(/\\/g, '/'),
    title,
    description,
    category,
  };
}

/**
 * Scans articles directory and extracts metadata
 */
function scanArticles(articlesDir) {
  const articles = [];
  const files = fs.readdirSync(articlesDir);

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && (file.endsWith('.md') || file.endsWith('.qmd'))) {
      try {
        const metadata = extractMetadata(filePath);
        articles.push(metadata);
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  }

  return articles;
}

/**
 * Groups articles by category
 */
function groupByCategory(articles) {
  const grouped = {};

  for (const article of articles) {
    if (!grouped[article.category]) {
      grouped[article.category] = [];
    }
    grouped[article.category].push(article);
  }

  // Sort articles within each category by title
  for (const category in grouped) {
    grouped[category].sort((a, b) => a.title.localeCompare(b.title));
  }

  return grouped;
}

/**
 * Generates markdown for documentation section
 */
function generateDocumentationSection(articles) {
  const grouped = groupByCategory(articles);

  // Define category order
  const categoryOrder = [
    'Process & Framework Documentation',
    'API Integration Guides',
    'Infrastructure & Development',
    'Other',
  ];

  let markdown = '## Documentation\n\n';

  for (const category of categoryOrder) {
    if (grouped[category] && grouped[category].length > 0) {
      markdown += `### ${category}\n\n`;

      for (const article of grouped[category]) {
        const relativePath = article.filePath.replace(/\\/g, '/').replace(/^.*?articles\//, 'articles/');
        markdown += `- [${article.title}](${relativePath})`;
        if (article.description) {
          markdown += ` - ${article.description}`;
        }
        markdown += '\n';
      }

      markdown += '\n';
    }
  }

  return markdown.trim();
}

/**
 * Updates README with new documentation section
 */
function updateReadme(readmePath, newDocSection) {
  let readme = fs.readFileSync(readmePath, 'utf8');

  // Find the Documentation section and replace it
  const docStartRegex = /^## Documentation\s*$/m;
  const nextSectionRegex = /^## (?!Documentation)/m;

  const docStartMatch = readme.match(docStartRegex);

  if (docStartMatch) {
    const docStartIndex = docStartMatch.index;
    const remainingContent = readme.substring(docStartIndex);
    const nextSectionMatch = remainingContent.substring(3).match(nextSectionRegex);

    let docEndIndex;
    if (nextSectionMatch) {
      docEndIndex = docStartIndex + nextSectionMatch.index + 3;
    } else {
      docEndIndex = readme.length;
    }

    // Replace the documentation section
    readme =
      readme.substring(0, docStartIndex) +
      newDocSection +
      '\n\n' +
      readme.substring(docEndIndex);
  } else {
    // If no Documentation section exists, add it before "Adding New Articles"
    const addingArticlesMatch = readme.match(/^## Adding New Articles/m);
    if (addingArticlesMatch) {
      readme =
        readme.substring(0, addingArticlesMatch.index) +
        newDocSection +
        '\n\n' +
        readme.substring(addingArticlesMatch.index);
    } else {
      // Just append to the end
      readme += '\n\n' + newDocSection + '\n';
    }
  }

  fs.writeFileSync(readmePath, readme, 'utf8');
  console.log('✅ README.md updated successfully!');
}

/**
 * Main execution
 */
function main() {
  const repoRoot = path.resolve(__dirname, '../..');
  const articlesDir = path.join(repoRoot, 'articles');
  const readmePath = path.join(repoRoot, 'README.md');

  console.log('📂 Scanning articles directory...');
  const articles = scanArticles(articlesDir);
  console.log(`📄 Found ${articles.length} article(s)`);

  console.log('📝 Generating documentation section...');
  const docSection = generateDocumentationSection(articles);

  console.log('💾 Updating README.md...');
  updateReadme(readmePath, docSection);

  console.log('\n✨ Documentation links updated!');
  console.log(`\nCategories found:`);
  const categories = [...new Set(articles.map(a => a.category))];
  categories.forEach(cat => {
    const count = articles.filter(a => a.category === cat).length;
    console.log(`  - ${cat}: ${count} article(s)`);
  });
}

// Run the script
main();
