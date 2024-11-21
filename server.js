const express = require('express');
const expressLayout = require('express-ejs-layouts');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Set up HTTPS port and HTTP for redirection
const PORT = process.env.PORT || 443;
const HTTP_PORT = 80;

// SSL certificate and key
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/fostidich.it/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/fostidich.it/fullchain.pem'),
};

// Log file set up
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
const logFile = path.join(logsDir, 'error.log');
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '', { flag: 'w' });
}

// Log function definition for appending error traces
function appendLog(err) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${err.name}: ${err.message}`);
    fs.appendFile(logFile, `[${timestamp}] ${err.stack}\n\n`, (writeErr) => {
        if (writeErr) console.error(`[${timestamp}] Error writing to log file -`, err);
    });
}

// Template engine
const app = express();
app.use(express.static('public'));
app.use(expressLayout);
app.set('layout', './layouts/index');
app.set('view engine', 'ejs');

// Middleware to handle URL decoding errors
app.use((req, res, next) => {
    try {
        decodeURIComponent(req.path);
        next();
    } catch (err) {
        appendLog(err);
        res.status(400).send(`Invalid URL: ${err.name}\n`);
    }
});

// Error and log management
app.use((err, req, res, next) => {
    if (err) appendLog(err);
    res.status(500).send(`Internal Server Error: ${err.name}\n`);
});

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
