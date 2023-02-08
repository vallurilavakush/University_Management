var mysql = require("mysql2");

exports.connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Chandra@3810",
  database: "sys",
});
