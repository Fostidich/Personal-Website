import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const PORT = 8080;

// __dirname and __filename definition
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Routes
app.get('/', (req, res) => res.redirect('/home'));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'pages', 'home.html')));
app.get('/music', (req, res) => res.sendFile(path.join(__dirname, 'pages', 'music.html')));
app.get('/projects', (req, res) => res.sendFile(path.join(__dirname, 'pages', 'projects.html')));

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
