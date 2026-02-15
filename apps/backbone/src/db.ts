import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? (() => { throw new Error('DATABASE_URL não configurada — verifique o .env'); })(),
});

export default pool;
