// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const path = require('path');
// const crudRouter = require('./router/crud');
// const signinRouter = require('./router/signin');
// const uploadRouter = require('./router/upload');

// const { auth } = require('./middleware/authMiddleware');
// const { startAuctionScheduler } = require('./watch_products');

// // Start WebSocket server (port 8000)
// // require('./socket');

// const app = express();

// // Middleware
// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// // Serve static files from public folder
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// // Health check
// app.get('/', (req, res) => {
//     res.send({ status: 'ok', message: 'Backend API is running' });
// });

// // Public route
// app.use('/signin', signinRouter);

// // Upload route (protected - requires auth)
// app.use('/api/upload', auth, uploadRouter);

// // GET /api/* — public (no token needed to browse products/categories/etc.)
// // POST, PUT, PATCH, DELETE /api/* — protected (valid JWT required)
// const writeMethodAuth = (req, res, next) => {
//     if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
//         return auth(req, res, next);
//     }
//     next();
// };

// app.use('/api', writeMethodAuth, crudRouter);

// // Start cron-based auction scheduler
// startAuctionScheduler();

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// module.exports = app;














const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crudRouter = require('./router/crud');
const signinRouter = require('./router/signin');
const uploadRouter = require('./router/upload');
const bidsRouter = require('./router/socket');

const { auth } = require('./middleware/authMiddleware');
const { startAuctionScheduler } = require('./watch_products');

// require('./socket');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Backend API is running' });
});

// Public route
app.use('/signin', signinRouter);

// Upload route
app.use('/api/upload', auth, uploadRouter);

// NEW: bids API

// GET /api/* public
// POST, PUT, PATCH, DELETE /api/* protected
const writeMethodAuth = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return auth(req, res, next);
    }
    next();
};

app.use('/api/bids',writeMethodAuth, bidsRouter);
app.use('/api', writeMethodAuth, crudRouter);

startAuctionScheduler();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;