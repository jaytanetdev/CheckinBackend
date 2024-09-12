const pool = require('../config/db');
var { getDownloadURL, ref, uploadBytes } = require('firebase/storage');
var { imagedb } = require('../config/dbFirebase');
const { format } = require('date-fns');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
exports.insAdvert = (req, res) => {
    const { title, dateStart, dateEnd, detail, fileName, linkFile } = req.body;

    const formattedDateEnd = format(new Date(dateEnd), 'yyyy-MM-dd');
    const formattedDateStart = format(new Date(dateStart), 'yyyy-MM-dd');

    pool.query(`INSERT INTO advert (adv_title, adv_date_start, adv_date_end, adv_status, adv_fileName, adv_detail, adv_linkfile) 
    VALUES  ('${title}', '${formattedDateStart}', '${formattedDateEnd}', true ,'${fileName}','${detail}', '${linkFile}')`)
        .then(results => {
            res.status(200).json({ msg: "success" });
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};


exports.getAdvert = (req, res) => {
    const { startDate, endDate, perPage, page } = req.query;
    const skip = (page - 1) * perPage;
    if (!perPage || !page) {
        res.status(404).json({ msg: "Please send perPage and page" })
        return
    }
    let sql = `SELECT * FROM advert  WHERE 1=1 `;
    if (startDate && endDate) {
        sql += ` AND (adv_date_start BETWEEN '${startDate}' AND '${endDate}'
        OR  adv_date_end BETWEEN '${startDate}' AND '${endDate}')`;
    }
    sql += `OFFSET '${skip}' ROWS 
            FETCH NEXT '${perPage}' ROWS ONLY`;

    pool.query(sql)
        .then(results => {
            res.status(200).json(results.rows);
        })
        .catch(error => {
            res.status(500).json(error);
        })
};
exports.getAdvertHomePage = (req, res) => {
    const dateNow = format(new Date(), 'yyyy-MM-dd')
    let sql = `SELECT * FROM advert  WHERE 1=1 AND adv_status = true `;
    sql += ` AND (adv_date_start <= '${dateNow}'  AND  adv_date_end >= '${dateNow}' )`;
    pool.query(sql)
        .then(results => {
            res.status(200).json(results.rows);
        })
        .catch(error => {
            res.status(500).json(error);
        })
};
exports.getAdvertHomePageById = (req, res) => {
    const advId = req.params.advId;


    let sql = `SELECT * FROM advert WHERE adv_id = '${advId}'  `;

    console.log(sql)
    pool.query(sql)
        .then(results => {
            res.status(200).json(results.rows);
        })
        .catch(error => {
            res.status(500).json(error);
        })
};

exports.advertById = (req, res) => {
    const { advId } = req.params;

    let sql = `SELECT * FROM advert  WHERE adv_id= ${advId}`;
    pool.query(sql)
        .then(results => {
            res.status(200).json(results.rows);
        })
        .catch(error => {
            res.status(500).json(error);
        })
};

exports.countDocAllAdvert = (req, res) => {
    const { startDate, endDate } = req.query;
    let sql = `SELECT Count(adv_id) as count FROM advert count WHERE 1=1 `;
    // if (startDate && endDate) {
    //     sql += ` AND adv_date BETWEEN '${startDate}' AND '${endDate}'`;
    // }
    pool.query(sql)
        .then(results => {
            res.status(200).send(results.rows[0].count);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};

exports.updateAdvertById = (req, res) => {
    const { advId } = req.params;
    const { status, title, dateStart, dateEnd, fileName, linkFile, detail } = req.body;

    const currentTime = new Date();
    const formattedDate = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    let sql = `UPDATE advert SET adv_update_at='${formattedDate}'`;
    if (status === true || status === false) {
        sql += ` , adv_status='${status}' `;
    }
    if (title && dateStart && dateEnd && fileName && linkFile && detail) {
        const formattedDateStart = format(new Date(dateStart), 'yyyy-MM-dd');
        const formattedDateEnd = format(new Date(dateEnd), 'yyyy-MM-dd');
        sql += ` , adv_title='${title}' `;
        sql += ` , adv_date_start='${formattedDateStart}' `;
        sql += ` , adv_date_end='${formattedDateEnd}' `;
        sql += ` , adv_fileName='${fileName}' `;
        sql += ` , adv_linkfile='${linkFile}' `;
        sql += ` , adv_detail='${detail}' `;
    }
    sql += ` WHERE adv_id = '${advId}'`;

    pool.query(sql)
        .then(results => {
            res.status(200).send(results.rows);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};


function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.uploadImage2Firebase = async (req, res) => {
    const files = req.files;
    const { path } = req.params
    const arrayFile = [];

    for (const value of files) {
        const arrayMimetype = value.mimetype.split("/");
        const randomString = generateRandomString(8);
        const currentDate = format(new Date(), 'ddMMyyyy'); // กำหนดรูปแบบของวันที่ในรูปแบบ "วัน-เดือน-ปี"
        const customNameFile = currentDate + '_' + randomString + "." + arrayMimetype[1];

        const imgRef = ref(imagedb, `${path}/${customNameFile}`);
        await uploadBytes(imgRef, value.buffer, { contentType: value.mimetype }); // แก้ไขจาก value เป็น value.buffer
        const urlfile = await getDownloadURL(imgRef);

        const fileData = {
            uid: customNameFile, // ใช้ชื่อไฟล์เป็น uid
            name: customNameFile, // ใช้ชื่อเดิมของไฟล์
            status: 'done', // สถานะเสร็จสิ้น
            url: urlfile, // URL ของไฟล์ที่อัปโหลด
            thumbUrl: urlfile, // URL ของรูปขนาดย่อ (ถ้ามี)
        };
        arrayFile.push(fileData);
    }
    return res.status(200).json({ arrayFile });
}




// exports.deletefileAdvert = (req, res) => {
//     const filename = req.params.filename; // รับชื่อไฟล์ที่ต้องการลบจากพารามิเตอร์ของ URL
//     const path = req.params.path; // รับชื่อไฟล์ที่ต้องการลบจากพารามิเตอร์ของ URL
//     const filePath = `uploads/${path}/${filename}`; // กำหนดตำแหน่งของไฟล์ที่ต้องการลบ

//     // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
//     fs.access(filePath, fs.constants.F_OK, (err) => {
//         if (err) {
//             // ถ้าไม่พบไฟล์
//             console.error(err);
//             return res.status(404).json({ message: 'File not found.' });
//         }

//         // ลบไฟล์
//         fs.unlink(filePath, (err) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ message: 'Failed to delete file.' });
//             }
//             res.json({ message: 'File deleted successfully.' });
//         });
//     });
// };


// exports.uploadAdvert = async (req, res) => {
//     const uploadedFiles = req.files; // ไฟล์ที่อัปโหลดได้จากเซิร์ฟเวอร์
//     // สร้างข้อมูล JSON สำหรับแต่ละไฟล์ที่อัปโหลด
//     const fileList = [];
//     try {
//         for (const file of uploadedFiles) {
//             const commitMessage = 'Upload file ' + file.filename;
//             const fileContent = fs.readFileSync(file.path); // อ่านข้อมูลจากไฟล์ที่อัปโหลด
//             const response = await uploadToGitHub('uploads/advert', file.filename, fileContent, commitMessage);

//             const fileData = {
//                 uid: file.filename, // ใช้ชื่อไฟล์เป็น uid
//                 name: file.originalname, // ใช้ชื่อเดิมของไฟล์
//                 status: 'done', // สถานะเสร็จสิ้น
//                 url: response.data.content.html_url, // URL ของไฟล์ที่อัปโหลด
//                 thumbUrl: response.data.content.html_url, // URL ของรูปขนาดย่อ (ถ้ามี)
//             };
//             console.log(response.data.content.download_url)
//             fileList.push(fileData);
//         }
//         // ส่งข้อมูล JSON กลับไปยังผู้ใช้
//         res.status(200).json(fileList);
//     } catch (error) {
//         console.error('Error uploading file to GitHub:', error.response.data.message);
//         res.status(500).json({ message: 'Failed to upload file to GitHub' });
//     }
// };

// // สร้างฟังก์ชันสำหรับการอัปโหลดไฟล์ไปยัง GitHub
// async function uploadToGitHub(filePath, fileName, fileContent, commitMessage) {
//     const username = 'jaytanet08';
//     const repository = 'backend';
//     const token = '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';

//     try {
//         const url = `https://api.github.com/repos/${username}/${repository}/contents/${filePath}/${fileName}`;
//         const content = Buffer.from(fileContent).toString('base64');

//         const response = await axios.put(url, {
//             message: commitMessage,
//             content: content,
//         }, {
//             headers: {
//                 Authorization: `token ${token}`,
//             },
//         });

//         return response;
//     } catch (error) {
//         throw error;
//     }
// }

// exports.readFile = async (req, res) => {
//     try {
//         const filePath = path.join(__dirname, '../uploads/' + req.params.path + '/' + req.params.filename); // เปลี่ยนชื่อไฟล์ตามที่เหมาะสม
//         return res.sendFile(filePath);
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).send('Internal Server Error');
//     }
// };

