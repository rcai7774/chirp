// lib/db.js
const mysql = require('mysql');
const connection = mysql.createConnection({
host: 'sql3.freemysqlhosting.net',
user: 'sql3378407',
database: 'sql3378407',
password: 'YpGMNPqfAj'
});
connection.connect();
module.exports = connection;