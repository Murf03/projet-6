const multer = require('multer');
const fs = require('fs')

const dir = `./${process.env.DOWNLOAD_DIRECTORY_NAME}`;

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, process.env.DOWNLOAD_DIRECTORY_NAME);
    },
    filename: (req, file, callback) => {

        const name = file.fieldname + '-'; // + req.auth.userId + '-'; peut être crypter l'ID
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage: storage }).single('image');