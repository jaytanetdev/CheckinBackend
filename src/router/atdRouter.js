
const express = require('express');
const router = express.Router();
const atdController = require('../controller/atdController');


router.post('/insAttendance', atdController.insAttendance);
router.patch('/updateAttendance/:atdId', atdController.updateAttendance);
router.get('/checkDateAttendance', atdController.checkDateAttendance);
router.get('/getAttendance', atdController.getAttendance);
router.get('/countAttendance', atdController.countAttendance);
router.get('/countDocAllAtd', atdController.countDocAllAtd);


module.exports = router;

