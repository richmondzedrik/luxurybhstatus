#!/bin/bash

# 1. Remove .env from the problematic commit
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# 2. Force push to rewrite history (removes the secret)
git push origin --force --all

# 3. Verify .env is in .gitignore
echo "Checking .gitignore..."
if ! grep -q "^\.env$" .gitignore; then
    echo ".env" >> .gitignore
    echo "Added .env to .gitignore"
fi

# 4. Commit .gitignore update if needed
git add .gitignore
git commit -m "Ensure .env is properly ignored"
git push origin main

echo "✅ Secret removed from git history"
echo "⚠️  IMPORTANT: Rotate your Discord bot token immediately!"