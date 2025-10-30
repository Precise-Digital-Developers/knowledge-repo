#!/usr/bin/env python3
"""Validate YAML frontmatter in Quarto (.qmd) files."""

import sys
import yaml
import re
from pathlib import Path


def validate_frontmatter(file_path):
    """Validate YAML frontmatter in a Quarto file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if not content.startswith('---'):
            print(f'  [INFO] No frontmatter in {file_path}')
            return True

        # Extract YAML frontmatter
        match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if not match:
            print(f'  [WARN] Invalid frontmatter structure in {file_path}')
            return False

        # Validate YAML syntax
        try:
            yaml.safe_load(match.group(1))
            print(f'  [PASS] Valid YAML frontmatter in {file_path}')
            return True
        except yaml.YAMLError as e:
            print(f'  [FAIL] Invalid YAML in {file_path}: {e}')
            return False

    except Exception as e:
        print(f'  [ERROR] Error reading {file_path}: {e}')
        return False


def main():
    """Main function to validate all Quarto files passed as arguments."""
    if len(sys.argv) < 2:
        print('Usage: validate-quarto.py <file1.qmd> <file2.qmd> ...')
        sys.exit(1)

    all_valid = True
    for file_path in sys.argv[1:]:
        if not validate_frontmatter(file_path):
            all_valid = False

    if not all_valid:
        sys.exit(1)


if __name__ == '__main__':
    main()
