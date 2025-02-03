   // server/setup.js
   const pool = require('./db');

   const createTables = async () => {
       const client = await pool.connect();
       try {
           await client.query(`
               CREATE TABLE IF NOT EXISTS users (
                   id SERIAL PRIMARY KEY,
                   username VARCHAR(50) UNIQUE NOT NULL,
                   password VARCHAR(100) NOT NULL
               );
           `);

           await client.query(`
               CREATE TABLE IF NOT EXISTS pets (
                   id SERIAL PRIMARY KEY,
                   name VARCHAR(50) NOT NULL,
                   weight NUMERIC,
                   mood VARCHAR(50),
                   activity VARCHAR(50),
                   notes TEXT,
                   owner_id INTEGER REFERENCES users(id),
                   date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
               );
           `);
           console.log("Tables created successfully");
       } catch (err) {
           console.error(err);
       } finally {
           client.release();
       }
   };

   createTables();