import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const execAsync = promisify(exec);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q: string) => new Promise<string>(r => rl.question(q, r));

async function deploy() {
  console.log('🚀 GitHub Deployment\n');
  
  try {
    await execAsync('git --version');
  } catch {
    console.log('❌ Install Git first: https://git-scm.com/download/win');
    process.exit(1);
  }

  const user = await ask('GitHub username: ');
  const repo = await ask('Repo name (saas-landing-page-generator): ') || 'saas-landing-page-generator';
  
  console.log('\n📝 Setting up...');
  await execAsync('git init');
  await execAsync('git add .');
  await execAsync('git commit -m "Initial commit: SaaS Landing Page Generator"');
  await execAsync('git branch -M main');
  await execAsync(`git remote add origin https://github.com/${user}/${repo}.git`);
  
  console.log(`\n📋 Create repo at: https://github.com/new`);
  console.log(`📋 Name it: ${repo}\n`);
  
  if ((await ask('Ready? (y/n): ')).toLowerCase() === 'y') {
    try {
      await execAsync('git push -u origin main');
      console.log(`\n✅ Live at: https://github.com/${user}/${repo}`);
    } catch {
      console.log('\n❌ Try: git push --set-upstream origin main');
    }
  }
  rl.close();
}

deploy().catch(console.error);