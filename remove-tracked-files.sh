# Remove all .sql and .md files from git tracking
git rm --cached *.sql *.md

# Remove shell scripts
git rm --cached *.sh

# If files are in subdirectories, use:
git rm --cached -r **/*.sql **/*.md **/*.sh

# Commit the removal
git add .gitignore
git commit -m "Hide .sql, .md, and .sh files from repository"

# Push changes
git push origin main

