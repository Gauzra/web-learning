const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(
    process.cwd(),
    'uploads',
    'videos'
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const uniqueName =
            `video-${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = [
        '.mp4',
        '.webm',
        '.ogg',
        '.mov'
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
        return cb(
            new Error(
                'Format video yang diperbolehkan: MP4, WebM, OGG, atau MOV'
            )
        );
    }

    cb(null, true);
};

const uploadVideo = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024
    }
});

module.exports = {
    uploadVideo
};