const express = require('express');
const expressLayout = require('express-ejs-layouts');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Set up HTTPS port and HTTP for redirection
const PORT = process.env.PORT || 443;
const HTTP_PORT = 80;

// SSL certificate and key
dotenv.config();
const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    secureOptions: require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1,
    ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256',
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
const reqFile = path.join(logsDir, 'request.log');
if (!fs.existsSync(reqFile)) {
    fs.writeFileSync(reqFile, '', { flag: 'w' });
}

// Rotate the log file if it's too large
function rotateLogFile(filename) {
    const maxFileSize = 20 * 1024 * 1024;
    fs.stat(filename, (err, stats) => {
        if (err) {
            console.error('Error checking log file size', err);
            return;
        }
        if (stats && stats.size > maxFileSize) {
            const archivedFile = path.join(logDir, `old_${filename}`);
            if (!fs.existsSync(archivedFile)) {
                fs.remove(archivedFile);
            }
            fs.rename(filename, archivedFile, (renameErr) => {
                if (renameErr) {
                    console.error('Error rotating log file', renameErr);
                } else {
                    console.log('Log file rotated:', archivedFile);
                }
            });
        }
    });
}

// Log function definition for appending error traces
function appendLog(err) {
    rotateLogFile('error.log');
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${err.name}`);
    fs.appendFile(logFile, `[${timestamp}] ${err.stack}\n\n`, (writeErr) => {
        if (writeErr) console.error(`[${timestamp}] (Error writing to log file)`, err);
    });
}

// Template engine
const app = express();

// Debugging requests log
app.use((req, res, next) => {
    rotateLogFile('request.log');
    const timestamp = new Date().toISOString();
    fs.appendFile(reqFile, `[${timestamp}] ${req.method} ${req.url}\n`, (writeErr) => {
        if (writeErr) console.error(`[${timestamp}] (Error writing to request file)`, `${req.method} ${req.url}`);
    });
    next();
});

// Middleware to handle errors
app.use((req, res, next) => {
    // Validate method first
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!validMethods.includes(req.method)) {
        console.error('Invalid method:', req.method);
        res.status(405).send('Method Not Allowed\r\n');
        return;
    }

    // Decode the URI
    try {
        decodeURIComponent(req.path);
        next();
    } catch (err) {
        appendLog(err);
        res.status(400).send('Invalid URL\r\n');
    }
});

// Error and log management
app.use((err, req, res, next) => {
    appendLog(err);
    res.status(500).send(`Internal Server Error\r\n`);
});

// Enforce HTTPS for future requests
app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
}));

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

// HTTPS server
const httpsServer = https.createServer(options, app);
httpsServer.setTimeout(10000);

// Manage client error events by closing the socket
httpsServer.on('clientError', (err, socket) => {
    appendLog(err);
    if (socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    } else {
        socket.destroy();
    }
});

// Launch HTTPS server
httpsServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT} for HTTPS`);
});

// HTTP server
const httpServer = http.createServer((req, res) => {
    res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}`});
    res.end();
});
httpServer.setTimeout(10000);

// Manage client error events by closing the socket
httpServer.on('clientError', (err, socket) => {
    appendLog(err);
    if (socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    } else {
        socket.destroy();
    }
});

// Launch HTTP server
httpServer.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT} for HTTP, redirecting to HTTPS`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down servers...');
    const closeServer = (server) => new Promise((resolve) => server.close(resolve));
    try {
        await closeServer(httpsServer);
        console.log('HTTPS server closed');
        await closeServer(httpServer);
        console.log('HTTP server closed');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

