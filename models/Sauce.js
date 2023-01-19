const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, minLength: 3, maxLength: 25 },
    name: { type: String, required: true, minLength: 3, maxLength: 25 },
    manufacturer: { type: String, required: true, minLength: 3, maxLength: 15 },
    description: { type: String, required: true, minLength: 3, maxLength: 120 },
    mainPepper: { type: String, required: true, minLength: 3, maxLength: 20 },
    imageUrl: { type: String, required: true, minLength: 10 },
    heat: { type: Number, required: true, min: 1, max: 10 },
    likes: { type: Number, required: true, default: 0, min: 0 },
    dislikes: { type: Number, required: true, default: 0, min: 0 },
    usersLiked: { type: Array },
    usersDisliked: { type: Array },
});

module.exports = mongoose.model('Sauce', sauceSchema);