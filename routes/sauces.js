const express = require('express');
const auth = require('../middleware/auth');

const multer = require('../middleware/multer-config');

const router = express.Router();

const sauceCtrl = require('../controllers/sauces');

router.post('/', auth, multer, sauceCtrl.createSauce);

router.put('/:id', auth, multer, sauceCtrl.modifySauce);

router.get('/:id', auth, sauceCtrl.findSauce);

router.delete('/:id', auth, sauceCtrl.deleteSauce);

router.get('/', auth, sauceCtrl.getSauces);

router.post('/:id/like', auth, sauceCtrl.like);

module.exports = router;