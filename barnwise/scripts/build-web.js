const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'static-build');

function stripProtocol(domain) {
  let value = domain.trim();
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  return new URL(value).host;
}

function getDeploymentDomain() {
  const domain =
    process.env.REPLIT_INTERNAL_APP_DOMAIN ||
    process.env.REPLIT_DEV_DOMAIN ||
    process.env.EXPO_PUBLIC_DOMAIN;

  if (!domain) {
    throw new Error(
      'No deployment domain found. Set REPLIT_INTERNAL_APP_DOMAIN, REPLIT_DEV_DOMAIN, or EXPO_PUBLIC_DOMAIN.',
    );
  }

  return stripProtocol(domain);
}

fs.rmSync(outputDir, { recursive: true, force: true });

const result = spawnSync(
  'pnpm',
  [
    'exec',
    'expo',
    'export',
    '--platform',
    'web',
    '--output-dir',
    outputDir,
    '--clear',
  ],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      CI: '1',
      EXPO_PUBLIC_DOMAIN: getDeploymentDomain(),
      EXPO_PUBLIC_REPL_ID:
        process.env.REPL_ID || process.env.EXPO_PUBLIC_REPL_ID || '',
    },
    stdio: 'inherit',
  },
);

if (result.error) throw result.error;
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

if (!fs.existsSync(path.join(outputDir, 'index.html'))) {
  throw new Error(`Expo web export did not create ${outputDir}/index.html.`);
}

console.log(`Web export ready in ${outputDir}`);