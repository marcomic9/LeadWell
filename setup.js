import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';
import crypto from 'crypto';

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

// Check if a path exists
const pathExists = (path) => {
  try {
    fs.accessSync(path);
    return true;
  } catch (error) {
    return false;
  }
};

// Generate a random JWT secret
const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Check if dependencies are installed
const checkDependencies = async () => {
  log.section('Checking Dependencies');
  
  try {
    log.info('Running npm check...');
    execSync('npm --version', { stdio: 'ignore' });
    log.success('NPM is installed');
  } catch (error) {
    log.error('NPM is not installed. Please install Node.js and NPM first.');
    process.exit(1);
  }
  
  // Check if package.json exists
  if (!pathExists(path.join(__dirname, 'package.json'))) {
    log.error('package.json not found. Are you in the correct directory?');
    process.exit(1);
  }
  
  // Install dependencies
  const installDeps = await prompt('Install npm dependencies? (y/n): ');
  if (installDeps.toLowerCase() === 'y') {
    log.info('Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      log.success('Dependencies installed successfully');
    } catch (error) {
      log.error('Failed to install dependencies. Please try manually: npm install');
      process.exit(1);
    }
  }
};

// Set up environment variables
const setupEnvironment = async () => {
  log.section('Setting Up Environment Variables');
  
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, 'env.example');
  
  // Check if .env already exists
  if (pathExists(envPath)) {
    const overwrite = await prompt('A .env file already exists. Overwrite it? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      log.info('Skipping .env setup');
      return;
    }
  }
  
  // Check if example exists
  if (!pathExists(envExamplePath)) {
    log.error('env.example not found. Cannot create .env file.');
    return;
  }
  
  // Read example file
  log.info('Creating .env file from template...');
  let envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Generate JWT secret
  const jwtSecret = generateJwtSecret();
  envContent = envContent.replace('JWT_SECRET=your_jwt_secret_key_here', `JWT_SECRET=${jwtSecret}`);
  
  // Get Supabase credentials
  log.info('You\'ll need your Supabase project URL and anon key.');
  const supabaseUrl = await prompt('Supabase URL (https://xxx.supabase.co): ');
  const supabaseKey = await prompt('Supabase anon key: ');
  
  if (supabaseUrl) {
    envContent = envContent.replace('SUPABASE_URL=https://your-project-id.supabase.co', `SUPABASE_URL=${supabaseUrl}`);
  }
  
  if (supabaseKey) {
    envContent = envContent.replace('SUPABASE_KEY=your_supabase_anon_key_here', `SUPABASE_KEY=${supabaseKey}`);
  }
  
  // Get OpenAI key
  log.info('You\'ll need your OpenAI API key for AI chat functionality.');
  const openaiKey = await prompt('OpenAI API key (press Enter to skip): ');
  
  if (openaiKey) {
    envContent = envContent.replace('OPENAI_API_KEY=your_openai_api_key_here', `OPENAI_API_KEY=${openaiKey}`);
  }
  
  // Write the .env file
  fs.writeFileSync(envPath, envContent);
  log.success('.env file created successfully');
  log.info('You can update other environment variables directly in the .env file.');
};

// Setup database
const setupDatabase = async () => {
  log.section('Setting Up Database');
  
  log.info('You should run the SQL setup script in your Supabase SQL editor.');
  log.info('The SQL script is available in setup-database.sql');
  
  const setupNow = await prompt('Open the SQL file now? (y/n): ');
  if (setupNow.toLowerCase() === 'y') {
    try {
      // On Windows, use notepad, on Mac/Linux use open or cat
      if (process.platform === 'win32') {
        execSync('notepad setup-database.sql', { stdio: 'ignore' });
      } else if (process.platform === 'darwin') {
        execSync('open setup-database.sql', { stdio: 'ignore' });
      } else {
        execSync('cat setup-database.sql', { stdio: 'inherit' });
      }
    } catch (error) {
      log.error('Failed to open the SQL file. Please open it manually.');
    }
  }
  
  log.info('After executing the SQL script in Supabase, your database will be ready.');
};

// Main setup function
const runSetup = async () => {
  log.section('LeadWell Backend Setup');
  
  log.info('This script will help you set up your LeadWell backend.');
  log.info('Press Ctrl+C at any time to cancel the setup.');
  
  await checkDependencies();
  await setupEnvironment();
  await setupDatabase();
  
  log.section('Setup Complete');
  
  log.success('LeadWell backend is now set up!');
  log.info('To start the development server, run: npm run dev');
  log.info('To start the production server, run: npm start');
  
  rl.close();
};

// Run the setup
runSetup().catch(error => {
  log.error(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
}); 