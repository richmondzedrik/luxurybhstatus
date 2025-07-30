# Remove .env from git tracking immediately
git rm --cached .env

# Add and commit the .gitignore changes
git add .gitignore
git commit -m "Hide .env file and other sensitive files"

# Push changes to remove .env from GitHub
git push origin main