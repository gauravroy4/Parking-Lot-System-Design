const { Router } = require('express');
const { checkIn, checkOut, getAvailableSpots, createParkingSpot } = require('../controllers/parkingController');

const router = Router();

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/available-spots', getAvailableSpots);
router.post('/spots', createParkingSpot);

module.exports = router;
