const express = require('express');
const expressLayout = require('express-ejs-layouts');
const http = require('http');
const dotenv = require('dotenv');

// Set up port
const PORT = process.env.PORT || 8000;

// Template engine
const app = express();

// Set express framework
app.use(express.static('public'));
app.use(expressLayout);
app.set('layout', './layouts/index');
app.set('view engine', 'ejs');

// Routes
const router = express.Router();
router.get('/', (req, res) => res.redirect('/about'));
router.get('/about', (req, res) => res.render('about'));
router.get('/projects', (req, res) => res.render('projects'));
router.get('/resume', (req, res) => res.render('resume'));
router.get('/contacts', (req, res) => res.render('contacts'));
router.get('/*', (req, res) => res.render('unknown'));
app.use(router);

// HTTP server
const httpServer = http.createServer(app);

// Launch HTTP server
httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down servers...');
    const closeServer = (server) => new Promise((resolve) => server.close(resolve));
    try {
        await closeServer(httpServer);
        console.log('Server closed');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

