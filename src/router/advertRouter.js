
const express = require('express');
const router = express.Router();
const advertController = require('../controller/advertController');
const multer = require('multer');
const storage = multer.memoryStorage(); // Store files in memory instead of disk
const upload = multer({ storage: storage });


router.post('/insAdvert', advertController.insAdvert);
router.patch('/updateAdvertById/:advId', advertController.updateAdvertById);
router.get('/getAdvert', advertController.getAdvert);
router.get('/getAdvert/showHomePage', advertController.getAdvertHomePage);
router.get('/getAdvert/showHomePageById/:advId', advertController.getAdvertHomePageById);
router.get('/advertById/:advId', advertController.advertById);
router.get('/countDocAllAdvert', advertController.countDocAllAdvert);
router.post('/uploadImage2Firebase/:path', upload.array('imageAdvert', 10), advertController.uploadImage2Firebase);



// router.post('/uploadImage/:path/:filename', advertController.uploadImage);

// router.delete('/deleteFile/:path/:filename', advertController.deletefileAdvert);
// router.get('/readFile/:path/:filename', advertController.readFile);

// // กำหนดชื่อไฟล์ที่อัปโหลด
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/advert'); // กำหนดโฟลเดอร์ที่ไฟล์จะถูกบันทึกไว้
//     },
//     filename: function (req, file, cb) {
//         const arrayMimetype = file.mimetype.split("/");
//         const randomString = generateRandomString(8);
//         const currentDate = format(new Date(), 'ddMMyyyy'); // กำหนดรูปแบบของวันที่ในรูปแบบ "วัน-เดือน-ปี"
//         cb(null, currentDate + '_' + randomString + "." + arrayMimetype[1]); // กำหนดชื่อไฟล์
//     }
// })



module.exports = router;

