// const { Pool } = require('pg');
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// module.exports = pool;


require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

module.exports = pool;
