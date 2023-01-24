const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require("helmet");
const mongo_sanitize = require('express-mongo-sanitize');
const logger = require('./conf/winston_conf');
require('dotenv').config();

const SaucesRoutes = require('./routes/sauces');
const UsersRoutes = require('./routes/users');

const limiter = rateLimit({
    windowMs: Number(process.env.LIM_MINS) * 60 * 1000,
    max: Number(process.env.LIM_MAX),
    standardHeaders: true,
    legacyHeaders: false,
});

logger.info("Init");
//.env pour url
mongoose.connect(process.env.DB_LINK,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => logger.info('Connexion à MongoDB réussie !'))
    .catch((err) => logger.error('Connexion à MongoDB échouée !' + err));

const app = express();


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(cors());
app.use(express.json()); //permet de gérer les données postées par un formulaire
app.use(express.urlencoded({ extended: true }));

app.use(limiter);

app.use(mongo_sanitize()); //permet d'éviter l'injection de code

app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));

app.use('/api/sauces', SaucesRoutes);

app.use('/api/auth', UsersRoutes);

const images = `${process.env.DOWNLOAD_DIRECTORY_NAME}`;
app.use(`/${images}`, express.static(path.join(__dirname, images)));


module.exports = app;