const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crudRouter = require('./router/crud');

const app = express();

// Middleware
// app.use(cors());
app.use(cors({
    origin: '*',             // Allow requests from any origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization']        // Allowed headers
}));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple health check
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Backend API is running' });
});

// Mount the generic CRUD router
app.use('/api', crudRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
