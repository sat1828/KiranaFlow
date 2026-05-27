require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappFrom: process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
  },
  google: {
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    routeOptimizationKey: process.env.GOOGLE_ROUTE_OPTIMIZATION_KEY,
    projectId: process.env.GOOGLE_PROJECT_ID,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET || 'kiranaflow-uploads',
    region: process.env.AWS_REGION || 'ap-south-1',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
};

const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
for (const v of requiredVars) {
  if (!process.env[v] && config.env === 'production') {
    throw new Error(`Missing required environment variable: ${v}`);
  }
}

module.exports = config;
