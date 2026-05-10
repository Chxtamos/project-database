const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'movie_admin_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const normalizeType = (column) => {
  const type = column.data_type === 'character varying'
    ? 'varchar'
    : column.data_type.replace(/\s+/g, '_');
  return type.replace(/[^a-zA-Z0-9_]/g, '_');
};

const buildMermaid = ({ tables, columns, primaryKeys, foreignKeys }) => {
  const pkByTable = new Map();
  primaryKeys.forEach(row => {
    if (!pkByTable.has(row.table_name)) pkByTable.set(row.table_name, new Set());
    pkByTable.get(row.table_name).add(row.column_name);
  });

  const fkColumns = new Set(foreignKeys.map(row => `${row.table_name}.${row.column_name}`));
  const columnsByTable = new Map();
  columns.forEach(column => {
    if (!columnsByTable.has(column.table_name)) columnsByTable.set(column.table_name, []);
    columnsByTable.get(column.table_name).push(column);
  });

  const lines = [
    '# Database ERD',
    '',
    `Generated from PostgreSQL database: \`${process.env.DB_NAME || 'movie_admin_db'}\``,
    '',
    '```mermaid',
    'erDiagram',
  ];

  tables.forEach(({ table_name: tableName }) => {
    lines.push(`  ${tableName} {`);
    (columnsByTable.get(tableName) || []).forEach(column => {
      const markers = [];
      if (pkByTable.get(tableName)?.has(column.column_name)) markers.push('PK');
      if (fkColumns.has(`${tableName}.${column.column_name}`)) markers.push('FK');
      const nullable = column.is_nullable === 'NO' ? 'required' : 'nullable';
      const marker = markers.length ? ` "${markers.join(', ')}, ${nullable}"` : ` "${nullable}"`;
      lines.push(`    ${normalizeType(column)} ${column.column_name}${marker}`);
    });
    lines.push('  }');
    lines.push('');
  });

  foreignKeys.forEach(fk => {
    lines.push(`  ${fk.foreign_table_name} ||--o{ ${fk.table_name} : "${fk.column_name}"`);
  });

  lines.push('```');
  lines.push('');
  lines.push('## Relationships');
  lines.push('');
  foreignKeys.forEach(fk => {
    lines.push(`- \`${fk.table_name}.${fk.column_name}\` references \`${fk.foreign_table_name}.${fk.foreign_column_name}\` (${fk.delete_rule})`);
  });
  lines.push('');

  return lines.join('\n');
};

const main = async () => {
  const [tables, columns, primaryKeys, foreignKeys] = await Promise.all([
    pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `),
    pool.query(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `),
    pool.query(`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.constraint_type = 'PRIMARY KEY'
      ORDER BY tc.table_name, kcu.ordinal_position
    `),
    pool.query(`
      SELECT
        tc.constraint_name,
        kcu.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
       AND rc.constraint_schema = tc.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.constraint_type = 'FOREIGN KEY'
      ORDER BY kcu.table_name, kcu.column_name
    `),
  ]);

  const output = buildMermaid({
    tables: tables.rows,
    columns: columns.rows,
    primaryKeys: primaryKeys.rows,
    foreignKeys: foreignKeys.rows,
  });

  const docsDir = path.join(__dirname, '..', 'docs');
  fs.mkdirSync(docsDir, { recursive: true });
  const outputPath = path.join(docsDir, 'ERD.md');
  fs.writeFileSync(outputPath, output, 'utf8');

  console.log(`ERD generated: ${outputPath}`);
  console.log(`Tables: ${tables.rows.length}`);
  console.log(`Relationships: ${foreignKeys.rows.length}`);
};

main()
  .catch(err => {
    console.error('Generate ERD failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
