import { execSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to prompt user with a question
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Log messages with color
const log = {
  info: (message) => console.log(`${colors.cyan}[INFO] ${message}${colors.reset}`),
  success: (message) => console.log(`${colors.green}[SUCCESS] ${message}${colors.reset}`),
  warning: (message) => console.log(`${colors.yellow}[WARNING] ${message}${colors.reset}`),
  error: (message) => console.log(`${colors.red}[ERROR] ${message}${colors.reset}`),
  section: (message) => console.log(`\n${colors.magenta}=== ${message} ===${colors.reset}\n`)
};

// Check if git is installed
const checkGit = () => {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Check if directory is already a git repository
const isGitRepo = () => {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Create .gitignore file if it doesn't exist
const createGitignore = () => {
  const gitignorePath = path.join(__dirname, '.gitignore');
  
  if (fs.existsSync(gitignorePath)) {
    log.info('.gitignore already exists');
    return;
  }
  
  log.info('Creating .gitignore file...');
  
  const gitignoreContent = `# Dependency directories
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Build output
dist/
build/

# Mac OS
.DS_Store

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
`;
  
  fs.writeFileSync(gitignorePath, gitignoreContent);
  log.success('.gitignore file created');
};

// Initialize git repository
const initRepo = () => {
  if (isGitRepo()) {
    log.info('Git repository already initialized');
    return;
  }
  
  log.info('Initializing git repository...');
  execSync('git init', { stdio: 'inherit' });
  log.success('Git repository initialized');
};

// Add files to git
const addFiles = () => {
  log.info('Adding files to git...');
  execSync('git add .', { stdio: 'inherit' });
  log.success('Files added to git');
};

// Commit changes
const commitChanges = async () => {
  const commitMessage = await prompt('Enter commit message (default: "Initial commit"): ');
  const message = commitMessage || 'Initial commit';
  
  log.info('Committing changes...');
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
  log.success('Changes committed');
};

// Set up remote repository
const setupRemote = async () => {
  log.section('GitHub Repository Setup');
  
  log.info('You need to create a GitHub repository to continue.');
  log.info('Visit https://github.com/new to create a new repository.');
  
  const repoUrl = await prompt('Enter GitHub repository URL (e.g., https://github.com/username/repo.git): ');
  
  if (!repoUrl) {
    log.error('Repository URL is required');
    return false;
  }
  
  try {
    log.info('Adding remote repository...');
    execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' });
    log.success('Remote repository added');
    return true;
  } catch (error) {
    log.error(`Failed to add remote: ${error.message}`);
    
    // Check if remote already exists
    try {
      const remoteOutput = execSync('git remote -v', { encoding: 'utf8' });
      if (remoteOutput.includes('origin')) {
        const setOrigin = await prompt('Remote "origin" already exists. Set URL again? (y/n): ');
        if (setOrigin.toLowerCase() === 'y') {
          execSync(`git remote set-url origin ${repoUrl}`, { stdio: 'inherit' });
          log.success('Remote repository URL updated');
          return true;
        }
      }
    } catch (e) {
      // Ignore errors checking remotes
    }
    
    return false;
  }
};

// Push to remote repository
const pushToRemote = async () => {
  const branch = await prompt('Enter branch name to push (default: "main"): ');
  const branchName = branch || 'main';
  
  try {
    log.info(`Pushing to ${branchName} branch...`);
    execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });
    log.success(`Pushed to ${branchName} branch`);
    return true;
  } catch (error) {
    log.error(`Failed to push: ${error.message}`);
    
    const tryAgain = await prompt('Try pushing again? (y/n): ');
    if (tryAgain.toLowerCase() === 'y') {
      return pushToRemote();
    }
    
    return false;
  }
};

// Main function
const createRepo = async () => {
  log.section('LeadWell GitHub Repository Setup');
  
  // Check if git is installed
  if (!checkGit()) {
    log.error('Git is not installed. Please install Git first.');
    rl.close();
    return;
  }
  
  // Create .gitignore
  createGitignore();
  
  // Initialize repository
  initRepo();
  
  // Add files
  addFiles();
  
  // Commit changes
  await commitChanges();
  
  // Setup remote
  const remoteSetup = await setupRemote();
  
  // Push to remote if setup was successful
  if (remoteSetup) {
    await pushToRemote();
  }
  
  log.section('Repository Setup Complete');
  
  if (remoteSetup) {
    log.success('Your code has been pushed to GitHub!');
  } else {
    log.warning('Repository setup completed locally, but not pushed to GitHub.');
    log.info('You can manually push to GitHub later with:');
    log.info('  git remote add origin <repository-url>');
    log.info('  git push -u origin main');
  }
  
  rl.close();
};

// Run the script
createRepo().catch(error => {
  log.error(`Setup failed: ${error.message}`);
  rl.close();
}); 