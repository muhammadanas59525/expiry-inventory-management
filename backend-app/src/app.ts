import express from 'express';
import bodyParser from 'body-parser';
import { createConnection } from 'mysql2/promise';
import { dbConfig } from './config/database';
import { setRoutes } from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
createConnection(dbConfig)
    .then(() => {
        console.log('Connected to the MySQL database');
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

// Set up routes
setRoutes(app);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});