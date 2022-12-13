const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const userModel = require('../models/user');

exports.signUp = (req, res, next) => {
    const mailTest = cryptoJS.MD5(req.body.email).toString();
    bcrypt.hash(req.body.password, Number(process.env.HASH_SALT))
        .then(hash => {
            const user = new userModel({
                email: mailTest,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}

exports.logIn = (req, res, next) => {
    const mailTest = cryptoJS.MD5(req.body.email).toString();
    userModel.findOne({ email: mailTest })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_SIGN_KEY,
                            { expiresIn: process.env.TOKEN_EXPIRE_IN }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};