import snowflake from 'snowflake-sdk';

let connection: snowflake.Connection | null = null;
let isConnected = false;

function createConnection() {
  if (connection) return connection;
  connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT!,
    username: process.env.SNOWFLAKE_USERNAME!,
    password: process.env.SNOWFLAKE_PASSWORD!,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
    role: process.env.SNOWFLAKE_ROLE,
    clientSessionKeepAlive: true,
  });
  return connection;
}

async function ensureConnected(): Promise<void> {
  if (isConnected && connection) return;
  const conn = createConnection();
  await new Promise<void>((resolve, reject) => {
    conn.connect(err => (err ? reject(err) : resolve()));
  });
  isConnected = true;
}

export async function exec<T = any>(sqlText: string, binds: any[] = []): Promise<T[]> {
  await ensureConnected();
  return new Promise<T[]>((resolve, reject) => {
    connection!.execute({
      sqlText,
      binds,
      complete(err, _stmt, rows) {
        if (err) return reject(err);
        resolve(rows as T[]);
      },
    });
  });
}

/** Utility: run a promise with a timeout, then reject */
export function withTimeout<T>(p: Promise<T>, ms: number, label = 'snowflake'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`[${label}] timeout after ${ms}ms`)), ms);
    p.then(v => { clearTimeout(id); resolve(v); })
     .catch(e => { clearTimeout(id); reject(e); });
  });
}

/** Quick readiness check */
export async function ping(timeoutMs = 1200000): Promise<boolean> {
  try {
    await withTimeout(exec('select 1'), timeoutMs, 'ping');
    return true;
  } catch {
    return false;
  }
}
