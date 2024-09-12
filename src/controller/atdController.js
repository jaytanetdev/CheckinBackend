const pool = require('../config/db');

exports.insAttendance = (req, res) => {
    const { userId, dateATD, timeCheckIn, timeCheckOut, longitude, latitude, typeCheckin, locationCheckin,  detail } = req.body;

    // ตรวจสอบและกำหนดค่าเริ่มต้นให้กับ timeCheckIn และ timeCheckOut
    const checkedTimeCheckIn = timeCheckIn ? `'${timeCheckIn}'` : 'null';
    const checkedTimeCheckOut = timeCheckOut ? `'${timeCheckOut}'` : 'null';
    const detailValue = detail ? `'${detail}'` : 'null';


    pool.query(`INSERT INTO attendance (atd_user_id, atd_date, atd_time_checkin, atd_time_checkout, atd_longitude, atd_latitude,atd_type_checkin,atd_location_checkin,atd_detail) VALUES 
    ('${userId}', '${dateATD}', ${checkedTimeCheckIn}::time, ${checkedTimeCheckOut}::time, '${longitude}', '${latitude}', '${typeCheckin}', '${locationCheckin}',  ${detailValue})`)
        .then(results => {
            res.status(200).json({ msg: "success" });
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};
exports.updateAttendance = (req, res) => {
    const { atdId } = req.params;
    const { timeCheckIn, timeCheckOut } = req.body;
    let sql = `UPDATE attendance SET`;
    if (timeCheckIn) {
        sql += ` atd_time_checkin='${timeCheckIn}', `;
    }
    if (timeCheckOut) {
        sql += ` atd_time_checkout='${timeCheckOut}', `;
    }
    sql = sql.slice(0, -2);
    sql += ` WHERE atd_id = '${atdId}'`;

    pool.query(sql)
        .then(results => {
            res.status(200).json({ msg: "Update Success" });
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};
exports.getAttendance = (req, res) => {
    const { userId, startDate, endDate, perPage, page } = req.query;
    let sql = `SELECT * FROM attendance a
                LEFT JOIN users b ON a.atd_user_id = b.user_id
                 WHERE 1=1 `;
    if (userId) {
        sql += ` AND atd_user_id='${userId}'`;
    }

    if (startDate && endDate) {
        sql += ` AND atd_date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    const skip = (page - 1) * perPage;

    sql += `OFFSET '${skip}' ROWS 
            FETCH NEXT '${perPage}' ROWS ONLY`;

    pool.query(sql)
        .then(results => {

            res.status(200).json(results.rows);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};
exports.checkDateAttendance = (req, res) => {
    const { userId, dateATD } = req.query;
    let sql = `SELECT * FROM attendance count WHERE atd_date='${dateATD}' AND atd_user_id='${userId}'`;
    pool.query(sql)
        .then(results => {
            res.status(200).json(results.rows);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};

exports.countDocAllAtd = async (req, res) => {
    const { userId, startDate, endDate } = req.query;
    let sql = `SELECT Count(atd_id) as count FROM attendance count WHERE 1=1 `;
    if (userId) {
        sql += ` AND atd_user_id='${userId}'`;
    }
    if (startDate && endDate) {
        sql += ` AND atd_date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    pool.query(sql)
        .then(results => {
            res.status(200).send(results.rows[0].count);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};

exports.countAttendance = async (req, res) => {
    const { userId, startDate, endDate } = req.query;
    let sqlCheck = `SELECT Count(atd_user_id) FROM attendance count WHERE 1=1`;
    if (userId) {
        sqlCheck = `SELECT Count(atd_user_id) FROM attendance count WHERE atd_user_id='${userId}'`
    }

    let sqlCheckin = `${sqlCheck} AND atd_time_checkin NOTNULL `;
    if (startDate && endDate) {
        sqlCheckin += ` AND atd_date BETWEEN '${startDate}' AND '${endDate}'`;
    }


    let sqlCheckOut = `${sqlCheck} AND atd_time_checkout NOTNULL `;
    if (startDate && endDate) {
        sqlCheckOut += ` AND atd_date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    let sqlLate = `${sqlCheck} AND atd_time_checkin NOTNULL AND atd_time_checkin > '09:00' `;
    if (startDate && endDate) {
        sqlLate += ` AND atd_date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    const checkIn = await pool.query(sqlCheckin)
    const checkOut = await pool.query(sqlCheckOut)
    const late = await pool.query(sqlLate)
    res.status(200).json({
        checkIn: checkIn.rows[0].count,
        checkOut: checkOut.rows[0].count,
        late: late.rows[0].count
    });
};
