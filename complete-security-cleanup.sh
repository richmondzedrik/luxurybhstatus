# Remove ALL sensitive files from tracking
git rm --cached .env
git rm --cached *.sql
git rm --cached *.md
git rm --cached *.sh

# Remove from subdirectories
git rm --cached -r **/*.sql **/*.md **/*.sh 2>/dev/null || true

# Add updated .gitignore
git add .gitignore

# Commit all changes
git commit -m "SECURITY: Hide all sensitive files (.env, .sql, .md, .sh)"

# Push to remove from GitHub
git push origin main