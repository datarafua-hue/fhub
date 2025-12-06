import { watch } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

let deployTimeout = null;
let isDeploying = false;

// Directories to watch
const watchDirs = [
  join(projectRoot, 'src/content/posts'),
  join(projectRoot, 'src/pages'),
  join(projectRoot, 'src/components'),
];

function hasChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

function deploy() {
  if (isDeploying) {
    console.log('⏳ Deployment in progress, skipping...');
    return;
  }

  if (!hasChanges()) {
    console.log('✨ No changes to deploy');
    return;
  }

  isDeploying = true;
  const timestamp = new Date().toLocaleTimeString('ru-RU');

  try {
    console.log(`\n🚀 [${timestamp}] Starting auto-deploy...`);
    
    execSync('git add .', { stdio: 'pipe' });
    console.log('   ✓ Files added');
    
    execSync(`git commit -m "Auto-update: ${new Date().toLocaleString('ru-RU')}"`, { 
      stdio: 'pipe' 
    });
    console.log('   ✓ Changes committed');
    
    execSync('git push', { stdio: 'pipe' });
    console.log('   ✓ Pushed to GitHub');
    
    console.log(`✅ [${timestamp}] Deployed! Vercel will update in 2-3 min.\n`);
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      console.log('   ℹ️ No changes to commit');
    } else {
      console.error('❌ Deploy error:', error.message);
    }
  } finally {
    isDeploying = false;
  }
}

function scheduleDeployment() {
  if (deployTimeout) {
    clearTimeout(deployTimeout);
  }
  
  // Wait 3 seconds after last change before deploying
  deployTimeout = setTimeout(() => {
    deploy();
  }, 3000);
}

console.log('👁️  Auto-deploy watcher started!');
console.log('📁 Watching directories:');
watchDirs.forEach(dir => console.log(`   - ${dir}`));
console.log('\n💡 Changes will auto-deploy 3 seconds after you save a file.');
console.log('🛑 Press Ctrl+C to stop\n');

// Watch each directory
watchDirs.forEach(dir => {
  try {
    watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && !filename.includes('node_modules') && !filename.startsWith('.')) {
        const timestamp = new Date().toLocaleTimeString('ru-RU');
        console.log(`📝 [${timestamp}] Changed: ${filename}`);
        scheduleDeployment();
      }
    });
    console.log(`✓ Watching: ${dir}`);
  } catch (error) {
    console.error(`⚠️  Could not watch ${dir}:`, error.message);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Auto-deploy watcher stopped.');
  process.exit(0);
});

