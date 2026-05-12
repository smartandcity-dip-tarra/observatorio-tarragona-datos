import type Database from 'better-sqlite3';
import { ALL_DDL } from './tables.js';

export function createSchema(db: Database.Database): void {
  console.log('Creating database schema...');

  for (const ddl of ALL_DDL) {
    db.exec(ddl);
  }

  console.log('  15 tables created\n');
}
