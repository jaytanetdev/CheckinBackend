const pool = require('../config/db');


exports.insUser = (req, res) => {

    const currentTime = new Date();
    const formattedDate = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    const { username, password, name, lastname, type } = req.body;


    pool.query(`INSERT INTO users (username, password, name, lastname, type, create_at,create_by) VALUES 
    ('${username}', '${password}', '${name}', '${lastname}', '${type}', '${formattedDate}', 'admin')`)
        .then(() => {
            res.status(201).json({ msg: "success" });
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
}

exports.getUser = (req, res) => {
    const { startDate, endDate, type, username, password, perPage, page } = req.query
    let sql;
    if (type === "all") {
        sql = `SELECT * FROM users WHERE type='0'`;
    } else {
        sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
    }
    if (startDate && endDate) {
        sql += ` AND create_at BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (perPage && page) {
        const skip = (page - 1) * perPage;
        sql += `OFFSET '${skip}' ROWS 
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
exports.getUserById = (req, res) => {
    const { userId } = req.params
    let sql = `SELECT * FROM users WHERE user_id='${userId}'`;

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


exports.countUser = async (req, res) => {
    const { startDate, endDate } = req.query;
    let sql = `SELECT Count(user_id) FROM users  WHERE 1=1`;

    if (startDate && endDate) {
        sql += ` AND create_at BETWEEN '${startDate}' AND '${endDate}'`;
    }

    await pool.query(sql)
        .then((response) => {
            return res.status(200).send(response.rows[0].count);
        }).catch((err) => {
            return res.status(500).json(err);
        })

};

exports.updateUserById = (req, res) => {
    const { userId } = req.params;
    const { status, name, lastname, username } = req.body;

    const currentTime = new Date();
    const formattedDate = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    let sql = `UPDATE users SET update_at='${formattedDate}'`;
    if (status === true || status === false) {
        sql += ` , active='${status}' `;
    }
    if (name && lastname && username) {
        sql += ` , name='${name}' `;
        sql += ` , lastname='${lastname}' `;
        sql += ` , username='${username}' `;
    }
    sql += ` WHERE user_id = '${userId}'`;
    console.log(sql)
    pool.query(sql)
        .then(results => {
            res.status(200).send(results.rows);
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};