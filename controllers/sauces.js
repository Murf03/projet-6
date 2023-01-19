const { error } = require('console');
const fs = require('fs');
//const Sauce = require('../models/sauce');
const sauceModel = require('../models/sauce');
const logger = require('../conf/winston_conf');
require('dotenv').config();

const dir = `${process.env.DOWNLOAD_DIRECTORY_NAME}`;


exports.createSauce = (req, res, next) => {
    const sauceData = JSON.parse(req.body.sauce);
    delete sauceData._id;
    delete sauceData.userId;
    const sauce = new sauceModel
        ({
            userId: req.auth.userId,
            name: sauceData.name,
            manufacturer: sauceData.manufacturer,
            description: sauceData.description,
            mainPepper: sauceData.mainPepper,
            imageUrl: `${req.protocol}://${req.get('host')}/$/${req.file.filename}`,
            heat: sauceData.heat,
        });
    sauce.save()
        .then(() => {
            logger.info("Sauce ajoutée !");
            res.status(201).json({ message: 'Sauce ajoutée !' })
        })
        .catch(error => {
            logger.error(`Create sauce : Erreur ${error}`);
            res.status(400).json({ error })
        }
        );
}

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/${dir}/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    sauceModel
        .findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Non authorisé !' });
            } else {
                if (req.file) {
                    const filename = sauce.imageUrl.split(`/${dir}/`)[1];
                    fs.unlink(`${dir}/${filename}`, () => {
                        sauceModel
                            .updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                            .then(() => {
                                logger.info("Sauce modifiée !");
                                res.status(200).json({ message: 'Sauce modifiée !' })
                            })
                            .catch(error => {
                                logger.error(`Modify Sauce : Erreur ${error}`);
                                res.status(401).json({ error })
                            });
                    });
                }
                else {
                    sauceModel
                        .updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => {
                            logger.info("Sauce modifiée !");
                            res.status(200).json({ message: 'Sauce modifiée !' })
                        })
                        .catch(error => {
                            logger.error(`Modify Sauce : Erreur ${error}`);
                            res.status(401).json({ error })
                        });
                }
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
}

exports.findSauce = (req, res, next) => {
    sauceModel
        .findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => {
            logger.error(`Find Sauce : Erreur ${error}`);
            res.status(400).json({ error })
        });
}

exports.deleteSauce = (req, res, next) => {
    sauceModel
        .findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId == req.auth.userId) {
                const filename = sauce.imageUrl.split(`/${dir}/`)[1];
                fs.unlink(`${dir}/${filename}`, () => {
                    sauce.deleteOne({ _id: req.params.id })
                        .then(() => {
                            logger.info("Sauce supprimée :");
                            res.status(200).json({ message: 'Sauce supprimée !' })
                        })
                        .catch(error => {
                            logger.error(`Delete Sauce : Erreur ${error}`);
                            res.status(401).json({ error })
                        });
                });
            }
            else {
                logger.error(`Delete Sauce : Suppression non authorisée => ${error}`);
                res.status(403).json({ message: 'Suppression non authorisée' });
            }
        })
        .catch(error => {
            logger.error(`Delete Sauce : Erreur ${error}`);
            res.status(400).json({ error })
        });
}

exports.getSauces = (req, res, next) => {
    sauceModel
        .find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => {
            logger.error(`Get Sauces : Erreur ${error}`);
            res.status(400).json({ error })
        });
}

exports.like = (req, res, next) => {
    sauceModel
        .findOne({ _id: req.params.id })
        .then(sauce => {
            const data = req.body;
            switch (data.like) {
                case 0:
                    if (sauce.usersLiked.includes(data.userId)) {
                        const filt = sauce.usersLiked.filter(user => user != data.userId);
                        const likes = sauce.likes - 1;
                        sauceModel
                            .updateOne({ _id: req.params.id }, { usersLiked: filt, likes: likes })
                            .then(() => res.status(200).json({ message: 'Like retiré' }))
                            .catch(error => res.status(401).json({ error }));
                    }
                    else {
                        const filt = sauce.usersDisliked.filter(user => user != data.userId);
                        const dislikes = sauce.dislikes - 1;
                        sauceModel
                            .updateOne({ _id: req.params.id }, { usersDisliked: filt, dislikes: dislikes })
                            .then(() => res.status(200).json({ message: 'Dislike retiré' }))
                            .catch(error => res.status(401).json({ error }));
                    }
                    break;
                case 1:
                    let disFilt = sauce.usersDisliked;
                    let dislikes = sauce.dislikes;
                    let dislikedBefore = disFilt.includes(data.userId);
                    if (dislikedBefore) {
                        disFilt = sauce.usersDisliked.filter(user => user != data.userId);
                        dislikes--;
                    }
                    const likesArr = sauce.usersLiked;
                    likesArr.push(data.userId);
                    const likes = sauce.likes + 1;
                    if (dislikedBefore) {
                        sauceModel
                            .updateOne({ _id: req.params.id }, { usersLiked: likesArr, likes: likes, dislikes: dislikes, usersDisliked: disFilt })
                            .then(() => res.status(200).json({ message: 'Sauce likée' }))
                            .catch(error => res.status(401).json({ error }));
                    }
                    else {
                        sauceModel
                            .updateOne({ _id: req.params.id }, { usersLiked: likesArr, likes: likes })
                            .then(() => res.status(200).json({ message: 'Sauce likée' }))
                            .catch(error => res.status(401).json({ error }));
                    }
                    break;
                case -1:
                    let Filt = sauce.usersLiked;
                    let likess = sauce.likes;
                    let likedBefore = Filt.includes(data.userId);
                    if (likedBefore) {
                        Filt = sauce.usersLiked.filter(user => user != data.userId);
                        likess--;
                    }
                    const dislikesArr = sauce.usersDisliked;
                    dislikesArr.push(data.userId);
                    const dislikess = sauce.dislikes + 1;
                    if (likedBefore) {
                        sauceModel
                            .updateOne({ _id: req.params.id }, { usersLiked: Filt, likes: likess, dislikes: dislikess, usersDisliked: dislikesArr })
                            .then(() => res.status(200).json({ message: 'Sauce dislikée' }))
                            .catch(error => res.status(401).json({ error }));
                    }
                    else {
                        sauceModel
                            .updateOne({ _id: req.params.id }, { dislikes: dislikess, usersDisliked: dislikesArr })
                            .then(() => res.status(200).json({ message: 'Sauce dislikée' }))
                            .catch(error => res.status(401).json({ error }));
                    }
                    break;
                default:
                    break;
            }
        })
        .catch(error => res.status(400).json({ error }));
}