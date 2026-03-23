import * as Joi from 'joi';

export const EnvConfiguration = () => ({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '4h',
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
  NODE_ENV: process.env.NODE_ENV || 'dev',
  APP_PORT: parseInt(process.env.APP_PORT || '3001', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  COMPANY_NAME: process.env.COMPANY_NAME || 'Siren',
});

export const envValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('4h'),
  EMAIL_HOST: Joi.string().allow('').default(''),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_USER: Joi.string().allow('').default(''),
  EMAIL_PASSWORD: Joi.string().allow('').default(''),
  EMAIL_ENABLED: Joi.boolean().default(false),
  NODE_ENV: Joi.string().default('dev'),
  APP_PORT: Joi.number().default(3001),
  FRONTEND_URL: Joi.string().default('http://localhost:5173'),
  COMPANY_NAME: Joi.string().default('Siren'),
});
