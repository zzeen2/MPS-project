// apps/backend/drizzle.config.cjs
const path = require('path');
const dotenv = require('dotenv');

// backend 폴더의 .env를 확실히 읽게 고정 (루트에 있으면 경로 바꿔)
dotenv.config({ path: path.join(process.cwd(), 'apps/backend/.env') });
console.log('[drizzle] DATABASE_URL =', process.env.DATABASE_URL);

/** @type {import('drizzle-kit').Config} */
module.exports = {
    schema: './src/db/schema/index.ts',
  out: './drizzle',                  
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL },
};
