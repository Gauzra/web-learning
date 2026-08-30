const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const uploadExercise = require('../middleware/uploadExercise');

const exerciseController = require('../controllers/exerciseController');

console.log(
    'AUTHENTICATE:',
    typeof authMiddleware.authenticate
);

console.log(
    'UPLOAD EXERCISE:',
    typeof uploadExercise
);

console.log(
    'CREATE EXERCISE:',
    typeof exerciseController.createExercise
);

console.log(
    'GET EXERCISES:',
    typeof exerciseController.getExercisesByMaterial
);

console.log(
    'GET EXERCISE:',
    typeof exerciseController.getExerciseById
);

console.log(
    'UPDATE EXERCISE:',
    typeof exerciseController.updateExercise
);

console.log(
    'DELETE EXERCISE:',
    typeof exerciseController.deleteExercise
);

router.post(
    '/',
    authMiddleware.authenticate,
    uploadExercise.single('file'),
    exerciseController.createExercise
);

router.get(
    '/material/:materialId',
    authMiddleware.authenticate,
    exerciseController.getExercisesByMaterial
);

router.get(
    '/summary',
    authMiddleware.authenticate,
    authMiddleware.authorize('lecturer'),
    exerciseController.getLecturerExerciseSummary
);

router.get(
    '/:id',
    authMiddleware.authenticate,
    exerciseController.getExerciseById
);

router.post(
    '/:id/reparse',
    authMiddleware.authenticate,
    authMiddleware.authorize('lecturer'),
    exerciseController.reparseExercise
);

router.put(
    '/:id/questions/:questionId/correct-answer',
    authMiddleware.authenticate,
    authMiddleware.authorize('lecturer'),
    exerciseController.updateCorrectAnswer
);

router.patch(
    '/:id/publication',
    authMiddleware.authenticate,
    authMiddleware.authorize('lecturer'),
    exerciseController.updateExercisePublication
);

router.post(
    '/:id/submit',
    authMiddleware.authenticate,
    authMiddleware.authorize('student'),
    exerciseController.submitAttempt
);

router.get(
    '/:id/attempts',
    authMiddleware.authenticate,
    authMiddleware.authorize('lecturer'),
    exerciseController.getExerciseAttempts
);

router.put(
    '/:id',
    authMiddleware.authenticate,
    exerciseController.updateExercise
);

router.delete(
    '/:id',
    authMiddleware.authenticate,
    exerciseController.deleteExercise
);

module.exports = router;
