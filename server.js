const express = require('express');
const expressLayout = require('express-ejs-layouts');

const PORT = process.env.PORT || 8080;

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

module.exports = router;

// Start server
app.use(router)

app.listen(PORT, () => {
    console.log();
});
