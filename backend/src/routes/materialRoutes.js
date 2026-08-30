const express = require('express');

const router = express.Router();

const {
    createMaterial,
    getLecturerMaterials,
    getStudentMaterials,
    getMaterialById,
    addMaterialFile,
    deleteMaterialFile,
    deleteMaterial
} = require('../controllers/materialController');

const {
    authenticate,
    authorize
} = require('../middleware/authMiddleware');

const uploadMaterial = require('../middleware/uploadMaterial');


router.get(
    '/',
    authenticate,
    authorize('lecturer'),
    getLecturerMaterials
);

router.get(
    '/student',
    authenticate,
    authorize('student'),
    getStudentMaterials
);


router.get(
    '/:id',
    authenticate,
    getMaterialById
);


router.post(
    '/',
    authenticate,
    authorize('lecturer'),
    uploadMaterial.single('file'),
    createMaterial
);

router.post(
    '/:materialId/files',
    authenticate,
    authorize('lecturer'),
    uploadMaterial.single('file'),
    addMaterialFile
);

router.delete(
    '/:id',
    authenticate,
    authorize('lecturer'),
    deleteMaterial
);

router.delete(
    '/:materialId/files/:fileId',
    authenticate,
    authorize('lecturer'),
    deleteMaterialFile
);


module.exports = router;
