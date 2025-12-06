import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function deploy(message) {
  try {
    console.log('📦 Adding files...');
    execSync('git add .', { stdio: 'inherit' });
    
    console.log(`💾 Committing: "${message}"`);
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    
    console.log('🚀 Pushing to GitHub...');
    execSync('git push', { stdio: 'inherit' });
    
    console.log('\n✅ Deployed successfully!');
    console.log('🌐 Vercel will update your site in 2-3 minutes.');
    console.log('📊 Check progress: https://vercel.com/dashboard\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during deployment:', error.message);
    process.exit(1);
  }
}

rl.question('📝 Enter commit message (or press Enter for "Update content"): ', (answer) => {
  const message = answer.trim() || 'Update content';
  rl.close();
  deploy(message);
});

