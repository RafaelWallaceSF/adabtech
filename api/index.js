
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

// Define models and routes here

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'PayTrack API is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
