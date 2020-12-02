// lib/db.js
const mysql = require('mysql');
const connection = mysql.createConnection({
host: 'sql3.freemysqlhosting.net',
user: process.env.dbUser,
database: process.env.dbDouble,
password: process.env.dbPass
});
connection.connect();
module.exports = connection;