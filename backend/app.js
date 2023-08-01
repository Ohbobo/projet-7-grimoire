const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const app = express();

const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');

mongoose.connect('mongodb+srv://agentheo:DpENWosEnRtghWhg@cluster0.5ge86ol.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use('/api/auth', userRoutes);
app.use('/api/books', bookRoutes);

module.exports = app;