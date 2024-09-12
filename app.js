require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');

const app = express();
const PORT = 8080 || process.env.PORT;

app.use(express.static('public'));

// Template engine
app.use(expressLayout);
app.set('layout', './layouts/index');
app.set('view engine', 'ejs');

app.use('/', require('./server/routes/main.js'));

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
