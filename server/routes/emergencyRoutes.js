const express = require('express');
const {
  createEmergency,
  getEmergencies,
  getEmergencyById,
  getNearbyEmergencies,
  respondToEmergency,
  updateEmergencyStatus,
  addNote,
} = require('../controllers/emergencyController');
const { protect, volunteerOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getEmergencies)
  .post(protect, createEmergency);

router.get('/nearby', protect, volunteerOrAdmin, getNearbyEmergencies);

router.route('/:id')
  .get(protect, getEmergencyById);

router.put('/:id/respond', protect, volunteerOrAdmin, respondToEmergency);
router.put('/:id/status', protect, volunteerOrAdmin, updateEmergencyStatus);
router.post('/:id/notes', protect, addNote);

module.exports = router;