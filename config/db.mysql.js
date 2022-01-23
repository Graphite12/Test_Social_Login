const mysql = require('mysql');
require('dotenv').config();

const db_info = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
};

module.exports = {
  init: function () {
    return mysql.createConnection(db_info);
  },
  connect: (conn) => {
    conn.connect((err) => {
      if (err) {
        console.log('마이에스큐엘 실행에러' + err);
      } else {
        console.log('마이에스큐엘 성공!!!');
      }
    });
  },
};
