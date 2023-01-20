const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const email_valid = require('email-validator');
const pw_valid = require('password-validator');

const userModel = require('../models/user');
const logger = require('../conf/winston_conf');

var schema = new pw_valid();

schema
    .is().min(3)
    .is().max(20)
    .has().uppercase()
    .has().lowercase()
    .has().digits(1)
    .has().not().spaces();
//.is().not().oneOf(['Passw0rd', 'Password123']);

exports.signUp = (req, res, next) => {
    if (email_valid.validate(req.body.email) && schema.validate(req.body.password)) {
        const mailTest = cryptoJS.HmacSHA256(req.body.email, process.env.EMAIL_SALT).toString();
        bcrypt.hash(req.body.password, Number(process.env.HASH_SALT))
            .then(hash => {
                const user = new userModel({
                    email: mailTest,
                    password: hash
                });
                user.save()
                    .then(() => {
                        logger.info("Utilisateur créé !");
                        res.status(201).json({ message: 'Utilisateur créé !' })
                    })
                    .catch(error => {
                        logger.error(`SignUp : Erreur ${error} `);
                        res.status(400).json({ error })
                    });
            })
            .catch(error => {
                logger.error(`SignUp : Erreur ${error} `);
                res.status(500).json({ error })
            });
    }
    else {
        logger.error("Email ou mot de passe non valide");
        res.status(400).json({ message: 'Email ou mot de passe non valide' })
    }
}

exports.logIn = (req, res, next) => {
    const mailTest = cryptoJS.HmacSHA256(req.body.email, process.env.EMAIL_SALT).toString();
    userModel.findOne({ email: mailTest })
        .then(user => {
            if (!user) {
                logger.error("LogIn : Erreur => Paire login/mot de passe incorrecte");
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        logger.error("LogIn : Erreur => Paire login/mot de passe incorrecte");
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    logger.info("Bien connecté.e !");
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_SIGN_KEY,
                            { expiresIn: process.env.TOKEN_EXPIRE_IN }
                        )
                    });
                })

                .catch(error => {
                    logger.error(`LogIn : Erreur ${error}`);
                    res.status(500).json({ error });
                });
        })
        .catch(error => {
            logger.error(`LogIn : Erreur ${error}`);
            res.status(500).json({ error });
        });
};