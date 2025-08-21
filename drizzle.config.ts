import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/schema/**/*.ts',
    out: './drizzle',               // 마이그레이션 파일이 생성될 폴더
    dbCredentials: { url: process.env.DATABASE_URL! },
});
