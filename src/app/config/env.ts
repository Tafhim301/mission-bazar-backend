import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  BCRYPT_SALT_ROUND: number;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  SSL_STORE_ID: string;
  SSL_STORE_PASS: string;
  SSL_PAYMENT_API: string;
  SSL_VALIDATION_API: string;
  SSL_IPN_URL: string;
  SSL_SUCCESS_BACKEND_URL: string;
  SSL_FAIL_BACKEND_URL: string;
  SSL_CANCEL_BACKEND_URL: string;
  SSL_SUCCESS_FRONTEND_URL: string;
  SSL_FAIL_FRONTEND_URL: string;
  SSL_CANCEL_FRONTEND_URL: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_FROM: string;
  SMTP_PASS: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_USERNAME: string;
  REDIS_PASSWORD: string;
  CLIENT_URL: string;
}

const loadEnvVariables = (): EnvConfig => {
  const required: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
    "BCRYPT_SALT_ROUND",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "SSL_STORE_ID",
    "SSL_STORE_PASS",
    "SSL_PAYMENT_API",
    "SSL_VALIDATION_API",
    "SSL_IPN_URL",
    "SSL_SUCCESS_BACKEND_URL",
    "SSL_FAIL_BACKEND_URL",
    "SSL_CANCEL_BACKEND_URL",
    "SSL_SUCCESS_FRONTEND_URL",
    "SSL_FAIL_FRONTEND_URL",
    "SSL_CANCEL_FRONTEND_URL",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_FROM",
    "SMTP_PASS",
    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_USERNAME",
    "REDIS_PASSWORD",
  ];

  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    BCRYPT_SALT_ROUND: Number(process.env.BCRYPT_SALT_ROUND),
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    SSL_STORE_ID: process.env.SSL_STORE_ID as string,
    SSL_STORE_PASS: process.env.SSL_STORE_PASS as string,
    SSL_PAYMENT_API: process.env.SSL_PAYMENT_API as string,
    SSL_VALIDATION_API: process.env.SSL_VALIDATION_API as string,
    SSL_IPN_URL: process.env.SSL_IPN_URL as string,
    SSL_SUCCESS_BACKEND_URL: process.env.SSL_SUCCESS_BACKEND_URL as string,
    SSL_FAIL_BACKEND_URL: process.env.SSL_FAIL_BACKEND_URL as string,
    SSL_CANCEL_BACKEND_URL: process.env.SSL_CANCEL_BACKEND_URL as string,
    SSL_SUCCESS_FRONTEND_URL: process.env.SSL_SUCCESS_FRONTEND_URL as string,
    SSL_FAIL_FRONTEND_URL: process.env.SSL_FAIL_FRONTEND_URL as string,
    SSL_CANCEL_FRONTEND_URL: process.env.SSL_CANCEL_FRONTEND_URL as string,
    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_FROM: process.env.SMTP_FROM as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    REDIS_HOST: process.env.REDIS_HOST as string,
    REDIS_PORT: Number(process.env.REDIS_PORT),
    REDIS_USERNAME: process.env.REDIS_USERNAME as string,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
    CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
  };
};

export const envVars = loadEnvVariables();
