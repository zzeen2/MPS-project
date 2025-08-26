import { Injectable } from '@nestjs/common';
import { db } from '../../db/client';
import { companies } from '../../db/schema/index';
import { eq } from 'drizzle-orm';

export type CompanyRow = typeof companies.$inferSelect;
export type CompanyInsert = typeof companies.$inferInsert;

@Injectable()
export class CompaniesRepository  {
  findByEmail(email: string): Promise<CompanyRow | null> {
    return db.select().from(companies)
      .where(eq(companies.email, email)).limit(1)
      .then(r => r[0] ?? null);
  }

  findByBusinessNumber(bn: string): Promise<CompanyRow | null> {
    return db.select().from(companies)
      .where(eq(companies.businessNumber, bn)).limit(1)
      .then(r => r[0] ?? null);
  }

  findById(id: number): Promise<CompanyRow | null> {
    return db.select().from(companies)
      .where(eq(companies.id, id)).limit(1)
      .then(r => r[0] ?? null);
  }

  async insert(values: CompanyInsert): Promise<CompanyRow> {
    const [row] = await db.insert(companies).values(values).returning();
    return row;
  }

  async updatePartial(id: number, patch: Partial<CompanyInsert>): Promise<void> {
    await db.update(companies).set(patch).where(eq(companies.id, id));
  }

  async setPasswordHash(id: number, passwordHash: string): Promise<void> {
    await db.update(companies).set({ passwordHash }).where(eq(companies.id, id));
  }
}
