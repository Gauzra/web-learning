const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(
    process.cwd(),
    'uploads',
    'exercises'
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
            `exercise-${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (
        extension === '.pdf' ||
        extension === '.docx'
    ) {
        cb(null, true);
        return;
    }

    cb(
        new Error(
            'File harus berformat PDF atau DOCX'
        )
    );
};

const uploadExercise = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = uploadExercise;