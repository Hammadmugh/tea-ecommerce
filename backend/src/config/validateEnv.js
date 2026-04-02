/**
 * Validate that required environment variables are set
 * Call this on application startup
 */
export const validateEnvironment = () => {
  const required = [
    'JWT_SECRET',
    'MONGODB_URI',
    'CORS_ORIGIN',
    'PORT'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:', missing);
    console.error('Please set all required variables in your .env file');
    process.exit(1);
  }

  // Additional validation
  if (process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
    console.warn('⚠️ WARNING: JWT_SECRET is using the default value. Change this in production!');
  }

  console.log('✅ Environment variables validated successfully');
};
