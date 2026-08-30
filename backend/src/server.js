require('dotenv').config();

const app = require('./app');
const { testDatabaseConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await testDatabaseConnection();

  app.listen(5000, '0.0.0.0', () => {
    console.log('Server berjalan di port 5000');
  });
}

startServer();