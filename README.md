# Knowledge Repository

A simple, automated knowledge repository for our team's documentation.

## How to Use

1. **Add Articles**: Place `.md` or `.qmd` files in the `articles/` folder
2. **Push to GitHub**: `git add . && git commit -m "Add article" && git push`
3. **View Online**: Articles automatically appear at https://precise-digital-developers.github.io/knowledge-repo/

## Features

- ✅ Automatic article discovery
- ✅ Markdown rendering with syntax highlighting
- ✅ Mermaid diagram support
- ✅ Search functionality
- ✅ Dark/light theme
- ✅ Print-friendly views
- ✅ No build process required

## Adding New Articles

Simply create a new markdown file in the `articles/` folder:

```bash
echo "# My New Article" > articles/my-new-article.md
git add articles/my-new-article.md
git commit -m "Add new article"
git push
```

The article will automatically appear in the index!
