   // server/db.js
   const { Pool } = require('pg');
   require('dotenv').config();

   const pool = new Pool({
       user: process.env.DB_USER, // Имя пользователя
       host: 'localhost',
       database: process.env.DB_NAME, // Имя базы данных
       password: process.env.DB_PASSWORD, // Пароль
       port: 5432,
   });

   module.exports = pool;