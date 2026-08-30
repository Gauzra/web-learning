const express = require('express');
const { getMaterialsWithExercises, getExerciseGrading } = require('../controllers/penilaianController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/materials', authenticate, authorize('lecturer'), getMaterialsWithExercises);
router.get('/exercise/:exerciseId', authenticate, authorize('lecturer'), getExerciseGrading);

module.exports = router;
