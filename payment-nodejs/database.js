const { Pool } = require('pg');
const pool = new Pool({
	user: 'payment_user',
	host: 'localhost',
	database: 'payment_db',
	password: 'admin',
	port: 5432,
});

module.exports = pool;
