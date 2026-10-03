require("dotenv").config(); // This loads your environment variables from a file called .env.
const { Pool } = require("pg"); // Give me the Pool class/function from the PostgreSQL Node.js library

const pool = new Pool({ // Create a PostgreSQL connection pool using these settings.
  host: process.env.DB_HOST, // Where is PostgreSQL?
  port: process.env.DB_PORT, // Which PostgreSQL port?
  user: process.env.DB_USER, // Which PostgreSQL user?
  password: process.env.DB_PASSWORD, // What's the password?
  database: process.env.DB_NAME, // Which database?
});

module.exports = pool; // Make this database connection available to the rest of my application.