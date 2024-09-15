
const express = require('express');
const router = express.Router();
const LocationController = require('../controller/LocationController');



router.post('/insLocation', LocationController.insLocation);
router.get('/getCountLocation', LocationController.countLocation);
router.get('/getLocation', LocationController.getLocation);
router.get('/getLocationById/:id', LocationController.getLocationById);
router.get('/getLocationCheckin', LocationController.getLocationCheckin);
router.patch('/updateLocationById/:id', LocationController.updateLocationById);


module.exports = router;

