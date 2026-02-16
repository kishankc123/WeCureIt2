const dotenv = require('dotenv');

// Load the environment variables
dotenv.config({ path: '.env.local' });

console.log("DATABASE_URL =", process.env.DATABASE_URL);
