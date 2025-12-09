// Script to validate environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'NEXT_PUBLIC_APP_ENV',
  'NEXT_PUBLIC_API_URL',
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

const optionalEnvVars = [
  'NEXT_PUBLIC_STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
  'AWS_REGION',
  'LOG_LEVEL',
];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;

// Check required variables
console.log('Required variables:');
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    hasErrors = true;
  }
});

console.log('\nOptional variables:');
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET`);
  }
});

console.log('\n---');
console.log(`Environment: ${process.env.NEXT_PUBLIC_APP_ENV || 'NOT SET'}`);
console.log(`Node Environment: ${process.env.NODE_ENV || 'NOT SET'}`);

if (hasErrors) {
  console.error('\n❌ Some required environment variables are missing!');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  process.exit(0);
}
