import snowflake from 'snowflake-sdk';

let connection: snowflake.Connection | null = null;

export function getConnection() {
  if (connection) return connection;
  connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT!,
    username: process.env.SNOWFLAKE_USERNAME!,
    password: process.env.SNOWFLAKE_PASSWORD!,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
    role: process.env.SNOWFLAKE_ROLE
  });
  return connection;
}

export async function exec<T = any>(sqlText: string, binds: any[] = []): Promise<T[]> {
  const conn = getConnection();
  await new Promise<void>((resolve, reject) => {
    conn.connect(err => (err ? reject(err) : resolve()));
  });

  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText,
      binds,
      complete: function (err, _stmt, rows) {
        if (err) return reject(err);
        resolve(rows as T[]);
      }
    });
  });
}
