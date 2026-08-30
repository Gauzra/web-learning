const express = require('express');

const router = express.Router();

const {
    createMaterialVideo,
    getMaterialVideos,
    deleteMaterialVideo
} = require('../controllers/materialVideoController');

const {
    authenticate,
    authorize
} = require('../middleware/authMiddleware');

const {
    uploadVideo
} = require('../middleware/videoUpload');

router.get(
    '/:materialId',
    authenticate,
    getMaterialVideos
);

router.post(
    '/:materialId',
    authenticate,
    authorize('lecturer'),
    uploadVideo.single('video'),
    createMaterialVideo
);

router.delete(
    '/:materialId/:videoId',
    authenticate,
    authorize('lecturer'),
    deleteMaterialVideo
);

module.exports = router;