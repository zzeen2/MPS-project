import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const client = postgres(process.env.DATABASE_URL!, {
    max: 1, // 간단한 앱이면 1로도 충분
});
export const db = drizzle(client);
