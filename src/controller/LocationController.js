const pool = require('../config/db');


exports.insLocation = (req, res) => {

    const currentTime = new Date();
    const formattedDate = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    const { title, longitude, latitude } = req.body;

    pool.query(`INSERT INTO location_checkin (lo_title, lo_longitude, lo_latitude, lo_create_at,lo_create_by) VALUES 
    ('${title}', '${longitude}', '${latitude}', '${formattedDate}', 'admin')`)
        .then(() => {
            res.status(201).json({ msg: "success" });
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
}


exports.getLocation = (req, res) => {
    const { active,startDate, endDate, title, longitude, latitude, perPage, page } = req.query

    let sql = `SELECT * FROM location_checkin WHERE 1=1 `; // กำหนดค่าตัวแปร sql ให้ถูกต้อง


    if (active) {
        sql += `AND lo_active = '${active}'`;
    }
    if (title) {
        sql += `AND lo_title = '${title}'`;
    }
    if (longitude) {
        sql += `AND lo_longitude = '${longitude}'`;
    }
    if (latitude) {
        sql += `AND  lo_latitude = '${latitude}'`;
    }
    if (startDate && endDate) {
        sql += ` AND lo_create_at BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (perPage && page) {
        const skip = (page - 1) * perPage;
        sql += ` OFFSET '${skip}' ROWS 
            FETCH NEXT '${perPage}' ROWS ONLY`;
    }

    pool.query(sql)
        .then(results => {
            // ส่งข้อมูลผู้ใช้กลับไปยัง client ในรูปแบบ JSON
            res.status(200).json(results.rows);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};
exports.countLocation = async (req, res) => {
    const { startDate, endDate } = req.query;
    let sql = `SELECT Count(lo_id) FROM location_checkin  WHERE 1=1`;

    if (startDate && endDate) {
        sql += ` AND lo_create_at BETWEEN '${startDate}' AND '${endDate}'`;
    }

    await pool.query(sql)
        .then((response) => {
            return res.status(200).send(response.rows[0].count);
        }).catch((err) => {
            return res.status(500).json(err);
        })

};


exports.getLocationById = (req, res) => {
    const { id } = req.params
    let sql = `SELECT * FROM location_checkin WHERE lo_id='${id}'`;

    pool.query(sql)
        .then(results => {
            // ส่งข้อมูลผู้ใช้กลับไปยัง client ในรูปแบบ JSON
            res.status(200).json(results.rows);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};
exports.getLocationCheckin = (req, res) => {
    let sql = `SELECT * FROM location_checkin WHERE lo_active = TRUE ORDER BY lo_id ASC LIMIT 1`;

    pool.query(sql)
        .then(results => {
            // ส่งข้อมูลผู้ใช้กลับไปยัง client ในรูปแบบ JSON
            res.status(200).json(results.rows);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};

exports.updateLocationById = (req, res) => {
    const { id } = req.params;
    const { status, title, longitude, latitude } = req.body;

    const currentTime = new Date();
    const formattedDate = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    let sql = `UPDATE location_checkin SET lo_update_at='${formattedDate}'`;
    if (status === true || status === false) {
        sql += ` , lo_active='${status}' `;
    }
    if (title && longitude && latitude) {
        sql += ` , lo_title='${title}' `;
        sql += ` , lo_longitude='${longitude}' `;
        sql += ` , lo_latitude='${latitude}' `;
    }
    sql += ` WHERE lo_id = '${id}'`;

    pool.query(sql)
        .then(results => {
            res.status(200).send(results.rows);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};
