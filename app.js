const express = require('express');
const mongoose = require('mongoose');

const SauceModel = require('./models/Sauce');


//.env pour url
mongoose.connect('mongodb+srv://murf:Murphy123@p6oc.fwz5unu.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((err) => console.log('Connexion à MongoDB échouée !' + err));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
var cors = require('cors');
app.use(cors());

app.post('/api/auth/signup', (req, res, next) => {
    console.log(req.body);
    res.status(201)
    res.json({
        message: 'Compte créé'
    });
});

app.post('/api/auth/login', (req, res, next) => {
    console.log(req.body);
    res.status(200).json({
        message: 'vous êtes Connecté.e'
    });
});

app.post('/api/sauces', (req, res, next) => {
    console.log(req.body);
    const sauce = new SauceModel({
        ...req.body
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce ajoutée !' }))
        .catch(error => res.status(400).json({ error }));
});

app.get('/api/sauces/:id', (req, res, next) => {
    SauceModel.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
});

app.delete('/api/sauces/:id', (req, res, next) => {
    SauceModel.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
});

app.get('/api/sauces', (req, res, next) => {
    SauceModel.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
});

app.get('/api/sauces/:id/like', (req, res, next) => {
    SauceModel.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
    next();
});

// app.put('/api/sauces/:id', (req, res, next) => {
//     SauceModel.findOne({ _id: req.params.id })
//         .then(sauce => res.status(200).json(sauce))
//         .catch(error => res.status(400).json({ error }));
// });

module.exports = app;