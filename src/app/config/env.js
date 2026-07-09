import dotenv from "dotenv";
dotenv.config();

const loadEnvVars = () => {
  const requiredVars = [
    "PORT",
    "NODE_ENV",

    "JWT_SECRET_TOKEN",
    "JWT_REFRESH_TOKEN",
    "JWT_EXPIRES_IN",
    "JWT_REFRESH_EXPIRES_IN",

    "DATABASE_URL",
    "REDIS_URL",
  ];

  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`❌ Missing environment variable: ${key}`);
    }
  });

  return {
    // App
    PORT: Number(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV,

    // JWT
    JWT_SECRET_TOKEN: process.env.JWT_SECRET_TOKEN,
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,

    // Database
    DATABASE_URL: process.env.DATABASE_URL,

    // Redis
    REDIS_URL: process.env.REDIS_URL,
    // SendGrid config
    SENDGRID: {
      API_KEY: process.env.SENDGRID_API_KEY,
      FROM: process.env.SENDGRID_FROM,
      FROM_NAME: process.env.SENDGRID_FROM_NAME || "Heritage Stackers",
      REPLY_TO: process.env.SENDGRID_REPLY_TO || process.env.SENDGRID_FROM,
      GIVEAWAY_FROM: process.env.SENDGRID_GIVEAWAY_FROM || process.env.SENDGRID_FROM,
      GIVEAWAY_FROM_NAME: process.env.SENDGRID_GIVEAWAY_FROM_NAME || process.env.SENDGRID_FROM_NAME || "Heritage Stackers Giveaway",
      GIVEAWAY_REPLY_TO: process.env.SENDGRID_GIVEAWAY_REPLY_TO || process.env.SENDGRID_GIVEAWAY_FROM || process.env.SENDGRID_FROM,
    },
    // Frontend
    FRONT_END_URL: process.env.FRONT_END_URL,
  };
};

export const envVars = loadEnvVars();
