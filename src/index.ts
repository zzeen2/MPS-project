import { db } from './db.js';
import { users } from './schema/users.js';
import { eq } from 'drizzle-orm';

async function main() {
    // CREATE
    await db.insert(users).values([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
    ]);

    // READ
    const rows = await db.select().from(users);
    console.log('all users:', rows);

    // UPDATE
    await db.update(users).set({ age: 26 }).where(eq(users.name, 'Alice'));

    // READ (조건)
    const alice = await db.select().from(users).where(eq(users.name, 'Alice'));
    console.log('alice after update:', alice);

    // DELETE
    // await db.delete(users).where(eq(users.name, 'Bob'));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
