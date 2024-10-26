const express = require('express');
const expressLayout = require('express-ejs-layouts');
const https = require('https');
const http = require('http');
const fs = require('fs');

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

// HTTPS server
const httpsServer = https.createServer(options, app);
httpsServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT} for HTTPS`);
});

// HTTP server
const httpServer = http.createServer((req, res) => {
    res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
    res.end();
});
httpServer.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT} for HTTP, redirecting to HTTPS`);
});
