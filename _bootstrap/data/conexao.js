const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'db_pessoa',
  port: 3306,
  multipleStatements: true
});

module.exports = pool;