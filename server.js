const express = require('express');
const expressLayout = require('express-ejs-layouts');
const https = require('https');
const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 443;
const HTTP_PORT = 80; // for redirection

// SSL certificate and key
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/fostidich.it/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/fostidich.it/fullchain.pem'),
};

// Template engine
const app = express();
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

// Create HTTPS server
const httpsServer = https.createServer(options, app);

// Start HTTPS server
httpsServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT} for HTTPS`);
});

// Create HTTP server
const httpServer = http.createServer((req, res) => {
    res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
    res.end();
});

// Start HTTP server
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server running on port ${HTTP_PORT}, redirecting to HTTPS.`);
});

