import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
<<<<<<< HEAD

export default defineConfig({
    schema: './src/db/schema/**/*.ts',
=======
export default defineConfig({
    schema: './src/db/schema',
>>>>>>> client
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});