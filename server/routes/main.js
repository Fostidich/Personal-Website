const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/home');
});

router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/projects', (req, res) => {
    res.render('projects');
});

router.get('/resume', (req, res) => {
    res.render('resume');
});

router.get('/contacts', (req, res) => {
    res.render('contacts');
});

router.get('/*', (req, res) => {
    res.render('unknown');
});

module.exports = router;
